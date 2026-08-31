---
title: "Partitioning"
description: "Range and hash partitioning, secondary indexes, consistent hashing, rebalancing, and why cross-partition transactions are worth avoiding"
section: "system-design"
order: 5
tags: ["partitioning", "sharding", "consistent-hashing", "2pc"]
source:
  notes: ["notes/digital/pages/page-13.md", "notes/digital/pages/page-14.md", "notes/digital/pages/page-15.md"]
---

# Partitioning

## ==Partitioning schemes==

A partitioning scheme is the function deciding which node a key lives on. It governs how evenly
load spreads and which queries can be answered from one place. It also fixes how much data has to
move across the network when a node is added or removed. That third property tends to go
unexamined, because it costs nothing at all until the cluster is actually being resized, and then
it decides how long the resize takes and how badly everything else degrades while it runs.

### Range based

Keys are handed to partitions in contiguous ranges, so keys that sort next to each other end up
stored next to each other. That gives good locality for range queries. Everything between two
timestamps, or every user whose name starts with a given letter, comes out of one partition read
sequentially instead of a query fanned out across the cluster.

The same property produces hot spots, because real key distributions are lumpy. Anything keyed by
time is the obvious case, since writes all target whichever partition owns the present moment while
every other partition sits idle. The node owning the busy range saturates its disk, network or CPU
first, and from then on the throughput of the whole cluster is whatever that one machine can
manage. Latency degrades for every key it holds, including keys nobody is asking about. Adding
hardware does not fix it either, because the node that joins gets handed a range of older keys that
nothing is currently querying.

### Hash range based

Hashing the key before assigning it destroys whatever ordering the keys had. That is the whole
point of doing it: keys that would have clustered together get scattered across the space instead,
which gives a fairly even distribution and takes away the structural hot spot that range
partitioning has. The price is that adjacent keys now sit on unrelated partitions. A range query has
to visit every one of them and merge what comes back, which turns a sequential scan of one disk into
a fan-out across the whole cluster.

Hashing is not reliable protection against hot spots anyway, since some keys may simply be
over-used. It evens out the key space and does nothing whatsoever about the distribution of
requests over that space. One celebrity account, or one product on the day everyone wants it,
hashes to a single partition, and that partition ends up as overloaded as any range-based hot spot
ever was. The usual workaround is to split the hot key by appending a random suffix and fan the
reads back out over the suffixes. It works, though every read of that key now costs several reads
instead of one, including the reads that were never going to collide with anything.



| | Range partitioning | Hash partitioning |
|---|---|---|
| Key ordering | preserved | destroyed, deliberately |
| Range query | one partition, read sequentially | fan-out to every partition, then merge |
| Structural hot spot | yes, anything keyed by time targets one partition | no, the key space is spread evenly |
| Hot key | same problem | still a problem, since hashing spreads keys and not requests |
| Adding a node | may be handed a cold range nobody queries | takes an even share |
| Workaround for a hot key | none within the scheme | append a random suffix, then fan the reads back out |

## Secondary indexes

Partitioning by key answers one question cheaply: which node holds a given key. Every other query
needs a secondary index, and the choice is where to keep it.

A **local secondary index** stores, on each partition, an index over only the rows that partition
holds. Writing a row then costs nothing extra over the network, because the row and its index
entries live on the same node and commit together. Reads are where that is paid for. Nothing in the
system indicates which partitions hold matching rows. Every partition has to be asked, and the
results merged. Query cost grows with the number of partitions, and the latency of the whole query
belongs to whichever partition answers last.

A **global secondary index** is partitioned by the indexed value rather than by the primary key. A
read then uses a single index on a single node and goes straight to the answer, which is exactly
what the local index could not do. Writes are the other story. The row lands on the partition its
key selects, while its index entries land on whichever partitions the indexed values select, and
those are values the writer does not choose. Row and index have to stay in step, meaning either all
of them commit or none of them do, which puts an ordinary insert in the position of touching several
shards at once and needing agreement from every one of them. That is slow. It also means a
distributed transaction, with everything that implies, sitting on the write path of every insert.

<!-- FIGURE: SecondaryIndex -->

## ==Two-phase commit: distributed transactions==

The coordinator asks every participant to prepare, collects their answers, and tells them all to
commit if every one agreed. Any participant that answered yes has promised to commit if asked, so
until the decision arrives it holds its locks and cannot resolve the transaction on its own. That
promise is what makes the protocol correct, and it is also why the failure of any one node in the
transaction leaves all the others stuck.

**Coordinator goes down?** No transaction can proceed. Running nodes hold locks and cannot touch
the rows. They sit in the prepared state with no authority to commit or abort, and the rows under
those locks stay unavailable to everyone else until the coordinator returns and says which way it
went. A participant cannot break the deadlock by guessing, because guessing wrong on either side
splits the transaction. The coordinator's log holds the only record of the decision, and recovery
consists of waiting for that log to be readable again.

If it is a participant that dies instead, the transaction still cannot commit, and now the
coordinator is the one stuck, retrying its messages until the missing node comes back up. Every
other participant waits in the prepared state, locks held, for however long that takes, while
unrelated transactions that happen to need those same rows queue up behind them.

Distributed transactions are hard, and they fail in ways that take unrelated work down with them.
Avoid them where you can, mostly by choosing a partition key that keeps the rows which change
together on one partition, so that the commit never has to leave a single node.

## ==Consistent hashing==

The obvious approach, `hash(key) % n` where `n` is the node count, does not work. Modulus is far
too sensitive to that count; change `n` from four to five and the result changes for almost every
key, so almost the whole dataset has to move to a different machine. That is a migration of the
entire database triggered by adding one server to it. Consistent hashing distributes keys evenly
and sends minimal data over the network on a rebalance, which makes it good for load balancing as
well as partitioning, since a node joining takes over only the keys adjacent to it on the ring and
leaves the rest of the mapping exactly as it was.

Kafka shows the same arithmetic in production. Partition counts there are one-way, since "Kafka
does not currently support reducing the number of partitions for a topic", and adding partitions
"doesn't change the partitioning of existing data so this may disturb consumers if they rely on
that partition". The documentation gives the mechanism directly: where data is partitioned by
`hash(key) % number_of_partitions`, that mapping "will potentially be shuffled by adding partitions
but Kafka will not attempt to automatically redistribute data in any way".[^1] The practical
consequence is that a topic's partition count has to be settled up front, at the point where least
is known about the traffic that topic will end up carrying. It cannot be brought down later, and
bringing it up rewrites the mapping for existing keys without moving any of the data that was
placed by the old one.

`K` is the number of partitions per node, and it is tempting to picture each node as holding some
fixed number of them.

<!-- FIGURE: ConsistentHashRing -->

What is actually fixed is the total number of partitions in the system. The count per node is the
thing that moves, going down as nodes join and up as they leave.

Choosing that number matters. With too few, each partition grows too big for the database to handle
comfortably, and because the partition is also the unit that moves during a rebalance, there is
then no way to shed a little load from a busy node without shifting a large slice of the dataset
along with it. Too many and the on-disk overhead of storing them adds up, as does the bookkeeping
every node keeps for each partition it owns, however little that partition happens to hold. There
is no formula for the right answer. It depends on how large the dataset is expected to become and
how much per-partition overhead the particular engine carries, and neither of those is knowable at
the point where the number has to be chosen. Kafka's one-way partition count does at least show
which way the two mistakes differ. Guessing high costs a fixed overhead per partition, paid for as
long as the cluster runs. Guessing low costs a change to the mapping later, which is disruptive to
everything relying on where a given key currently lives.

## Dynamic partitioning

Splits large partitions automatically, and merges small ones back together automatically. Either
operation is a data movement carried out while the cluster carries on serving traffic, which is
where the difficulty is. The bytes being copied compete with live requests for disk and network.
Requests for the partition being moved have to keep finding it right through the moment ownership
changes hands. And shifting a partition off an overloaded node puts still more load on that node
while the copy is in flight — its being overloaded is what triggered the move in the first place.
Tune the thresholds too eagerly and a cluster can spend a serious fraction of its capacity shuffling
data between nodes rather than answering queries.

[^1]: **Apache Kafka documentation**, the basic operations guide, covering topic modification. It
      is the source for partition counts being one-way, and for the warning that adding partitions
      shuffles the `hash(key) % number_of_partitions` mapping without redistributing existing data.
      [kafka.apache.org](https://kafka.apache.org/10/operations/basic-kafka-operations/)

## Related

- [[Replication]] - partitioning is configured alongside replication.
- [[Database Comparisons]] - Cassandra partitions by cluster key, HBase by range.
