---
title: "Database Comparisons"
description: "Relational against document, MySQL against PostgreSQL, VoltDB, Spanner, and MongoDB against Cassandra"
section: "system-design"
order: 7
tags: ["databases", "mysql", "postgresql", "cassandra", "mongodb", "spanner"]
source:
  notes: ["notes/digital/pages/page-18.md", "notes/digital/pages/page-19.md", "notes/digital/pages/page-20.md", "notes/digital/pages/page-21.md", "notes/digital/pages/page-22.md"]
---

# Database Comparisons

## ==Relational against non-relational==

**Relational** has poor data locality in a distributed system. A normalised schema stores each
fact once and rebuilds anything larger out of joins. On a single machine that is close to free,
because the rows the join touches sit in the same buffer pool and the worst case is a seek. Spread
the same schema across a cluster and every join turns into network traffic. A customer, their
orders and the line items on those orders are partitioned by three different keys, which puts them
on three different machines. Assembling one order page then costs a round trip per hop, and the
page cannot render until the slowest of the three has returned. Whichever column you choose as the
partition key, there will be some query that wants to join across it. Choosing does not remove the
problem — it only decides which queries end up on the wrong side of it. Fan-out then multiplies
whatever is left, because a join that matches a hundred rows on the far side puts a hundred rows on
the wire regardless of how few of them the query goes on to keep.

**Non-relational** duplicates data, keeping relevant data together. That means
<u>denormalised</u> records, the whole document going over the network, and a better fit for
highly decoupled, disjoint, non-relational data.

Reads are then cheap. One round trip to one partition, coming back with everything the screen
needs already assembled, with no join planner to second-guess and no fan-out to reason about. Read
latency also stays flat as the cluster grows, because a bigger cluster puts no extra machines in
the path of any single read.

Updating anything duplicated is where it gets expensive. A fact copied into ten thousand documents
has to be updated in ten thousand places, and those places sit on different partitions with no
transaction spanning them. For some window the system holds both the old value and the new one,
with no way of telling you which documents have which. Reconciling that is the application's job;
the storage engine never knew the ten thousand copies were copies of anything. Editing a single
field can also mean rewriting and re-sending an entire document, because the document is the unit
the engine deals in.

## ==MySQL against PostgreSQL==

Common features: B-tree based indexes, single leader replication, configurable isolation levels.

|  | **MySQL** - two-phase locking | **PostgreSQL** - serialisable snapshot isolation |
|---|---|---|
| Mechanism | Every row carries locks | Transactions read from a snapshot |
| Reads | Read-only transactions take a shared lock | No lock taken |
| Writes | Must take an exclusive lock | Conflicts detected after the fact |
| On conflict | Deadlocks, which have to be detected and undone | A transaction that read a value another transaction modified before committing is rolled back |
| Style | Pessimistic | Optimistic |

The table above leaves out some history. PostgreSQL has implemented serialisable this way since
9.1, released September 2011. MySQL's own documentation never says "two-phase locking". It
describes InnoDB's SERIALIZABLE as converting "all plain SELECT statements to SELECT ... FOR
SHARE", with next-key locks to prevent phantoms, which is what the textbook label describes. The
label is accurate about the mechanism, but it is nobody's official name for it, which is why you
can find the behaviour fully documented and the phrase itself nowhere. InnoDB's *default* is
REPEATABLE READ, not SERIALIZABLE.[^3] The comparison in the table is therefore between two
configurations, only one of which you get by leaving the settings alone.

The conclusion is a short one. <u>Use SQL both for data that needs to be normalised and for data
that needs to be correct.</u> In theory SSI beats 2PL, but if there are <u>many conflicts</u> the
pessimistic approach may be better. An optimistic transaction that gets rolled back has already
done all of its work by the time it finds out, and the retry does that work over again, so the
wasted effort grows with the conflict rate. A lock makes the second transaction wait before it has
done any work at all, and waiting is cheap compared with doing the work twice. Where the crossover
sits depends on how often your transactions actually collide, and neither engine can tell you that
in advance. It is a fact about the workload.

## ==VoltDB==

### Actual serial execution

Running everything on one thread. The bottleneck is the HDD or the network. Nothing runs
concurrently, so there is no lock manager and no deadlock detector. There is no isolation level to
configure either, because one transaction runs to completion before the next one begins and
serialisability falls out of the schedule instead of being enforced on top of it. The design cannot
tolerate the thread waiting for anything, since a single stall holds up every transaction queued
behind it.

**Dealing with disk.** All data is stored in memory. Point lookups do not need ordered access, so
a hash index gives `O(1)` reads and writes. Durability, if it is wanted, comes from an optional WAL
and optional tree set backups, which sit off the read path entirely. Memory is the constraint that
follows. Less data fits per node than a disk-backed engine would hold, so the dataset is cut into
more partitions. More partitions mean more reads and writes that straddle two of them, and a
transaction touching two partitions can no longer be scheduled as one uninterrupted run on one
thread. Those need 2PL.

**Dealing with network latency.** Use stored procedures. A transaction written as a sequence of
client calls holds the single thread across every network round trip in the sequence, which is the
one thing the design cannot afford. Sending the logic to the data instead means the whole
transaction executes locally at memory speed and the client waits once. The price is that your
transaction logic now lives inside the database.

A very interesting approach to achieving ACID transactions without 2PL or SSI. It gets there by
giving up generality, twice over. The dataset has to fit in memory, and every transaction has to
arrive as a stored procedure rather than as a conversation between the client and the engine.
Neither of those is something you can switch off for a workload that does not suit it.



| Approach | How it serialises | What it needs |
|---|---|---|
| **Two-phase locking** | makes conflicting transactions wait | nothing special, and it deadlocks |
| **Serialisable snapshot isolation** | runs everything, aborts real conflicts | version storage, and a workload where conflicts are rare |
| **Actual serial execution** | one thread, no concurrency to control | the whole dataset in memory, and stored procedures |
| **TrueTime commit-wait** | orders by timestamp with a bounded error | GPS and atomic clocks in every datacentre |

## ==Spanner==

### Causally consistent distributed reads

If write B depends on write A, and a read contains write B, it must also contain write A.

It prevents a specific failure. A transaction writes comment 2, a second replies to it with comment
3, and a reader that sees comment 3 without comment 2 gets a reply to something that, as far as it
can tell, was never written. Causal consistency forbids that ordering.

Can snapshots solve this? Without a centralised system there is no way to know which snapshots to
send. Not sufficient.

The typical solution is 2PL: grab a lock on the rows. That is very slow, and it blocks writes
for as long as the locks are held.

Spanner allows causally consistent distributed reads without locks, using timestamps from Google
TrueTime. Any write that depends on another write gets a greater timestamp, so a reader that picks
a timestamp and takes everything at or below it ends up with a causally closed set without having
asked a single writer to stop.

**Part 1.** A write gets an interval `W1: [100, 102]` with uncertainty `Δ`. Wait `Δ`, then
commit. The actual timestamp is past 102. Call it `T1`.

The magnitude of `Δ` decides whether any of this is practical. TrueTime's uncertainty `ε`
"var[ies] from about 1 to 7 ms over each poll interval", averaging 4 ms.[^1] Commit-wait works at
that scale and would not work at the scale of seconds. Every write pays the wait, and it pays it
while still holding whatever it is holding, so `Δ` sets the floor on write latency and also fixes
how long a contended row goes on being contended. At a few milliseconds that is small enough to
hide inside a round trip the write was going to make in any case. Without clocks that can bound
their own error this tightly, though, `Δ` has to be widened to whatever worst case a
general-purpose time service is prepared to promise, and every write in the system then pays that
margin, including the overwhelming majority of writes for which the clock was never wrong.

**Part 2.** A read of W1 that writes to part 2 clearly happens after 102. `W2: [x, y]` where
`y > T1`. Wait `y - x` seconds, then commit, so `T2 > T1`.

<!-- FIGURE: CommitWait -->

`Δ` should be as low as possible. GPS and atomic clocks in the data centre get it down. Spanner
runs time master machines per datacentre, most with GPS receivers and the rest with atomic
clocks, using two references because they fail differently.[^1] The technique requires control of
the datacentre, which is why it stayed inside Google for years. The hardware itself is less exotic
than that suggests. In the paper's words, "an atomic clock is not that expensive: the cost of an
Armageddon master is of the same order as that of a GPS master".

## ==MongoDB against Apache Cassandra==

### MongoDB

B-trees, ACID transactions and single leader replication, which is the machinery of a relational
engine underneath. On top of it sits a <u>document-oriented data model</u> with a rich feature
set, and the flexibility that comes with it. Single leader replication means every write for a
given replica set goes through one node, so the ordering questions that make leaderless systems
awkward never come up here.

### Cassandra

A wide column data model, addressed by a cluster key and a sort key with a few other optionals
alongside them.

**Partitioning** is via the cluster key. Config is shared via gossip. All reads and writes
should go to one partition, and there is very little support for distributed transactions. Local
index with sort key in each partition. Very opinionated.

That opinionatedness is deliberate. The shape of every query is fixed when the table is declared.
The cluster key decides which machine answers, and the sort key fixes the order rows come back in,
with no second ordering available to you at read time. Queries that would need to visit every
partition, or sort at read time, are refused outright. A workload where each request touches
exactly one partition scales with the number of nodes, because no request ever waits on a machine
outside its own replica set. Permitting a join across partitions would also permit the query that
looks harmless in development and turns into a cluster-wide scan the week the table gets big.

Nodes sit on a hash ring and share cluster state peer to peer via gossip, which means there is no
coordinator node whose failure takes the cluster down with it.

**Replication** is leaderless, with read repair and anti-entropy via Merkle trees, and it is
configurable. Write conflicts resolve last-write-wins: "Cassandra uses a simpler last-write-wins
model where every mutation is timestamped (including deletes) and then the latest version of data
is the 'winning' value", formalised as an LWW-Element-Set CRDT per CQL row.[^2] That is a
deliberately simple rule, and a lossy one. Two concurrent writes to the same cell are settled by
comparing timestamps, the older one is thrown away, and the application is never told that a
conflict happened at all. Riak with CRDTs takes the other route, resolving concurrent writes in a
way that does not discard either of them.

**Single node** uses LSM-trees and SSTables, so it is write optimised. Only row-level locking,
no ACID transactions.



| | MongoDB | Cassandra |
|---|---|---|
| Index structure | B-trees | LSM-trees and SSTables, write optimised |
| Replication | single leader | leaderless |
| Transactions | ACID | row-level locking only |
| Conflict resolution | leader decides | last write wins, by timestamp |
| Data model | document, flexible schema | wide column, cluster key and sort key |
| Cross-partition queries | supported | very little support |
| Reach for it when | you want SQL-like guarantees with a flexible schema | you want very high single-partition throughput and can accept losing the occasional write |

### Choosing between them

**MongoDB** when the data guarantees of a SQL database are needed with the schema flexibility of
NoSQL. Documents whose shape drifts between records, and a transaction that still has to hold
across two of them.

Cassandra earns its place on throughput alone. Single-partition reads and writes go very fast, and
total throughput rises as nodes are added. The rest of the list is what pays for it. Atomicity stops
at a single row, nothing coordinates across partitions, and the last-write-wins rule described
above means a lost update leaves nothing behind for the application to find.

Example: Facebook messages. `clusterKey = ChatId`, `sortKey = timestamp`, and it does not matter
if the occasional message gets dropped. Loading a conversation is one partition read in sort order,
which is exactly the access pattern the engine is built around. The guarantees being given up are
ones this particular workload can spare: if a message is lost to a last-write-wins collision the
sender types it again, whereas buying that guarantee back with real transactions would put a
coordination round trip on every message anybody sends.

[^1]: **Spanner: Google's Globally-Distributed Database**, Corbett, Dean, Epstein, Fikes, Frost,
      Furman, Ghemawat et al., Google, OSDI 2012 - source for the TrueTime uncertainty bound: "In
      our production environment, ε is typically a sawtooth function of time, varying from about 1
      to 7 ms over each poll interval. ε̄ is therefore 4 ms most of the time." Also the source for
      the dual clock references: "The underlying time references used by TrueTime are GPS and
      atomic clocks. TrueTime uses two forms of time reference because they have different failure
      modes." The paper defines ε as half the interval width, so an interval of `[100, 102]`
      corresponds to ε = 1.
      [research.google](https://static.googleusercontent.com/media/research.google.com/en//archive/spanner-osdi2012.pdf)

[^2]: **Dynamo (architecture)**, the Apache Cassandra documentation - source for last-write-wins
      and its formalisation: "Formally speaking, Cassandra uses a Last-Write-Wins Element-Set
      conflict-free replicated data type for each CQL row, or LWW-Element-Set CRDT, to resolve
      conflicting mutations on replica sets." The same page is the source for leaderless writes:
      "Write operations are always sent to all replicas, regardless of consistency level."
      [cassandra.apache.org](https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html)

[^3]: **MySQL 8.4 Reference Manual, 17.7.2.1 Transaction Isolation Levels** and the **PostgreSQL
      9.1 release notes** - source for InnoDB's lock-based SERIALIZABLE ("This level is like
      REPEATABLE READ, but InnoDB implicitly converts all plain SELECT statements to SELECT ...
      FOR SHARE if autocommit is disabled") and for the PostgreSQL version that introduced true
      serialisability ("Add a true serializable isolation level (Kevin Grittner, Dan Ports)").
      [dev.mysql.com](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html),
      [postgresql.org](https://www.postgresql.org/docs/9.1/release-9-1.html)

## Related

- [[Transactions and Isolation]] - the isolation levels these systems implement.
- [[Replication]] - Cassandra is the leaderless reference implementation.
