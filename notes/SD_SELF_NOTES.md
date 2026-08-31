# System Design — Self Notes

Digital transcription of `SD_SELF_NOTES.pdf` (46 handwritten pages).

- Diagrams are reproduced as ASCII art in fenced blocks.
- `==text==` marks highlighter; `~~text~~` marks the author's strikethroughs.
- `~~[cancelled, illegible]~~` marks text the author crossed out that cannot be read.
  No text the author kept is missing.
- One word on page 36 is cut off at the edge of the scan; it is filled from
  context and tagged `*[inferred]*`. It is the only word in this document
  that was not read off the page.
- Pages 12, 17, 18, 21 and 22 were unreadable in the original PDF scan and were
  re-photographed; their text comes from those rescans.

---

## Page 01

### Database

- Index ⇒ R↑ W↓ speed

- → ==Hash Indexes==

- h (Key) → Value

- Probing (Key available slot) or Chaining if 2 keys have same value.

- Easy scan for key → O(1) R/W

- Hash map are bad for disk
  - ↳ Values all over the disk
  - → As a result, alway kept in RAM
    - ↳ Expensive
    - ↳ Keys have to fit in RAM
      - ↳ Not durable
  - ↳ No Range Queries.

```
Hash map are bad for disk
 |  ↳ Values all over the disk
 |  → As a result, alway kept in RAM
 |          ↳ Expensive
 |          ↳ Keys have to fit in RAM
 |                        ↳ Not durable
 |                              ↓
 |          Slow  ←—  Repopulate  ←—  (WAL)
 ↳ No Range Queries.
```

```
+-----------------------------------------------------+
| Binary Tree → Invariance → Good for Range Queries   |
+-----------------------------------------------------+
```

---

## Page 02

⊛ What is difference b/w B & B+ trees?

### → ==B-Tree==

- On disk index unlike hashmap ⟶
- Stays balanced
- ~~Cost~~ Constant height
- 256 KB page size. (4 KB ??)
- Supports ~~rag~~ range queries
- No limit to dataset ←

> **[margin note]** A long curved arrow loops from the end of "On disk index unlike hashmap →" down and back to the left, ending at the "←" on the "No limit to dataset" line.

### → ==LSM Tree + SSTables==

- LSM to big → Reset → <ins>Immutable SSTable on disk</ins>

- For delete → tombstone

- LSM is tree so reads O(log(n))

- Check LSM first → Check SS table (last Two)

- LSM Optimization
  - ↳ Add Sparse Index (Allows skip in Bsearch)
  - ↳ Bloom filter

- Compaction → SST1 x SST2 (Reduce Wasted space)
  - ↳ O(n) → Merge two sorted list
  - ↳ Extra CPU usage on write

---

## Page 03

WAL → Monotonically Increasing Seq.

### → ==Index Conclusions==

### → ==ACID Transactions==

- All writes Save or none ← Atomicity
- All fails occur gracefully ← Consistency
- No Race condition ← Isolation
- Committed writes don't get lost ← Durability

### → ==Read Committed Isolation==

- DB are multithreaded → Concurrent processes

- Dirty Write → Writing over uncommitted values
  - ↳ Fixed w/ locks (Row lvl)

- Dirty Reads → Reading uncommitted values
  - ↳ Row level lock
    - ↳ Slow
  - ↳ Store old value until commit

### → ==Snapshot Isolation==

Repeatable read / Read skew

Store all the values with WAL TXN number.

- ↳ We don't delete old value
- ↳ when reading read last valid value at txn.
- ↳ Do not consider value that come after the txn.
- ↳ DB snapshot

---

## Page 04

> **[margin note]** (top of page, arrow ← pointing down-left to the "Write Skew & Phantom Writes" heading)
>
> ```
> Read, mod, up
>       ↓
>   ← when Update add new rows
> ```

→ ### ==Write Skew & Phantom Writes==

Grab lock on all relevant rows
  ↳ on all the reads.

Phantom occurs when 2 people write ~~to~~ new
rows that conflicts ~~with~~ the conditions set.
  ↳ No locks to grab.
  ↳ Fixed by materializing writes.
      ↳ Prepopulate rows. to allow locks.

→ ### ==Serial Execution. (Actual/VoltDB)==

Everything on one core
  ↳ Using Disk → Slow → Using memory.
  ↳ Network is slow (Bandwidth)

Stored Procedures → SQL function over network
  ↳ less data to send over networ
  ↳ (-ve) hard to manage wide deployments

→ ### ==Two Phase Locking==

Making concurrent transactions seem as if they
were running on one thread.

### Shared Reader Lock & Exclusive Writer Lock
  ↳ Read, modify, update → predicate valid.

### Slow → Too many deadlocks
      ↳ Detect & Abort → Run again

### Predicate locks → lock on matching rows
      ↳ Slow, eval full query.

---

## Page 05

Snapshot → consistent state at time T

### Index range locking
  ↳ uses table index
  ↳ Grab more predicate lock than necessary
  ↳ (-ve) interfere with many transactions

→ ### ==Serializable Snapshot Isolation (Optimistic con. control)==

Why grab locks when you could just run as normal
and correct mistakes after they happen?

Use SSI instead of 2PL if most trx are overlapping
with each other, otherwise use 2PL.

### Distributed Cockroach → ✗ SSI

→ ### ==Column Oriented Storage (Parquet)==

> **[margin note]** ↖ Apache Iceberg format
> &nbsp;&nbsp;&nbsp;&nbsp;↳ date + min, max, avg metadata

Better when we want to all the values from one colmn
  ↳ Analytics

### Column compression → similar data in column

```
Column compression → similar data in column
  ↑
  │          ↳ Bitmap encoding       ⎤
  │          ↳ Run length encoding   ⎦ dict. comp
  ├→ less data over network
  └→ more data in CPU cache memory
```

### Predicate Push down
  ↳ skip data based on metadata

(-ve) same sort order for all column
(-ve) Write needs to go to diff. places on disk
  ↳ unless write in LSM tree (in-mem, balanced search tree)
      row

---

## Page 06

```
        LSM tree

            (O)
           /   \
        (O)    (O) ----- too big ----->        Col1.Txt        Col2.Txt
               /  \                          +----------+    +----------+
            (O)   (O)                        |          |    |          |
      ^                                      |          |    |          |
      |                                      |          |    |          |
      |                                      |          |    |          |
      +---> Most rows                        +----------+    +----------+
                                              |________________________|
                                                          |
                                    Eventually export to colmn
                                          oriented files
```

### → ==Data Serialization Frameworks==

- JSON, XML → human readable
  - ↳ (-ve) lack type annotations
  - ↳ (-ve) overhead
- Use of predefined data schema to reduce size of data
  - ↳ not human readable (Binary)
    - ↳ CPU penalty minor
  - ↳ Protobuf / thrift
- (-ve) What if data changes without us knowing

- Apach Avro → create schema base off the colmn names
  - ↳ Avro Schema DB → use to decode data
    - ↳ ### Reader Schema & Writer Schema

```
        Reader Schema & Writer Schema
                    ↓
        Match based on common fields
                    ↓
        Fill with default value for
              missing data
```

  - ↳ Update schema on the fly

---

## Page 07

→ ### ==Intro to Replication==

- Redundant data → Geolocate
- Increased DB throughput

### Synchronous Replication
- ↳ confirmation from all replica
- ↳ Strong consistency → Stale data not possible
  - ↳ Rare, but used

### ==Async Replication==
- ↳ Confirmation only from write node
- ↳ eventual consistency
  - ↳ Stale data possible.
  - ↳ common

```
Copying statements → Non-deterministic   X
  ↓
WAL → useless if diff. software/version of DB
  ↓        ↳ MySQL → Postgres
  ↓
Replication Log
   (logical log)
```

### Dealing with Stale Reads

- Reading your own writes
  - ↳ using timestamp.

- Monotonic writes
  - ↳ user reads off same replica every time
  - ↳ Id mod (uid = 20, 20%3 = 2)

---

## Page 08

- → Shards v/s partition matrix
- → Split brain (2 leaders)

### Consistent prefix reads

↳ Keep track of causal deps of write and put them on the same partition

→ ==Single Leader Replication==

```
                                        ┌────────────┐
                                        │  Follower  │
   ဝ                  ┌──────────┐  ┌──>│            │
  ─人─  ── w ──>       │          │ ╳╳   └────────────┘        ဝ
   ┃                  │          │╳   ╳ ─────────           ─人─
  ╱ ╲                 │          │  async         ──── R ──>  ┃
                      └──────────┘ ╳                         ╱ ╲
                        Leader      ╳
                                     ╳   ┌────────────┐
                                      ─> │            │
                                    ↑    │            │
                                    └────└────────────┘
                                          ──> Sends repl. log
```

- (+ve) Inc. durability
- (+ve) Inc. read throughput

### Follower goes down?

↳ Rebuild from Repl. log (diff. from leader)

### Leader goes down?

↳ we need distributed consensus

→ ==Multi Read Replication==

```
                                              ↓ w
                                             (L) ──> (F)
              ↓ w              <─────────────  ↗
             (L) ────────────────             ╱
            ↙   ╲                            ╱
          (F)     ╲                         ╱
                    ──────────>  (L) ──> (F)
                                  ↑ w
```

---

## Page 09

more throughput on write

### Circle topology

```
                 ┌──> ( L ) ───┐
                 │             │  w
                 │             ↓
             ( L )           ( L )
                 │             ↑
              w  │             │
                 └──> ( L ) ───┘
```

### Star topology

```
      ( L )                      ( L )
        ↑ ↘                     ↗ ↑
        │   ↘                 ↗   │
        │     ↘   ↙         ↗     │
        └───→ ( L ) ←───────┘
                ↑ │
                │ ↓
              ( L )
```

### All to All topology

```
              ┌──→ ( L ) ──┐
              │      │      ↘
        ( L ) ←──────┼───────→ ( L )
              ↑      │      ↗
              └──→ ( L ) ←──┘
```

> **[margin note]** Out of order writes?

Modify Rep. log to record which nodes have seen key data change events

- N-leader → w-conflicts
  - ↳ Fix: all writes to a key go to a fixed replica
    - ↳ conflict avoidance
    - ↳ limited write throughput
  - ↳ Last write wins → everything time stamped
    - ↳ Does not work perfectly. (not secure)

---

## Page 10

Timestamp

- ↳ Sender not ~~[struck out]~~ not secure
- ↳ Rec. timestamp not reliable
  - ↳ Clock skew due to Quartz crystal
    - ↳ NTP (Network Time Protocol)
      - ↳ GPS clock
      - ↳ still not reliable, net. delay

We can't order writes using timestamps in dist. sys.

> **[margin note]** → (arrow pointing at the heading below)

### ==Dealing with Write conflicts==

Version vectors    ( [0, 1, 1, 2] )

↓

Store siblings
- ↳ Let user/App layer choose value

CRDT
- ↳ Conflict Free Replicated Data types
- ↳ DB resolves conflicting values themselves

> **[margin note]** → (arrow pointing at the heading below)

### ==CRDT==

Operational CRDT
- ↳ Send operation (inc(0)) instead of vector
- ↳ (-ve) Fails for causal relationships
  - ↳ We need causally consistent message delivery
    - ↳ No drops or duplicates.
    - ↳ Needs to be idempotent

---

## Page 11

### State based CRDT

- ↳ Send whole CRDT (merge (local, incoming))
- ↳ (ex) now we have duplicate?
- ↳ Needs to be
  - ↳ Commutative : f(a,b) = f(b,a)
  - ↳ Associative : f(a, f(b,c)) = f(f(a,b), c)
  - ↳ Idempotent
- ↳ works well with ~~gossip protocol~~
  - ↳ Requires no extra messaging infrastructure

### Types of CRDT

> **[margin note]** ← Used by Redis, Riak

- ↳ inc counter
- ↳ inc, dec decreasable counter
- ↳ add, remove sets ⟶ Once removed can't be added
- ↳ merge (unknown)

> **[margin note]** ↓ or tags — Attach unique id to allow re-add

### Sequence CRDT → build event consistent list

- ↳ V. hard because elements are ordered
- ↳ Used in real-time text editors

### ==Leaderless Replication Intro==

```
W ──→ many nodes
R ←── many nodes
```

### Used in Casandra, Riak

### Read repair → updating stale value

---

## Page 12

### Anti-entropy

- ↳ Propagate changes in the Bg
- ↳ Merkle Tree
  - ↳ Hash each row
  - ↳ Sum up pair of hashes, take hs
  - ↳ Do again, until root value

```
              (305)                    V/S                506
             ↗     ↖                                     ↗    ↖
        (119)       407                              201       407
        ↗   ↖      ↗   ↖                            ↗   ↖     ↗   ↖
     123   (247)  301   210                      123    472  301   210
     a=1    b=6   c=3   d=4                      a=1    b=2  c=3   d=4
              \____________________________________________↗

              log time comp. of tree → BFS
```

### ==→ Quorums - LLR==

Write to W nodes
Read from R nodes

W + R > N

> **[transcription note]** The glyph after `+` is shaped like the author's N
> on the page (`W + N > N`); confirmed by the author as R.

- ↳ Quorum R/w
- ↳ well atleast one node will have latest value

Not strongly consistent → bcz not all nodes consist.
- ↳ Prone to write conflicts

↓

Issues with failed writes, if rollbacks fails

---

## Page 13

Q - How can we have multi-leader nodes in normal DB?

- sloppy Quorums → When cluster goes down
  - ↳ Recovery → hinted handoff

~~Partitioning~~

### → ==Partitioning==

### Range based

- ↳ (-ve) Hot spots
- ↳ good locality for range queries

### Hash Range based

- ↳ Relatively even dist. of keys, less hot spots.
- ↳ (-ve) no data locality for range queries
- ↳ ~~Even~~ not alway protected against hot spots
  - ↳ what if some keys are over used?
- → Use secondary index

> **[margin note]** A large curly brace on the left groups the three "Hash Range based" sub-bullets and curves down into an arrow pointing at "Use secondary index".

- ↳ Local, no need for extra work over network
- ↳ (-ve) need to read from every single partition
- ↳ Global secondary index
  - ↳ reads using single index from one node
  - ↳ (-ve) need to write to multiple shards at once
    - ↳ Slow, ~~[cancelled, illegible]~~
    - ↳ Require distributed txn.

> **[margin note]** A vertical line runs down the left of the "Local / (-ve) need to read / Global secondary index" bullets, tying them to "Use secondary index".

### → ==2 Phase Commits - Dist. txn==

Too many points of failure

- ↳ coordinator goes down?
  - ↳ No txn can proceed, running nodes hold locks and cant touch rows

---

## Page 14

- ↳ Receiver goes down?
  - ↳ Txn can't commit, coordinator needs to send it messages until it comes back up

Dist. Txn are hard & dangerous
  - ↳ avoid when possible

→ ### ==Consistent Hashing==

hash(key) % n          n = no of nodes
  ↓
Modulus doesn't work
  - ↳ v. sensitive to node count. (not efficient)

Dist. keys evenly
  - ↳ Minimal data sent over net on rebalance
  - ↳ Great for partitioning & load balancing
  - ↳ K ⟶ the no. of partitions per node
    - ↳ we can think of each node as having a fixed no. of partitions per node

### total fixed partitions per sys

```
 ┌───┐ ┌───┐ ┌───┐                        ┌───┐  ┌───┐
 │ 4 │ │ 4 │ │ 4 │ ──── loose node ────→  │ 6 │  │ 6 │
 └───┘ └───┘ └───┘  \                     └───┘  └───┘
 └────────┬───────┘   \
       12 part.        \                  ┌───┐  ┌───┐
                        \                 │ 3 │  │ 3 │
                         └─ gain node ─→  └───┘  └───┘
                                          ┌───┐  ┌───┐
                                          │ 3 │  │ 3 │
                                          └───┘  └───┘
```

---

## Page 15

need to choose a good number:

Too few → part. get too big for the db

Too many → overhead ~~of~~ on disk of storing pad.

### Dynamic Partitioning

- ↳ split automatical.
  - ↳ merge small automatically.
  - ↳ we do it to often the ser are sending ~~tons~~ lot of data over net.

> **[margin note]** "lot" written above the struck-out "tons"

→ ### ==Linearizable Database==

we need it for "correct" reads

- ↳ all the writes are ordered
- ↳ ~~we~~ our reads can never go back in time

Single leader → Repl. logs

Multi leader → ~~Vector~~ Ver. vectors / Lamport clock.

Leader less → Lamport clocks / Ver. vect.

### Lamport clock - O(1) space!

- ↳ can be assigned to each write to order it
- ↳ max(s, c) + 1 ← clock number

### Ver. Vector / Lamport clock → ⊗ not linearizable

- ↳ because ordering is after the fact.

Single leader Replication is NOT linearizable

we need "Total order broadcast"

- ↳ Every node has to agree on the order of writes
- ↳ In case of faults we cannot lose any writes
- ↳ we do this via "Dist consensus"

---

## Page 16

> **[margin note]** Writes are rejected if it does not achieve quorum from nodes

### → ==Distributed Consensus – Raft Leader Election==

Raft → build dist. log

- If a node loses heartbeat/ping it proposes itself as leader
  - ↳ update epoch to epoch of last leader + 1
  - ↳ If get's "yes" from quorum, it has won election

- ↳ Can't two leader at the same time due to quorum
- ↳ Old leaders can't come back due to fenching token (epoch number)
- ↳ leader has upto date log & backfill stale nodes

### → ==Distributed consensus – Raft Writes==

(Write backfills logs)
- ↳ There is only one leader per turn
- ↳ Successful writes must make log fully upto date
- ↳ If two logs have same turn no. at the same index, they must be ~~totally~~ identical prior to that index

```
                        ^Prefix                    Suffix
        10     4                10        4
   ...   A     D           ...   A    {    F
        20    23                20    {   22

        Leader                    Follower
```

We only send missing ~~for~~ suffix, and take no. of matching prefix
- ↳ If quorum ~~rep~~ responds yes, commit everything until then 2P locking
- ↳ For write to succeed it needs to go through majority of writes

---

## Page 17

- Raft creates fault tolerant linearizable DB
- (-ve) Raft is slow (leader is a bottleneck)
- Raft is fault ~~taut~~ tolerant, but it doesn't ~~rep~~ replace two phase commit since all writes to replicas are the same.

→ ### ==Zookeeper - coordination Services==

A coordination service is KV store that allow us to store this data in a reliable way.

eg. Zookeeper, Etcd. ↗ (Raft based)

  ↳ Zab

Consensus is slow, but somehow we need it.

- Can always read from the leader (Slow)
- If you want to read from multiple nodes, <u>Sync</u> will keep read linearizable ↰
  - ↳ only needs to be done once
    - ↳ Greater read throughput as Result

Too slow to be used for app. data, only KV pair of config for your backend that need to be correct.

Built ~~of~~ on top of cons. algo. to maintain ~~[cancelled, illegible]~~
                                                linearizability

---

## Page 18

> **[margin note]** Non-relational *(written above, correcting the struck-through word below)*

### → ==Relational v/s ~~Documents~~ based DB==

- Rel → poor Data locality in dist. sys

- Non-rel → we have duplicate data
  - ↳ Relevant data together
    - ↳ <u>Denormalized</u>
    - ↳ Whole doc over network
    - ↳ better for highly decoupled non-rel. data
    - ↳ Disjoint data

### → ==MySQL v/s PostgreSQL==

Common feat.
- → B-tree based indexes
- → Single leader replication →
- ↳ Configurable isolation levels

```
                                                    (SSI)
     MySQL : 2P Lock              |   Postgres - Serializable Snap. Iso.
                                  |
                                  |
 - Every row has locks            | - Txn read from data snapshot
 - Read only txns can grab        | - If Txn reads value which is
   in shared mode                 |   modified by another txn
 - To write must grab in          |   before committing, original
   excl. mode                     |   needs to be _rolled back_
 - Lots of deadlock to            |              ↓
   detect and undo.               |            ↳ OCC
                                  |         ↳ optimistic con. control
```

Conclusion ?
- ↳ <u>Use SQL both for that needs to be normalized and for data needs to be correct</u>
- ↳ In theory SSI > 2PL, if <u>many conflicts</u> pessimistic maybe better
       (2PL)
  - ↳ many overlaps   *(arrow points to "many conflicts")*

---

## Page 19

==→ VoltDB==

> **[margin note — top right doodle]** a flag on a pole planted in a CPU chip
> ```
>   ╭──────────╮
>   │ ≡≡≡      │
>   │ ≡≡≡      │
>   ╰────┬─────╯
>        │
>     ┌──┴──┐
>    ≡│ CPU │≡
>    ≡│     │≡
>     └┬───┬┘
> ```

### Actual Serial Execution

- ↳ Running everything on one thread
- ↳ Bottleneck : HDD or Network

### Dealing with disk

- ↳ stores all data in memory.
  - ↳ (+ve) Hash idx for O(1) lookup and writes
  - ↳ optional WAL, optional tree set backups
  - ↳ (-ve) less data per node means more partitions
  - ↳ (-ve) More cross partition R/w
    - ↳ 2PL

### Dealing with Net. latency

- ↳ use stored procedures.

### VoltDB

→ very int. approach in achieving ACID txn without 2PL or SSI.

- ↳ However, must make a lot of sacrifices because of this.

==→ Spanner==

### Causally consistent dist. reads

- ↳ If write B depends on write A and my read contains write B, it must also contain write A.

```
   1. ┌─ T1 sees comment1
      │
       ╲                                     ┌ T4 sees comment3,
        ↘      ╭─────╮        ╭─────╮  ✓ ────┤
               │     │        │     │        └ WTF is comment2?
               │  A  │        │  B  │
        ───→   │     │        │     │
               ╰─────╯        ╰─────╯
                                  ↖  3. T3 writes comment3 replying
   2. T2 writes comment 2                     to comment2

               └──────────────┬──────────────┘
                     Not causally consistent
```

---

## Page 20

Q. Predicate lock?

### Can we solve this with snapshots?

- → w/o some centralized sys. we don't know which snapshots to send
- ↳ Not sufficient

### Typical soln.

- ↳ 2PL
  - → Grab lock on rows &
  - ↳ (-ve) very slow and prevent writes

Spanner allow us to make CCD reads w/o locks

- ↳ uses timestamps (Google True Time)
- ↳ Any write that depends on another write will have a greater timestamp than it.

### Part 1

- ↳ W1: [100, 102] , Δ ≤ 2 sec.
  - ↳ Wait Δ seconds then commit
  - ↳ Actual Tstamp > 102, call it T1

### Part 2

- ↳ We read W1 and writes to part 2,
  - ↳ clearly happens after 102
  - → W2: [x, y] where y > T1
  - ↳ Wait y-x seconds then commit.
    - ↳ T2 > T1

### Δ is as low as possible.

- ↳ GPS & atomic clock in Data center
  - ↳ expensive & proprietary
  - ↳ not pract. for all companies

---

## Page 21

→ ==MongoDB v/s Apache Cassandra==

### MongoDB

- ↳ B-trees
- ↳ Acid txn
- ↳ Single leader repl.
  > **[margin note]** } SQL typical — brace grouping B-trees / Acid txn / Single leader repl.
- ↳ but <u>doc-oriented data model</u> + rich feat. set
  - ↳ flexibility of data model

~~Cassandra~~

### Cassandra

- ↳ wide column data mode
- ↳ clusterkey, sortkey, ... optionals

### Cassandra partitioning

- ↳ via the cluster key
- ↳ Config. shared via gossip
- ↳ All R/W should go to one partition, very little support for distributed txn.
- ↳ Local index with sortkey in each partition.
- → very oppinionated. *(brace groups the two lines above)*

```
             gossip
                ↘
       ⇄⇄⇄⇄⇄⇄⇄⇄⇄⇄⇄⇄ ( )
  ( )                   ⇅
         Hash Ring      ⇅
       ⇄⇄⇄⇄⇄⇄⇄⇄⇄⇄⇄⇄ ( )
```

### Cassandra replication

- ↳ Leaderless replication → Read repair, anti-entropy
  - ↳ configurable            ↳ merkle trees
- ↳ Write conflicts? ──────────┐
  - ↳ Last write wins          ↓
  - ↳ Lost writes    (see Riak with CRDTs)

---

## Page 22

### Cassandra Single node

- ↳ LSM trees + SSTables → Write optimized
- ↳ Only row level locking, no ACID txn

MongoDB → When you need the data gurantees of SQL DB with schema flexibility of NoSQL

Cassandra → Incredible high single partition write throughput and read throughput.
- ↳ Very poor data gurantees.

Eg. FB messages
- ↳ clusterKey = ChatId
- ↳ sort key = timestamp
- ↳ doesn't matter if the occasional message get dropped.

### → ==Hadoop==

### Distributed computing framework
- ↳ data storag : HDFS
- ↳ Big computing : MapReduce, Spark

### HDFS
- ↳ distributed file store with "Rack aware" storage
  - ↳ Fault tolerant

```
"Rack aware"
     |
     ↓
Location of nodes
     ↓
Reduced latency
```

---

## Page 23

```
                        +-----------+
                        | Name Node |  <---  Metadata store
                        +-----------+

  +-----------+        +-----------+          +-----------+
  | Data Node |        | Data Node |          | data Node |
  +-----------+        +-----------+          +-----------+
                                                    ^
                                        storage ____/
```

### Name node

- ↳ tell us all the replicas and ver. of files on them
- → Keeps metadata in memory
  - ↳ WAL on disk for fault tolerance
- → When the name node starts up, asks each data node which files it contains and replicate if necessary
- → Replicate file on data node if no. of replicas are less

### Reading files

- ↳ We expect to be reading our data for more than it is written
  - ↳ 1. Client ask name node for file location
    2. NameNode responds with best replica for client
    3. Client caches the file location
    4. Read from data node

### Writing Files

- ↳ When picking the location of replica, the name node tries to be rack aware
  - ↳ 1. Client wants to write a file
    2. NN: file will be on A, B, C
    3. NN → Client: Primary: A, Secondary B, tertiary: C
    4. Client writes to DN-A

```
  W ---->  +----------------+  +----------------+
           | DN-A <=> DN-B <-|--> DN-c <=> DN-D |
           +----------------+  +----------------+
                  DC-1                DC-2
```

---

## Page 24

↳ Client writes into replication pipeline

```
        ←—— Ack ——      ←—— Ack ——       ←—— Ack ——
   웃                 ___              ___              ___
   |                ( A )            ( B )            ( C )
        ——write——→   ‾‾‾   ——write——→  ‾‾‾  ——write——→  ‾‾‾
        once
```

→ This is not strongly consistent

- → Failed replication ( A ↛ B, or B ↛ C )
- → Dropped Ack
- → Client can try again
- ↳ Tries to be consistent, but is not

### High availability HDFS

↳ Single NN is point of failure.

```
 ┌──────────────┐   |     ○----- - -            ┌───────────────┐
 │  Primary NN  │---→   ( )          -  ○  ---→ │ Secondary N.N │
 └──────────────┘   |    \        - -    |      └───────────────┘
        \           |     \  ( )         |            ↑
         \          |      ‾‾‾‾          |           /
   WAL    ——→            Dist. Log       |         State
                        (Zookeeper)      |        Machine
                     Strongly consistent |      Replication
                          consensus
```

Hadoop is a fundamental building block for
a lot of today's distributed systems. It is rack
aware FS is a major optimization. ~~Many of our~~

---

## Page 25

→ ==Hbase==

### Problems with hadoop

- ↳ No way to make an adhoc update to one file at a time and edit one piece of data.
  - ↳ Need to write whole file again.

Hbase → DB built on top of hadoop
- ↳ Allows for quick queries/key updates
  - ↳ via LSM
- ↳ Allows for good batch processing abilities due to data locality
  - ↳ via column oriented storage
  - ↳ via range based partitioning.

### Hbase data model

- ↳ wide key store (NoSQL) → Similar Cassand.
- ↳ No dedicated cluster key = range based partitioning.

### Hbase architecture

```
                                             ZooKeeper
        whom to                                 ( )———————( )
   O  ———— write ———→  ┌──────────┐          ↗   ↑  \        \
  /|\                  │  Master  │ ←————————'   |   ↘         \
  / \  ←———————————────│   Node   │              ( )            ┌───────────┐
        w to node      └──────────┘               \_____↗       │ Secondary │
   ↑                                                            │   Node    │
   └──────────────────────┐                                     └───────────┘
                    write │                        └─────────────────┘
                          ↘                             High Avail.

  ┌───────────────────┐   ┌───────────────────┐
  │ ┌───────────────┐ │   │ ┌───────────────┐ │   Hbase
  │ │  Region Node  │ │   │ │  Region Node  │ │
  │ └───────────────┘ │   │ └───────────────┘ │
  │ ┌───────────────┐ │   │ ┌───────────────┐ │   HDFS
  │ │   Data Node   │ │   │ │   Data Node   │ │
  │ └───────────────┘ │   │ └───────────────┘ │
  └───────────────────┘   └───────────────────┘
     Comp 1, node 1           Comp 2, node 2
```

---

## Page 26

```
      Client write                    WAL too                        diff part.
            ↖                            ↓                              ↘
             ┌──────────────────────────────────────┐   ┌───────────────────────────────┐
             │                        o             │ ⎫ LSM │  ┌──────────────────────┐ │
             │   Region             /   \           │ ⎬     │  │  Region      o       │ │
             │                     o     o          │ ⎭ flush│ │            /   \     │ │
             │                    / \               │   │    │ │           o     o    │ │
             │                   o   o              │   ↓    │ └──────────────────────┘ │
   HDFS ⎧    ├──────────────────────────────────────┤        │   SSTable      ↓ flush   │
        ⎨    │        ┌─────┐   ┌─────┐             │   W    │  ┌──────────────────────┐│
        ⎩    │  Data  │ ≋≋≋ │   │ ≋≋≋ │             │ ──────→│  │  Data   ┌───┐        ││ ──→
             │        └─────┘   └─────┘             │ ←──────│  │         │ ≡ │        ││
             └────┬───────┬──────────────────────---┘  Ack   │  └──────────────────────┘│
                  │       │                                  └───────────────────────────┘
                  │       │                    Rep. pipeline
              Datanode  SSTable
                        HDD
```

Uses column oriented storage
- ↳ only fetches the rows you want
- ↳ Cache stats per column
- ↳ Column comp
- ↳ Better for analytics queries and batch process
- ↳ (+ve) range based partitioning keeps related data close.
  - ↳ think of ts. which would have diff hashes

Not as good as Cassandra for a typical app. level dB in terms of speed. However If you want to be able to store and <u>Modify</u> big data on HDFS so that you can run analytical batch queries, HBase maybe better option.

(⊞) Sensor data, Analytics

---

## Page 27

→ ==MapReduce==

Allows us to perform batch processing of big data sets
- ↳ Works with data that is already in HDFS

Main Adv.
- ↳ Can run arbitrary code, just define mapper & reducer
- ↳ Runs computations on the same nodes that hold the data
- ↳ Failed mappers & reducers are restarted independently
- ↳ Same node → data locality
- ↳ Designed to be super resilient

Mappers: Obj ⟶ (Key, Value)

Reducers: List(Key, Value) → (Key, Value)

### Map Reduce Architecture

```
          Start (on disk)
         ┌──────────┐        ┌───────┐ ┌───────┐ ┌───────┐  ┌───────┐ ┌──────┐
Node 1   │  ≡       │        │ K₃ V  │ │ K₃ V  │ │ K₃ V ┐│ │ K₃ V  │ │  ≡   │
         │  ≡       │        │ K₁₂ V │ │ K₁₂ V │ │ K₃ V ││ │       │ │      │
         ├──────────┤        ├───────┤ ├───────┤ ├──────┼┤ ├───────┤ ├──────┤
Node 2   │  ─       │        │ K₆ V  │ │ K₃ V  │ │ K₆ V ││ │ K₆ V  │ │  ≡   │
         │  ≡       │        │ K₃ V  │ │ K₆ V  │ │ K₈ V ││ │ K₈ V  │ │      │
         ├──────────┤        ├───────┤ ├───────┤ ├──────┼┤ ├───────┤ ├──────┤
Node 3   │  ─       │        │ K₈ V  │ │ K₈ V  │ │ K₁₂ V┐│ │ K₁₂ V │ │  ≡   │
         │  ≡       │        │ K₁₂ V │ │ K₁₂ V │ │ K₁₂ V┘│ │       │ │      │
         └──────────┘        └───────┘ └───────┘ └───────┘  └───────┘ └──────┘
H. Cluster                    map → sort ⇢ → shuffle → Reduce →
```

> **[margin note]** Materialize on disk (HDFS)

Sort → O(n) merge join

---

## Page 28

### Why sorting?

- ↳ Uses much less memory
  - ↳ Easier to flush, no need to keep keys in memory till end.

~~Job~~
Job chaining

- ↳ we chain MR jobs together

MapReduce is a very useful framework for performing big data batch processing on a schedule. You can even perform more advanced calculations via job chaining and data joins. However, MR has some limitations (major perf. flaws) as well and in reality it likely frequently the best tool for the job.

→ ==Batch Job Data Joins (Batch Joins)==

During batch comp. we want to join multiple data sets.

### Sort merge Join

- ↳ Merging bunch of sorted lists
  - ↳ can be done ~~with~~ with a heap)
- ↳ ~~merge~~ sort → shuffle stage
- ↳ Can always be used because we can always repartition by our join key, the merge can be done entirely on disk, no memory constraints

```
Sort merge Join
 |
 |-> Merging bunch of sorted lists
 |        |-> can be done with a heap)
 |-> sort -> shuffle stage
 |
 |-> Can always be used because we can always
     repartition by our join key, the merge can be
     done entirely on disk, no memory constraints
```

---

## Page 29

- ↳ (-ve) Can be extremely slow
  - → Have to sort all our data by join key unless already indexed.
  - → Have to send at least one whole dataset over the network, possibly both depending on how they are partitioned

### Broadcast Hash join

- ↳ Sends entire small data set to all partitions and does a hash join.
- → Don't need to sort big dataset.
- → Small database must fit in memory
- ↳ Creat hash ~~index~~ of small DB in memory
- ↳ We only have to do linear scan of big Dataset to join using O(1) lookups in th memory
- ↳ (-ve) assumes one of the joining dataset is small enough to be saved in the memory

### Partitioned hash join

- ↳ If both datasets are too big to fit in the memory but are partitioned the same way so ~~that~~ the partitions can fit in memory.
- ↳ Sends partitions over the network, instead of whole.

Ideally, during joins, we want both datasets to be partitioned and sorted/idxed by join key already ~~b..~~ because then we can just send data to the reducer like normal and join on disk. When this isn't the case, we can attempt to see whether a broadcast/partitioned hash join is feasible and if not, ultimately fallback to sort merge join.

---

## Page 30

→ ==Spark==

### Issues with MR

- → Chained Jobs does not know about one another
  - ↳ Lots of ~~writing~~ waiting
- → Each Job requires ~~tons~~ a Mapper & reducer
  - ↳ ton's of unessary sorting → n log n
- → Ton of disk usage
  - ↳ Jobs materialize Intermidiat states

### Why Spark is better?

- → Only write/Read to disk during O/P or I/P
- → In-memory Intermidiate state (RDD)
  - ↳ Resilent distributed dataset
- → Fault taulerance : Narrow dependcy

```
                                    Shuffle      map/reduce
         ┌───────┐                 ↗            ↗
Node 1   │  (⌀)  │ ──→ ( )────────→( )────────→( ) ──→ ┌───────┐
         └───────┘        \      ↗                     │  (⌀)  │
                           \    /                      └───────┘
                    RDD     \  /
         ┌───────┐           \/                        ┌───────┐
Node 2   │  (⌀)  │ ──→ ( )───/\───→( ) ────→ ( ) ────→ │  (⌀)  │
         └───────┘         /   \                       └───────┘
                          /     \
         ┌───────┐  map  /       ↘                     ┌───────┐
Node 3   │  (⌀)  │ ──→ ( )        ( ) ────→ ( ) ──7──→ │  (⌀)  │
         └───────┘                                     └───────┘

          I/o (disk)     Operator      Operator     RDD        O/P
                       (RDD(mem))       RDD       Operator    (disk
```

---

## Page 31

> **[margin note]** ↰ Query plan  *(curved arrow pointing down into "Spark fault tolerance")*

### Spark fault tolerance

- ↳ Draws dependencies at each stage
  - ↳ Narrow → Comp on 1 node (all) b/w ~~st~~
  - ↳ Wide → Rely on data from other nodes
- ↳ Rerun lost computation, parallelized on other nodes
  - ↳ works for narrow dep.
- ↳ For wide deps, need checkpoint after wide comp.
  - ↳ write to disk (temp. materialization)
  - ↳ recover from disk

> **[margin note]** 2 steps  *(top right, above the "Narrow" line)*

### Spark is much faster than MR

- ↳ Nodes do comp. as soon as possible
- ↳ Intermediate state kept in memory
- ↳ No need to sort at every step

### Spark uses more memory than MR

- ↳ need to be able to fit dataset in memory

→ ==**Stream Processing**==

React to "events" in real time

```
 ________              event         ___________
|Producers| - - - - - - - - - - -> |Consumers|
 --------                           -----------
```

### Event/message broker

```
      direct TCP connection                    Using a broker

   P ------------->  C                            P            C
     \      /---->                                  \        ↗
   P --\--/------->  C            v/s             P --> ┌───┐ --> C
     \  \/                                              │   │
      \ /\                                        P --> └───┘ ↘
   P --/--\------->  C                                        C

      O(n²) worst case                            O(n) connection
          connects
```

---

## Page 32

### Common stream Processing use cases

- ↳ Metric/log time grouping & bucketing
- ↳ Change data capture
- ↳ Event sourcing

### Time windows

```
Producer ———→ ┌────────┐ ——→ client
              │ Broker │
              └────────┘
```

timestamp ⇒ extract min.

```
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│  A  │  │ B,C │  │     │  │D,E,F│  │  G  │
└─────┘  └─────┘  └─────┘  └─────┘  └─────┘
 0001     0002     0003     0004     0005
 └──────────────────┬──────────────────┘
              1 min tumbling windows
```

```
┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│ A,B, C │   │        │   │ D,E,F,G│   │        │
└────────┘   └────────┘   └────────┘   └────────┘
 0001-0003    0002-0004    0003-0005   0004-0006
 └───────────────────┬──────────────────────┘
               2 min hopping windows
```

Agg. tumbling window gives hopping window

### Sliding window

- ↳ using in-memory queue / linked list
- ↳ As events come we push to Queue
- ↳ pop (head) when node invalid

```
 ✗——→o——→o———→o——→(o)
```

---

## Page 33

### Change data capture

- ↳ Allows keeping derived data in sync with DB

```
                    w          ,-----.        +--------+        +--------------+
   Client  ------------->     ( DB    ) ----> | Broker | -----> | Search index |
                              `-----'         +--------+        +--------------+
                              source of                          derived data
                                truth
```

### Event sourcing

- → DB agnostic events allow us to build new types of derived data in the future

```
                                   Raw event
                                +----------+          +----------+         ,-----.
   Client  ------------------>  |  Broker  | ------>  | Consumer | ----->  (  DB  )
                                +----------+          +----------+         `-----'
                     x cached                              ↳  +--------+
                                                             | New DB |
                                                             +--------+
```

- ↳ Assumes broker holds onto events

### Exactly once message processing

- ↳ At least once: Fault tolerant brokers
  - ↳ Some disk persistence and replication, cons. ack
- ↳ No more than once
  - ↳ 2PL (commit)  ← Bad & Slow
  - ↳ idempotence

```
        +---------------+                                  +-----------+
        | Coordinator   |                                  |  Broker   |
        +---------------+                                  +-----------+
    can dele  |  ↑ confm   |  ↑     can              ←K:1 |    ↑     | K:1
      ↓       ↓  |         ↓  |     proc?                 ↓    | ack  ↓  seen
              |  ↓ comm    ↓  |                                |
     +----------+       +----------+                +-------------------+
     |  Broker  |       | Consumer |                |     Consumer      |
     +----------+       +----------+                +-------------------+

              2PL                                        idempotence
```

> **[margin note]** Assumes the same consumer sees the same message

---

## Page 34

→ ==Kafka v/s Rabbit MQ.==

- In-memory message broker
  - ↳ RabbitMQ, ActiveMQ, Amazon SQS
- Log-based message brokers
  - ↳ Kafka, Amazon Kinesis

### In memory message broker

- → Round Robin delivery leads to more throughput
  - ↳ (-ve) but out of order message
  - ↳ To handle messages in order we need to <u>fan-out</u>
- ↳ Messages in-mem are deleted,
  - ↳ Poor fault tolerance
  - ↳ No replayability.

> **[margin note]** ↓ Separate Queues for separate consumers

```
                                  Ack
                              ↖ ‑ ‑ ‑ ‑ ─┐
                        ┌ ‑ ‑ ‑ ‑ ‑ ‑ ‑ → ┌──────────────┐
                        ↓                 │  Consumer 1  │
   O ──→ O ──→ O ──→ ⊗ ← temp delet,      └──────────────┘
                        perm. after Ack
       ↖    ↑
   ⌣‑‑‑‑‑‑‑‑⌣   ‑ ‑ ‑ ‑ ‑ ‑ ‑ →  ┌──────────────┐
   Linked List        Ack        │  Consumer 2  │
    (Queue)                      └──────────────┘
```

### Log-based message broker

- → All consumers reading from a Queue get every
  message in order.
  - ↳ one slow to process message slows processing of rest
    - ↳ need to partition to inc. throughput
- ↳ More durability, messages not deleted on disk
  - ↳ can be replayed later

---

## Page 35

```
        DbR
          │
          ↓                                  ┌──────────────┐
  ┌────┬──┴──┬─────┬─────┬─────┐      ⌐──→   │  Consumer A  │
  ; M5 │ M1  │ M2  │ M3  │ M4  │      │      └──────────────┘
  └────┴─────┴─────┴─────┴─────┘      │
           for B  ─────  for A  ───────────→ ┌──────────────┐
        └────────────┬───────────┘           │  Consumer B  │
                     │                       └──────────────┘

           Sequential writes on disk
```

### Memory based

- ↳ Max throughput, order doesn't matter
- ↳ Users posting videos, you want to encode them
- ↳ Users posting tweets that will be sent to feed cache
  of followers

### Log based

- ↳ Want all items in queue to be handled by one
  consumer, in order, ability to replay
- → Sensor metrics coming in
  - ↳ want to take average of last n events
- ↳ Each write from a dB that we will put in search idx

→ ==<u>Stream Joins/Enrichment</u>==

Augmenting events with more data.

### Stream-stream Joins

- ↳ Want to match events from two streams using
  common key
- ↳ Cache event in consumer, enrich when other
  event arrives
  - ↳ when enriched, push to another queue (sink)

---

## Page 36

### Stream-table Joins

- ↳ Same as stream-stream but where one stream data comes from Database
  - ↳ Could be via CDC
  - ↳ Naive approach n/w call to DB
  - ↳ Keep in-mem copy of required data
    - ↳ Keep consistent using CDC

### Table-Table Join

- ↳ When we want to get join results as tables change
  - ↳ faster than polling → every 5 sec. query → unmanageable *[inferred — the word runs off the
    right edge of the scan; only "…nab…" is legible. Read from context as a
    drawback of polling.]*
- → Same as stream-Table by now both sources are from CDC of tables (CDC twice)
- ↳ if tables too big for consumer memory
  - ↳ Partition queues
  - ↳ 1 consumer per partition
  - ↳ partition by join key

### Patterns

- → In order to maximize perf. → cache derived state in mem.
- → Issue1 → Memory → less space per consumer
  - → Need a lot of partitioning to hold the data
  - ↳ Queues need to be partitioned the same way as consumer
- ↳ Issue2 → memory → consumer state is not fault tolerant
  - ↳ having WAL isn't enough
  - ↳ Other consumers can process more messages and become inconsistent

### Soln.? → Stream processing frameworks

---

## Page 37

→ ==Apache Flink==

- Stream processing frameworks
  - ↳ eg → Flink (per event)
    - ↳ Spark streaming (Micro-batching)
      - ↳ Tez, Storm

> **[margin note]** (brace spanning the three framework lines) Declarative — Specify a topology and let the workout the details

Flink allows us to gurantee that each message only effects state once.

Stream processing frameworks are not type of message brokers, they are specifically consumers.

Flink ensures that each event impacts state exactly once
- ↳ Barriers ensure ~~casually~~ causal consistency
- ↳ Node takes snapshot when it recieves barriers from all of its input queues
- ↳ Stores checkpoints externally (S3)

~~eg~~

```
                (B)
                 ↘  ┌────┐
     ┌───┐  ──────→ │ C1 │ ────────────┐
     │ P │                             ↘
     └───┘                          ┌────┐        Requires
        │    (B)                    │ C3 │        Replayable
        └──────────┐                └────┘         queues
                   ↘   ┌────┐    ↗
                       │ C2 │ ──┘
                       └────┘
                                  checkpoint
                                  ⇒⇒  (S3)
```

C3 will checkpoint only when it will recieved (B) from ~~b~~ both C1 & C2

Every checkpoint only includes messages before the barriers so we can just resume each consumer reading messages after the barrier.

---

## Page 38

Flink snapshots are super <u>lightweight</u>
- ↳ Run in background
- ↳ Allow ensuring that all messages affect state exactly once.
- ↳ Ensures that we don't have to replay every single message in the event of a crash

→ ### ==Search Indexes==

Tokenize → Inverted index (or multiple)

### Prefix searching
- ↳ Keeping tokens sorted gives log time complexities when searching docs
- ↳ Find all doc that have words starting with "c" (eg)

### Suffix searching
- → token → reverse string → inverted index
- ↳ Eg: apple : [10] ← prefix inverted index
  - elppa : [10] ← suffix inverted index
- ↳ Eg. search for fruits ending in "berry"

Both/All inverted indexes are sorted

### ==Apache Lucene==
- ↳ Most popular <u>Opensource search index</u> (1999)
- ↳ Many types of Idxs supported for complicated variants of search (text, numbers, coordinates)
- ↳ Uses an LSM tree variant to support fast doc ingestion
  - ↳ writes to memory first.
- ↳ Meant to be used on single node

---

## Page 39

→ ==ElasticSearch==

Convenience wrapper around Lucene to allow for fast searching in dist. systems.
- ↳ Rest API
- ↳ Its own Query language
- ↳ Managed replications & partitioning
- ↳ Visualization

### Elastic Search Partitioning

- → ES maintains a <u>local index per node</u>, less duplication

```
+---------+   +---------+          +---------+   +---------+
| a: 1,2  |   | b: 3,8  |   Not    | a: 1,2  |   | c: 2,3,9|
| c: 2,5  |   | c: 3,9  |          | b: 3,8  |   |         |
+---------+   +---------+          +---------+   +---------+
```

- ↳ Try to keep all searches limited to one partition
  - ↳ Eg: part. chat documents by chatId
  - ↳ Otherwise need to aggregate

### Elastic Search caching

- → Normally: Cache piece of idx or full query result
- ↳ ES: Cache parts of query

→ ==Time Series DB==

Great for handling time series/range data
- ↳ Eg.: logs, metrics, sensor reading etc.

Popular Implementations: TimeScale DB, Influx DB, Druid.

---

## Page 40

### Optimizing Reads in TS DB

- → Since we mostly cares about a couple of metrics at a time, we should use column ordered storage
  - ↳ (+ve) Less data to cache
  - ↳ (+ve) can cache more
  - ↳ (+ve) better data locality

- → As opposed to one large table with one big index, use many small indexes

```
              Sensor1   Sensor2   Sensor3
                 ↓         ↓         ↓
              +---------+---------+---------+
1:00 - 2:00 { |         |         |/////////|  ──→ Place in cache
              +---------+---------+---------+
2:00 - 3:00 { |         |         |         |
              +---------+---------+---------+
3:00 - 4:00 { |         |         |         |──→ Chunk table
              +---------+---------+---------+
              |_________________________|
                      Hyper Table
```

- ↳ Since most R/w go to just one chunk at a time, we can cache the whole thing.

### Optimizing Writes

- → Imp. to have fast writes when we have a lot of data or everthing else will be slow down
- ↳ Shard by (sensor, time range) for best data locality

```
 +- - - - - - - - - - - - - - - - -+
 | +-----------+   +-----------+   |
 | | Sensor 1  |   | Sensor 2  |   |            o
 | +-----------+   +-----------+   |           / \
 |       ↓               ↓         |  ───→    o   o    →   +------+  +------+
 | +-----------+   +-----------+   |             / \       | ==== |  | ==== |
 | | Chunk 1   |   | Chunk 2   |   |            o   o      | ==== |  | ==== |
 | +-----------+   +-----------+   |                       +------+  +------+
 +- - - - - - - - - - - - - - - - -+
                                            LSM Tree          SSTable
                                            In-memory         on disk
```

---

## Page 41

### Optimizing deletes

  ↳ (Recap) Deletes in LSM/SSTables are as exp. as writes
  ↳ Hashing chunktable makes it easy

Time series DB are great optimization for time series data, <u>Knowing how they work under the hood</u> in order to increase performance is extremely useful for any systems design question that involves metrics/logging.

→ ==### Graph Databases (Neo4j)==

Non native graph DB takes existing DB and write a query lang on top of it allowing you to ~~fo~~ traverse graph easily.

- ↳ Slow → O(log|E|) + O(log|N|)
  - ↳ Relational implementation ↑
  - ↳ Non-Relational implementation
    - ↳ O(log(N|)

### Native/Neo4j implementation

- → O(1) time complexity across an edge using <u>index free adjacency</u>

```
        Nodes                        Edges
  Addr   Name   Edge Addr      Addr    Points to   Next E.Addr
  0x001  JOE    null           0x007   0x002       null
  0x002  Jane   0x007          0x008   0x001       null
```

- → We jump around, not loop through

---

## Page 42

### ACID Txn in Neo4j

- ↳ Need a WAL & Locking
- ↳ In distributed setting → 2PL (commit)
  - ↳ Auto assigns one of the locking node as coordinator

While graph DB question are less likely to come up they still can. (Facebook Friends, Google Maps). It is very useful to know why Native graph databases such as Neo4j are better suited to handle this use case than non-native ones!

→ ==GeoHashes / GeoSpatial Indexes==

### Solves: Find all points within some address.
Eg: Yelp, Uber, Tinder, etc.

### GeoHash / Quad Trees

- → Assign every 2D point a single value so that similar values are close to one another.

```
      A
  ┌────────────────────┬────────────────────┐
  │ A                  │ B                  │
  │                    │                    │
  │                    │                    │
  │                    │                    │
  │         CB         │                    │
C ├─────────┬────┬─────┼────────────────────┤
  │ CA      │CBA·│     │ D                  │
  │         ├────┼─────┤                    │
  │ CC      │ CD       │                    │
  │         │          │                    │
  └─────────┴──────────┴────────────────────┘
```

- ↳ If we are searching for all the points with box "CBA", we just search for all points starting with "CBA", so "CBA" ≤ x ≤ "CBC". If points are sorted that is Binary search

---

## Page 43

Eg: 3 char = 1x1 km ; 2 char = 2x2 km ; 1 chr = 4x4 km

1. I want to find points from my coordinates (1.7, 1.7)
2. I'm in box B
3. I'm in box BC
4. I'm in box BCA
5. Need to search BCA, BCB, BAC, BCC,
6. Take all points, and calculate whether they are actually within a km, return result. ~~Eg~~

### Geo Sharding

- → Freq. there is too much data for just one comp.
- ↳ Necessary for unbalanced concentration of points
  - ↳ Sparse Areas
  - ↳ Too Dense.

→ ### ==Distributed Caching==

```
        +---------+---------+
        |   CPU   |   CPU   |
        +---------+---------+
        |   L1    |   L2    |
        +---------+---------+
        |   L2    |   L2    |
        +---------+---------+
        |      L3 Cache     |
        +-------------------+
        |      Memory       |
        +-------------------+
        |       Disk        |
        +-------------------+
```

### Benefits of cache in dist systems

- ↳ Faster R/W speeds
- ↳ Reduced load on key components

### Drawbacks of caching

- ↳ Cache miss is expensive
- ↳ Data consistency is complex, depends on how much you care.

---

## Page 44

What do we cache?
- ↳ Anything that is computationally expensive or utilises a lot of Network bandwidth.
  - ↳ DB results
  - ↳ Computations done by app server
  - ↳ Popular static content

### Server-local caching
- → Occurs on app. server, database nodes, message brokers

> **[margin note]** -etc

- → (+ve) Fewer network calls, Very fast
- → (-ve) Cache size is proportional to no. of servers

### Global caching layer
- → (+ve) Scale independently of nos. of servers for both partitioning and replications
- → (-ve) Extra network calls, more can go wrong
  - ↳ or/and mem/disk IO

### Caches can seriously speed up our application by:
- → Using faster form of storage
- → Being closer to our client
- ↳ Reducing load on other components

But: We want to avoid cache miss, and possibly have consistent data.

---

## Page 45

→ ==Distributed Cache writes==

### Write around cache
- ↳ (+ve) Database is central source of truth
- ↳ (−ve) Expensive cache miss
- ↳ Approach: Invalidation v/s stale read (TTL)
  - ↳ When do you need correct data?
    - ↳ Both expensive

### Write through cache
- ↳ (+) Data consistency b/w cache & database
- ↳ (−) can have correctness issues is not usig 2PL (slower)
- ↳ Approaches: YOLO v/s 2PC

### Write Back cache ✓

> **[margin note]** Grubhub

> **[margin note]** ↙ mini batch flush

- ↳ (+) Lowest latency writes (eventual write to DB)
- ↳ (−) Data Staleness / correctness issues
- ↳ Approaches: YOLO v/s Dist. Lock + replication
  - ↳ cache puts a lock on DB preventing stale reads (Bad)

### Write Around: Write like normal, cannot avoid cache miss
- ↳ Low complexity, less read benefits, no write penalty

### W. Through: Super slow with 2PC, pretty slow without it
- ↳ Writes much slower, consistent data, no miss

### W. Back: Write directly to cache, async flush to db
- ↳ Writes & reads very fast, can lead to consistency issues.

---

## Page 46

thundering herd in cache → DB, put locks in cache and allow only 1 query to DB for that key.

### → ==Cache Eviction==

*(rest of page blank — remaining marks are mirrored bleed-through from the reverse side)*

---

