---
title: "Replication"
description: "Single-leader, multi-leader and leaderless replication, and the machinery that copes with each one's failure mode"
section: "system-design"
order: 4
tags: ["replication", "consistency", "crdt", "quorums"]
source:
  notes: ["notes/digital/pages/page-07.md", "notes/digital/pages/page-08.md", "notes/digital/pages/page-09.md", "notes/digital/pages/page-10.md", "notes/digital/pages/page-11.md", "notes/digital/pages/page-12.md"]
---

# Replication

## ==Intro to replication==

Replication gives you redundant data that can be geolocated near users. It also gives you more read
capacity. A copy in another rack survives the loss of the first, and a copy in another region
answers a user there without a round trip across an ocean. The hard part is that every one of those
copies now has to agree with the others about what the data currently is. The schemes below are all
different answers to that, and what separates them is mostly where they put the cost: on the write
path, on the read path, or on whoever has to clean up afterwards.

### Synchronous replication

Confirmation from all replicas. Gives strong consistency, so stale data is not possible. It is rare,
though it does get used.

The reason it is rare is what the confirmation costs. Every client pays the latency of the slowest
replica, and the slowest is whichever one happens to be compacting at that moment, or fsyncing to a
disk that something else is already using. A crashed replica does not answer at all, so writes stop
until it comes back or until an operator takes it out of the set by hand. Each replica added for
durability is therefore also one more node that can bring writes to a halt on its own.

### ==Asynchronous replication==

Confirmation only from the write node. Gives eventual consistency, so stale data is possible. This
is the common choice.

The leader acknowledges as soon as its own storage has the write, which means a slow follower holds
nothing up and a dead one holds nothing up either. Followers catch up whenever they can. The lag
between leader and follower is a quantity you can watch but cannot bound, because it is set by
whatever the follower happens to be busy with rather than by anything the leader controls. If the
leader fails in the gap between acknowledging a write and shipping it, that write is gone, and the
client was told it had succeeded.

### What gets shipped

There are three things a leader can send a replica: the statements themselves, the write-ahead log
underneath them, or a logical description of each change. Only the third of those works in the
general case. The other two are worth understanding anyway, since both behave correctly on ordinary
traffic and only break on particular statements or particular version mismatches.

| What is shipped | Why it fails |
|---|---|
| The statements themselves | Non-deterministic statements produce different results on each replica |
| The write-ahead log | Tied to the storage engine, so it is useless across different database software or versions (MySQL to PostgreSQL, or even two versions of the same engine) |
| A logical replication log | Nothing. It describes the change at the row level, independent of both statement and storage format |

Statement-level breakage is easy to hit without trying. Anything that reads a clock or draws a
random number computes one answer on the leader and a different one on the follower. Nothing
reports an error when that happens. The rows simply stop matching, and everything computed from
them afterwards inherits the difference.

### Dealing with stale reads

Staleness reaches the user in a few specific shapes, each with its own symptom.

**Reading your own writes** is the one that gets reported as a bug. Someone posts a comment, the
page reloads against a replica that has not received the write yet, their comment is missing, and
they post it again. The client can keep the timestamp of its last write and read only from a
replica that has caught up to at least that point, which makes the read wait for the write. That
has costs of its own. Reads are now routed by freshness, which means whatever is doing the routing
has to know how far behind each replica is. The timestamp has to survive everything sitting between
the browser and the database, including any proxy or client library that feels free to drop headers
it does not recognise. And a user who picks up a second device brings no such timestamp with them,
so the guarantee stops applying the moment they switch screens. Routing every read to the leader
for a window after any write is the blunter version of the same idea, and it works, at the price of
giving back the read capacity the followers were added for.

With **monotonic reads** the complaint is stranger, because time appears to run backwards. A value
is read, read again, and the second read lands on a replica further behind than the first, so
something that was on the screen a moment ago is now gone. It may well come back on the next
refresh, which is part of what makes it so hard to reproduce on demand. Pinning each user to a
single replica removes it: pick the replica by `id mod n`, so a user with `uid = 20` reading from
three replicas always lands on replica 2, since `20 % 3 = 2`. That replica may be a long way behind
the leader, but on its own it only ever moves forwards, which is all the guarantee requires.
Changing `n` moves users between replicas and brings the anomaly back for as long as the rebalance
runs. The same modulus problem turns up in [[Partitioning]], where it is the argument for consistent
hashing.

**Consistent prefix reads** is about causality rather than freshness. A question and its answer are
two separate writes. Put them on partitions that replicate independently of one another and nothing
forces a reader to see them in the order they were made. The answer can turn up attached to a
question that has not appeared yet. No amount of care on the read path fixes this, because by the
time the reader is looking, the ordering information is already lost. Writes with a causal
dependency between them have to end up in one ordered stream, which in practice means on the same
partition — and that is a constraint on the partitioning key, decided long before anyone knows
what the read patterns will be.



| | Single leader | Multi leader | Leaderless |
|---|---|---|---|
| Writes go to | one node | any leader | many nodes at once |
| Write conflicts | impossible by construction | the central problem | the central problem |
| Ordering mechanism | replication log | version vectors or Lamport clocks | version vectors or Lamport clocks |
| Failure of the write path | needs consensus to elect a new leader | the others carry on | no single node to lose |
| Write throughput | capped by one node | scales with leaders | scales with nodes |
| Typical of | PostgreSQL, MySQL, MongoDB | geo-distributed deployments | Cassandra, Riak |

## ==Single leader replication==

<!-- FIGURE: SingleLeader -->

Increases durability and read throughput.

One node orders every write, so a conflict cannot arise. Adding followers adds read capacity. Write
capacity stays at whatever the leader alone can manage, and adding followers does not change that,
because every write still has to go through the same machine before anyone else sees it.

**Follower goes down?** Rebuild from the replication log, taking the difference from the leader. The
follower knows the last position it applied and asks for everything after that point, then replays
it. There is no coordination involved and nothing else in the cluster has to be told.

A dead leader is a different problem altogether, and it needs distributed consensus, covered in
[[Consensus and Linearizability]]. No node can tell a dead leader from a slow one, and the
survivors have to settle on a single successor regardless of which it turns out to be. The window
between the old leader failing and a new one being agreed is a write outage, and its length is a
property of the consensus protocol and the failure detector rather than of the database sitting on
top of them.

Split brain is the related failure, where two nodes both believe they are leader. It happens when an
old leader comes back after a partition, still taking writes, never having learnt it was replaced.
Both histories were acknowledged to clients, which is the part that hurts: the writes on the losing
side were not rejected, they were confirmed. Somebody then picks one history, usually the longer,
and reapplies whatever the other took by reading the logs.

## ==Multi-leader replication==

More throughput on write.

Every leader accepts writes and fans out to its own followers. Write throughput therefore grows with
the number of leaders rather than sitting at whatever one machine can do. The thing given up is the
single ordering point. Nobody is left who can say which of two writes happened first, and the
leaders have to reconcile with each other after the fact.

### Topologies

<!-- FIGURE: ReplicationTopology -->

Modify the replication log to record which nodes have seen a given key's change events. Without
that record a change circulates forever, arriving back at a node that already applied it and being
forwarded on again.

Multiple leaders means write conflicts, and the two escapes usually offered are both unsatisfying.
Conflict avoidance sends all writes for a key to one fixed replica, which does remove the conflict,
but only by making that key single-leader again and capping its throughput at a single node. Last
write wins timestamps everything and keeps the write with the highest timestamp. Nothing is
merged: one write is kept, the other is deleted without a warning anywhere, and both clients were told theirs had gone
through. Every time last write wins fires, a write is thrown away. That is the scheme working as
designed rather than failing, which is why nothing logs an error and nothing raises an alert. And
which of the two writes gets thrown away is decided by a timestamp that the client set.

## Why timestamps do not order writes

Timestamps do not order writes in a distributed system. A client sets its own clock, which makes the
sender's timestamp untrustworthy: a machine that believes it is a year in the future wins every
conflict it takes part in, for as long as it stays wrong. That does not need anyone acting in bad
faith. A laptop whose clock never got corrected, or a virtual machine resumed from a snapshot, will
do it by accident. Taking the timestamp at the receiver instead avoids the lying client, but it
measures the wrong thing, recording when the write arrived rather than when it was made, which puts
network delay into the ordering. Under both sits the skew of a quartz crystal running slightly fast
or slightly slow. NTP is the usual correction, and a GPS clock does better than NTP. Both of them,
however, depend on a message crossing a network whose delay nobody knows.

## ==Dealing with write conflicts==

**Version vectors** - `[0, 1, 1, 2]`. Store siblings and let the application layer choose.

Each position counts the writes one node has seen from another, which answers the question a
timestamp cannot: did one of these two writes see the other? If every element of one vector is at
least as large as the matching element of the other, that write came after and the older value can
be dropped. Where each vector leads in at least one position, the writes are concurrent and both
are kept.

<!-- FIGURE: VersionVectors -->

The application then has to know what merging means for this particular data: union two shopping
carts, take the larger of two counters. Cart union is the example everyone reaches for, and it is
right until one of the concurrent writes was a removal, at which point the deleted item comes back
in the merged cart. An application that simply takes whichever sibling arrived first has ended up at
last write wins again, with more machinery in the way. Siblings do not clear themselves, either.
They collapse when a resolved value is written back, and until somebody writes one, further
concurrent writes keep adding to the set.

Riak makes that decision a setting. With `allow_mult` true, conflicting concurrent writes are kept
as siblings and returned to the client. Setting it false hands the decision back to the database,
which then "resolves all object replica conflicts internally and does not return siblings to the
client". The failure on the other side is sibling explosion, an object rapidly collecting siblings
that nothing reconciles, and the documented cost of that runs from degraded performance and undue
latency to out-of-memory errors and, at the extreme, a read of the object crashing the entire
node.[^5] None of that is peculiar to Riak. A sibling nobody has resolved is just data the database
is still holding, and it comes back with every read of that key. If nothing ever merges the object,
the set of siblings only grows, and each read has to fetch and ship all of them.

**CRDTs** - conflict-free replicated data types. The database resolves conflicting values itself,
on the types whose merge can be defined once and then applied without asking anyone.

### ==CRDT==

**Operation-based CRDT** sends the operation (`inc(0)`) instead of the vector. Fails for causal
relationships, so it needs causally consistent message delivery. Messages cannot be dropped or
duplicated, and every operation has to be idempotent. Those requirements are strict because an
operation carries no context with it. An increment applied twice increments twice, and one that
never arrives is lost for good, because nothing later in the stream repeats that information.

**State-based CRDT** sends the whole CRDT and merges it with `merge(local, incoming)`. Requires the
merge to be:

- **Commutative** (`f(a,b) = f(b,a)`)
- **Associative** (`f(a, f(b,c)) = f(f(a,b), c)`)
- **Idempotent**

Those properties hold, but the original paper does not stipulate them. The payload values form a
join semilattice and `merge(x, y)` is the least upper bound, from which all three follow. The paper
adds a monotonicity requirement on updates.[^1]

This works well with a gossip protocol and needs no extra messaging infrastructure. A lost message
costs nothing, because the next exchange between those two nodes carries the same state again. A
message applied twice merges to the value the node was already holding.



| Type | Sends | Cost | Fails when |
|---|---|---|---|
| **Operation-based** | the operation itself, e.g. `inc(1)` | small messages | delivery is not causally consistent, or a message is dropped or duplicated |
| **State-based** | the whole value, merged on arrival | larger messages, no delivery guarantees needed | never, provided merge is commutative, associative and idempotent |

### Types of CRDT

The usual set runs from an increment-only counter to one that can also decrement. Beyond those sit
add and remove sets, where an element once removed cannot be added back, and merge is the operation
all of them share. Counters are easy because each replica's contribution stays separable from the
others. Merging keeps the highest figure seen from each node, and no node's own figure can ever go
down, which means merging the same state in twice changes nothing.

Removal from a set is harder. The record of the removal has to survive a merge and beat the record
of the addition, or a node that never heard about it resurrects the element, and that record cannot
be retracted without breaking the monotonicity the merge depends on.

The same arithmetic turns up in Cassandra, well outside CRDTs. A delete is a tombstone, the
tombstone has to outlive any chance of an unrepaired replica reasserting the row, and
`gc_grace_seconds` is the table option setting how long it survives. Its default is 864000 seconds,
ten days. The repair guidance is that "at a minimum, repair should be run often enough that the gc
grace period never expires on unrepaired data. Otherwise, deleted data could reappear", with a
suggested cadence of repairing every node at least once every seven days against that ten-day
default. The documentation ties the risk to unrepaired data rather than to node downtime as such,
and those are different claims. They get conflated often, which matters here, because a node that
was never down for a moment can still be holding data that no repair has covered.[^6]

**Sequence CRDT** builds an eventually consistent list. Very hard, because elements are ordered.
Used in real-time text editors.

Two increments commute, so a counter merges trivially. Elements of a list are defined by where they
sit relative to each other, and that relationship has to survive concurrent edits to the very
elements defining it. A position cannot be an index, since every insertion earlier in the list
moves it. Instead each element carries an identifier of its own, ordered so that every replica sorts
the list identically without having to talk to another, and dense enough that a new identifier
always fits between two existing ones however many times people have already inserted at that spot.
All of that runs on every keystroke in an editor. The identifiers also grow longer the more often
people insert into the same place, which means a paragraph several people have rewritten between
them carries more identifier overhead than one typed straight through.

Redis and Riak both advertise CRDT support, and the Redis claim carries a qualifier. They are a
feature of Redis Software, the commercial Enterprise product, where "Active-Active geo-distribution
is based on CRDT technology". Open-source Redis has no documented CRDT implementation. Riak's
documentation needs no such scoping, saying "Riak KV has Riak-specific data types based on
convergent replicated data types (CRDTs)", covering flags, registers, counters, sets and maps.[^2]

## ==Leaderless replication==

There is no leader to route through. A write goes to many nodes at once and a read queries many
nodes at once, with the client reconciling what comes back. Used in Cassandra and Riak. With nobody
to elect there is no failover pause and no split brain, and the work moves to read time, where the
client decides which of several answers is current. The cost of that lands on the read path of every
single request, including all the requests that would have found the replicas in perfect agreement
anyway and had nothing to reconcile. On a read-heavy workload that is a lot of requests paying for a
problem they do not have. It also means the reconciliation logic lives in the client, in however
many languages the clients happen to be written in.

**Read repair** updates the stale value when a read notices the divergence, which makes repair a
function of read traffic. Rows nobody reads never get repaired. A replica that missed a week of
writes to cold data stays wrong until something asks for it. Anti-entropy is the background process
that covers that gap.

### Anti-entropy

Propagates changes in the background using a **Merkle tree**. Hash each row, sum each pair of
hashes and hash the result, then repeat up to the root value. Both Dynamo and Cassandra do exactly
this, each node maintaining "a separate Merkle tree for each key range... it hosts".[^3] One
changed row changes every hash on the path from its leaf to the root. Comparing two roots then
answers whether the replicas hold identical data at all.

<!-- FIGURE: MerkleTreeDiff -->

Comparison walks down from the root, with nodes that "exchange the hash values of children and the
process continues until it reaches the leaves of the trees".[^3] Only subtrees whose hashes
disagree are descended into. The volume exchanged scales with the number of *differences* and
not with the size of the dataset. How much a real repair costs therefore depends on how the
differences are distributed across the key range, which neither source discusses.

### ==Quorums==

Write to `W` nodes, read from `R` nodes.

<!-- FIGURE: QuorumExplorer -->

If the write set and the read set together exceed the number of nodes, they must overlap, so at
least one node in the read set holds the latest value. Dynamo states the condition as "setting R
and W such that R + W > N yields a quorum-like system".[^4]

This is not strong consistency, because not all nodes are consistent. Dynamo describes itself as
"an eventually consistent data store".[^4] It is prone to write conflicts, and to problems with
failed writes when rollbacks also fail. A write that reaches two nodes and fails on the third is
not undone on the two that took it. A rollback would face the same failures the write did. The
condition also says nothing about which values `R` and `W` should take. Any pair satisfying it
qualifies. Choosing between a cheap read with an expensive write and the opposite arrangement falls
to whoever configures the cluster, and the condition offers them no help at all; the only real guide
is which way the traffic leans.

**Sloppy quorums** handle the case where part of the cluster goes down, with recovery by hinted
handoff. In Dynamo this is normal operation. The paper says the system "does not enforce strict
quorum membership and instead it uses a 'sloppy quorum'", which breaks the intersection guarantee
above.[^4]

Hinted handoff means a node that took a write for an unreachable owner keeps it, with a note of who
it was for, and passes it over once the owner returns. Until then a reader querying `R` of the
intended nodes can miss that write completely, because the node holding it is not one of them.

The hint does not last indefinitely. Cassandra's default window is three hours, configured as
`max_hint_window` and spelled `max_hint_window_in_ms` in older configurations, where it is
10800000. New hints are retained "for up to `max_hint_window_in_ms` of downtime (defaults to 3 h)",
and a replica that stays down past the window is "permanently out of sync until either read-repair
or full/incremental anti-entropy repair propagates the mutation".[^7] Once a replica has been down
longer than the window, hinted handoff is no longer the thing that is going to fix it. What is left
is read traffic arriving for those exact rows, or a repair somebody has scheduled, and there is no
guarantee that either happens soon.

[^1]: **A comprehensive study of Convergent and Commutative Replicated Data Types**, Marc Shapiro,
      Nuno Preguiça, Carlos Baquero and Marek Zawirski, INRIA Research Report RR-7506, 13 January
      2011 - §2.3.1 derives the three properties from the semilattice structure: "It follows from
      the definition that ⊔v is: commutative... idempotent... and associative". A state-based
      object "whose payload takes its values in a semilattice, and where merge(x, y) = x ⊔v y,
      converges towards the LUB".
      [reed.cs.depaul.edu](https://reed.cs.depaul.edu/lperkovic/csc536/lecture10/techreport.pdf)

[^2]: **Active-Active geo-distributed Redis**, the Redis documentation, and the **Riak KV data
      types** documentation - source for scoping the Redis attribution. Every CRDT statement
      on redis.io is scoped to Redis Software: "In Redis Software, Active-Active geo-distribution
      is based on CRDT technology", and the page sits under the Redis Software documentation tree.
      Riak's own docs are unambiguous about Riak KV.
      [redis.io](https://redis.io/docs/latest/operate/rs/databases/active-active/),
      [docs.riak.com](https://docs.riak.com/riak/kv/latest/developing/data-types/index.html)

[^3]: **Dynamo: Amazon's Highly Available Key-value Store**, DeCandia et al., Amazon, SOSP 2007,
      §4.7, and the **Apache Cassandra architecture documentation** - both confirm Merkle trees
      for anti-entropy. Dynamo: "To detect the inconsistencies between replicas faster and to
      minimize the amount of transferred data, Dynamo uses Merkle trees." Cassandra: replicas
      "calculate hierarchical hash trees over their datasets called Merkle trees that can then be
      compared across replicas to identify mismatched data." Neither states a complexity bound.
      [allthingsdistributed.com](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf),
      [cassandra.apache.org](https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html)

[^4]: **Dynamo: Amazon's Highly Available Key-value Store**, DeCandia et al., Amazon, SOSP 2007 -
      §4.5 for the quorum condition, written there as `R + W > N`: "R is the minimum number of
      nodes that must participate in a successful read operation. W is the minimum number of nodes
      that must participate in a successful write operation. Setting R and W such that R + W > N
      yields a quorum-like system." §2.3 for eventual consistency, and §4.6 for sloppy quorums.
      Dynamo cites no earlier source for the condition, so it is a primary source for the phrasing
      but not for the origin of quorum theory.
      [allthingsdistributed.com](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)

[^5]: **Riak KV documentation**, Basho's guides to causal context and conflict resolution. They
      define `allow_mult` as the switch between sibling retention and internal last-write-wins,
      with false meaning "Riak resolves all object replica conflicts internally and does not return
      siblings to the client". They also supply the sibling explosion warning, which names degraded
      performance, undue latency, out-of-memory errors, and at the extreme a read that crashes the
      whole node.
      [docs.riak.com](https://docs.riak.com/riak/kv/latest/learn/concepts/causal-context/index.html)

[^6]: **Apache Cassandra documentation**, where the CQL reference carries the table option and the
      repair guide carries the consequence. Together they support the 864000-second default for
      `gc_grace_seconds`, described as "Time to wait before garbage collecting tombstones (deletion
      markers)", and the risk that deleted data reappears when the grace period expires on
      unrepaired data.
      [cassandra.apache.org](https://cassandra.apache.org/doc/latest/cassandra/developing/cql/ddl.html)

[^7]: **Apache Cassandra documentation**, the project's own operator guide to hinted handoff. It
      gives the default hint window as three hours, and states that a replica which stays down past
      it is permanently out of sync until read-repair or anti-entropy repair propagates the
      mutation.
      [cassandra.apache.org](https://cassandra.apache.org/doc/latest/cassandra/managing/operating/hints.html)

## Related

- [[Partitioning]], usually configured alongside replication.
- [[Consensus and Linearizability]], what it takes to make replication linearizable.
- [[Database Comparisons]], where Cassandra and Riak are the leaderless reference implementations.
