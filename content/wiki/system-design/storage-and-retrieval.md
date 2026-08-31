---
title: "Storage and Retrieval"
description: "Hash indexes, B-trees, LSM-trees with SSTables, the write-ahead log, column-oriented storage and serialisation formats"
section: "system-design"
order: 2
tags: ["storage-engines", "indexes", "lsm-tree", "b-tree"]
source:
  notes: ["notes/digital/pages/page-01.md", "notes/digital/pages/page-02.md", "notes/digital/pages/page-03.md", "notes/digital/pages/page-05.md", "notes/digital/pages/page-06.md"]
---

# Storage and Retrieval

An index is a second copy of part of the data, held in whatever arrangement the queries want to read
it in. The work of sorting or hashing happens once, at write time, instead of every time somebody
asks a question. `Index ⇒ R↑ W↓`. Write throughput is what pays for that. Every write touching an
indexed column has to drag the pre-computed structure back into agreement with the table, and the
more indexes there are on that column, the more structures need dragging. Which is why bulk loads
routinely drop their indexes first and rebuild them at the end — one sort over the finished table is
cheaper than keeping an index correct through a million separate inserts.

## ==Hash indexes==

A hash of the key points straight at the value, `h(key) → value`. When two keys land in the same
bucket the implementation either probes for the next free slot or chains the entries off that
bucket. Either way, lookup and insert are `O(1)`: the hash function computes the location, and
nothing has to be searched for.

The catch is that this only works for equality. PostgreSQL's own documentation says such indexes
"can only handle simple equality comparisons", and MySQL's says they "are not used for comparison
operators such as `<` that find a range of values".[^4] You can ask a hash index whether a
particular key is present and get an answer immediately. You cannot ask it anything at all about the
keys either side of that one.

The arrangement works much less well once disk is involved. A hash scatters keys deliberately, so
two keys written one after another end up nowhere near each other and there is no locality left for
the disk to exploit. The usual response is to keep the index in RAM, which is expensive, and which
caps the dataset at however many keys fit in memory. It also leaves nothing durable behind. After a
crash the whole index has to be rebuilt by reading the write-ahead log from end to end, and that
replay is slow for the same underlying reason: the log is in write order rather than key order, so
there is no structure in it to take advantage of. Bitcask makes the trade explicit rather than
pretending it is not there. Reads never require more than a single disk seek, and in return the
keydir has to fit entirely in RAM.[^4]

Ordering is the other casualty, and it goes by design rather than by accident, since a good hash
function is one that spreads keys that were adjacent as far apart as it can. Answering a range query
over a hash index would mean examining every key the index holds and keeping the ones that fall
inside the bounds, which costs the same as scanning the table and skipping the index entirely. A
tree keeps its keys sorted instead, so a range scan descends once to the lower bound, walks the
leaves in order from there, and stops when it goes past the upper bound.

## ==B-tree==

A B-tree is built to live on disk, and it stays balanced without anybody having to rebalance it.
When a node fills up it splits in two and pushes a separator key up into its parent. If that push
makes the parent overflow, the parent splits as well, and so on upwards. Usually the splitting stops
a level or two in and the tree gets no deeper at all. It gains a level only when the root itself
splits, and since there is exactly one root, that event moves every leaf down together. There is no
ordering of inserts, however badly chosen, that leaves one key at the bottom of a long thin branch
while the rest of the tree stays shallow.

That uniformity matters because height is what a lookup on disk actually costs. Each level of the
tree is one page fetched from disk, so a tree of height four answers any lookup in four page reads,
and it makes no difference which row was asked for. Height grows as the logarithm of the row count,
with the fan-out of a node as the base of that logarithm, which means the way to make a tree
shallower is to make its nodes wider rather than to do anything clever with the algorithm.

Node width, in practice, is the page size. PostgreSQL uses 8 kB pages, InnoDB 16 kB and SQLite 4 kB.
All three are configurable; InnoDB's ceiling is 64 kB.[^1] The page is also the unit of transfer
between disk and memory, which is why it fixes the fan-out. A 16 kB page holds roughly twice as many
separator keys as an 8 kB one, and doubling the fan-out is enough for a large tree to lose a level
outright. The cost runs in the other direction, however: a bigger page drags more bytes off disk to
satisfy a lookup that only wanted one row, and those bytes occupy buffer pool that something else
could have been using. How the two effects net out depends on how much of each page a typical query
in that workload actually reads, and the three engines evidently made three different guesses about
their typical workload.

<!-- FIGURE: BTreeFanout -->

Range queries come free from the same ordering that makes lookups cheap. Leaf pages hold their keys
sorted, so a scan descends once to find the lower bound and then walks sideways through pages that
are already next to each other. And unlike a hash index, only the path from root to leaf has to be
resident in memory at any one moment, which means the size of the dataset is limited by how much
disk there is rather than by how much RAM.

## ==LSM-tree and SSTables==

Writes land in a balanced tree held in memory. When that tree grows past its threshold the engine
resets it and flushes the contents to an <ins>immutable SSTable on disk</ins>. The flush is cheap
because it is one sequential write of data that is already in sorted order, and because nothing
written earlier has to be edited in place. That second rule leaves a delete with nowhere to go, as
there is no old value available to overwrite. So a delete is written down as a tombstone, a marker
recording that the key is gone.

Tombstones are not free after that. A tombstone has to shadow every older version of its key, so a
read walks down the levels until it meets either a value or the tombstone, whichever comes first,
and a lookup for a key that was deleted does as much work as a lookup for a key that is still there.
The tombstone cannot be discarded early, either. It has to survive until compaction has passed over
every SSTable that could still be holding an older value of that key. Drop it before then and the
older value is uncovered again, and the deleted row comes back.

A read checks the in-memory tree first and then the SSTables. Despite the name, an LSM-tree is not
one tree that a lookup descends. It is a stack of sorted runs, and a lookup probes them level by
level. The cost therefore tracks the *number of levels*, which is `log_T` of the data size, rather
than the depth of any single structure. With Bloom filters in front of the runs, a successful point
lookup costs `O(1)` disk I/Os.[^2]

Two structures sit in front of the runs to keep that probing cheap. The first is a sparse index,
which stores one entry per block rather than one entry per key, an entry per key being about as
large as the data it indexes. Being small, it can be held in memory and binary-searched, which
brings a lookup down to a single disk seek: find the right block in memory, then read that one
block. LevelDB and RocksDB call it the "index block".[^3]

The second is a Bloom filter, one per SSTable, which answers whether a key might be in that file so
that a read can skip the files that definitely cannot contain it.[^3] It can only be wrong in one
direction. When the filter says no, the key is genuinely absent and the read stops there without
touching disk. When it says yes, the key is probably present but might not be, and some proportion
of the time the read goes to disk and comes back with nothing. Because there is one filter per
SSTable, the saving grows with the number of files a lookup would otherwise have had to open, and it
is largest for keys that are not in the store at all, since those are exactly the lookups that would
otherwise have had to check every file before giving up.

The filter tends to get described as though it were part of the file format, when in fact neither
implementation builds one until somebody asks for it. RocksDB's `BlockBasedTableOptions` and
LevelDB's `Options` both ship `filter_policy = nullptr`, which means an engine nobody has configured
builds no filter at all and probes every SSTable it holds. The figure of ten bits per key, quoted
almost everywhere, is a convention people set rather than a default they inherit. RocksDB's
documentation calls it a setting that works "well for many workloads" and notes that the bits per
key are continuously adjustable from 1 to 20 or more, which is about as close to a recommendation as
the project is willing to give. Its own table puts 9.9 bits per key at a 1% false-positive rate,
with the cache-local variant working out to 0.95% at 10 bits. LevelDB publishes no rate at all and
describes the benefit instead as roughly a hundredfold cut in unnecessary disk reads.[^6]

Compaction is the background process that merges sorted runs together and reclaims the space taken
up by values that have since been superseded. It exists because of the thing that made the writes
cheap in the first place: an LSM-tree can accept a write quickly only because it never goes looking
for the old version of the row. It appends the new value and leaves the contradiction to be sorted
out later. Nothing stops the same key from sitting in four different files with four different
values and a tombstone above all of them, and until a merge pass collapses that stack, every read of
the key pays for the whole history.

That cheapness is paid for in write amplification. RocksDB puts the write amplification of levelled compaction
at "often larger than 10", and its tuning guide works a five-level example at 10x fan-out out to `1
+ 2 + 10 + 10 + 10 = 33`.[^7] That is thirty-three bytes written to disk for every byte the
application handed over — and it is offered as a typical figure rather than as a ceiling.
Write-optimised, in the LSM sense, is a claim about latency: the write returns quickly. The total
volume of data reaching the disk goes up rather than down, and most of it goes down during
compaction, at a time the engine picks and the application has no say in.

<!-- FIGURE: LsmFlush -->

### The three structures side by side

| | Hash index | B-tree | LSM-tree |
|---|---|---|---|
| Point lookup | `O(1)`, one seek | one seek per level | probes each level, `O(1)` I/Os with a Bloom filter |
| Range query | impossible, ordering is destroyed | cheap, keys are already in order | possible, merges across runs |
| Write path | in place | in place, may split a page | append only, sorted in memory |
| Lives on | RAM, keys must all fit | disk | memory then disk |
| Pays for it in | durability and dataset size | write cost on every insert | write amplification and compaction CPU |

<!-- FIGURE: WriteAmplification -->

## Write-ahead log

The write-ahead log is a monotonically increasing sequence of numbers. Every write is appended to
the log before it is applied anywhere else, and the number it collects on the way in places it in a
total order against every other write the database has accepted. Recovery is then a replay forward
from the last position known to be good, applying each record in turn. The useful property is that a
row version is named by a number rather than by a time. No clock is involved, so nothing here
depends on two machines agreeing about what time it is.

## ==Column-oriented storage (Parquet)==

Column-oriented storage is better when what you want is all the values from one column, which is
what analytical queries almost always want. A typical analytical query touches two or three columns
across an enormous number of rows, summing one of them and grouping by another. A row store serves
that badly. Its unit of contiguous layout is the row, so reading two columns means reading every
column of every row off disk and then throwing away most of what came back. A column store lays each
column out as one long contiguous run and reads only the columns the query actually named.

That layout also compresses well, because a column holds values of one type, often drawn from a
small set. Bitmap encoding and run-length encoding are the schemes that exploit it. The payoff is
not only disk space, though: less data crosses the network, and more of the working set fits in CPU
cache while the scan is running.

Predicate push-down uses metadata to avoid reading data at all. Each chunk of a column carries a
short description of what it contains, and a filter can be evaluated against that description first,
ruling the whole chunk out before a single byte of it is decoded. In Parquet the description is a
`Statistics` record holding the minimum and maximum values for the chunk and the count of nulls,
with the count of distinct values optional.[^5] A query filtering on `amount > 1000` reads the
maximum for a chunk, sees that it is 400, and skips the chunk without decompressing any of it.

Writing to that layout is where it gets painful, for two separate reasons. The first is sort order.
The value at position `n` in one column file has to line up with the value at position `n` in every
other column file, or the rows cannot be put back together, which means every column shares a single
sort order. An ordering chosen because it makes one column compress well is therefore imposed on
every other column in the table, whether it suits them or not. The second reason is the write
itself. A single row's values belong in as many different places on disk as the table has columns,
and each of those places is a compressed run that has to be decoded and re-encoded around the new
value. One small insert fans out into as many rewrites as there are columns.

The way out is to keep writes away from the columnar files altogether. They land first in an
in-memory balanced search tree, still row-oriented, in the same shape as the table they came from,
and they are exported to columnar files later, in batches. Batching is what makes the fan-out
affordable: a thousand rows written together decode and re-encode each compressed run once between
them, rather than once each.

<!-- FIGURE: RowVsColumn -->

## ==Data serialisation frameworks==

JSON and XML are human readable, which is most of their appeal, but they lack type annotations and
they carry a lot of overhead. A reader has to work out for itself whether a field holds a number or
a string, and every record repeats the full text of every field name it contains, so a million
records carry a million copies of the same names.

Agreeing a schema in advance makes the data much smaller, at the cost of being able to read it by
eye, since the encoding is then binary. The saving comes almost entirely from leaving the field
names behind: both sides already know the shape of the record, so the wire carries the values and
very little else. The CPU cost of encoding and decoding is minor next to what is saved. Protobuf and
Thrift work this way. What you give up is any warning when the data changes, because bytes that
carry no description of themselves cannot tell a reader that the schema has moved on underneath it.

Apache Avro builds the schema from the column names and keeps it in a schema registry that decoders
consult. When a reader schema and a writer schema disagree, the two are resolved against each other
by matching on the fields they have in common and filling anything missing with defaults. That
resolution step is what allows the schema to be updated on the fly, without having to upgrade both
sides of the wire at the same moment.

[^1]: **PostgreSQL 18 documentation, 65.6 Database Page Layout**, the PostgreSQL Global
      Development Group - "Every table and index is stored as an array of pages of a fixed size
      (usually 8 kB...)". Corroborated for the other two engines by the **MySQL 8.0 Reference
      Manual** ("The default size of an index page is 16KB", with valid values 4KB to 64KB) and
      the **SQLite PRAGMA documentation** ("beginning with SQLite version 3.12.0 (2016-03-29),
      the default page size increased to 4096"). Source for the correction to the 256 KB figure.
      [postgresql.org](https://www.postgresql.org/docs/current/storage-page-layout.html),
      [dev.mysql.com](https://dev.mysql.com/doc/refman/8.0/en/innodb-physical-structure.html),
      [sqlite.org](https://www.sqlite.org/pragma.html#pragma_page_size)

[^2]: **LSM-based Storage Techniques: A Survey**, Chen Luo and Michael J. Carey, arXiv:1812.07527,
      VLDB Journal 2020 - §2.3 gives point lookup cost as `O(L)` for leveling and `O(T·L)` for
      tiering without Bloom filters, where `L` is the number of levels, and notes that "the
      successful point lookup I/O cost for both leveling and tiering will be O(1)" once Bloom
      filters are in play. Source for the correction to the "LSM is a tree so reads are O(log n)"
      reasoning.
      [arxiv.org](https://arxiv.org/pdf/1812.07527)

[^3]: **Bigtable: A Distributed Storage System for Structured Data**, Chang et al., Google, OSDI
      2006 - source for both optimisations. On the sparse index: "A lookup can be performed with a
      single disk seek: we first find the appropriate block by performing a binary search in the
      in-memory index, and then reading the appropriate block from disk", with one index entry per
      64 KB block. On Bloom filters: "A Bloom filter allows us to ask whether an SSTable might
      contain any data for a specified row/column pair... most lookups for non-existent rows or
      columns do not need to touch disk." LevelDB and RocksDB implement both; their term is
      "index block" rather than "sparse index".
      [research.google](https://static.googleusercontent.com/media/research.google.com/en//archive/bigtable-osdi06.pdf)

[^4]: **PostgreSQL 18 documentation, 11.2 Index Types** and the **MySQL 8.0 Reference Manual,
      Comparison of B-Tree and Hash Indexes** - source for hash indexes being equality-only. The
      `O(1)` and "bad for disk" claims are not stated in complexity terms by any primary
      documentation. The nearest primary evidence is the **Bitcask** paper (Sheehy and Smith,
      Basho, 2010), which keeps its hash index entirely in RAM: reads never require "more than a
      single disk seek", at the cost that "the keydir structure... must fit entirely in RAM".
      That trade is the real content of "hash maps are bad for disk".
      [postgresql.org](https://www.postgresql.org/docs/current/indexes-types.html),
      [riak.com](https://riak.com/assets/bitcask-intro.pdf)

[^5]: **parquet.thrift**, the Apache Parquet format specification - the `Statistics` struct
      carries `min`/`max` (deprecated in favour of `min_value`/`max_value`), `null_count`,
      `distinct_count`, exactness flags for the bounds, and `nan_count` for floating-point
      columns. These are what a predicate is evaluated against before any data is decoded.
      [github.com/apache/parquet-format](https://github.com/apache/parquet-format/blob/master/src/main/thrift/parquet.thrift)

[^6]: **RocksDB Wiki, Bloom filter page** - the engine's maintainer-written documentation on
      filter sizing. It gives 10 bits per key as the setting that "works well for many workloads",
      and puts 9.9 bits per key at a 1% false-positive rate. Worth stating precisely: 10 bits per
      key is a convention rather than a default, since both RocksDB and LevelDB ship with
      `filter_policy = nullptr` and build no filter unless asked. LevelDB's own documentation
      states the benefit as "a factor of approximately a 100" reduction in unnecessary disk reads
      and quotes no false-positive rate.
      [github.com/facebook/rocksdb](https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter)

[^7]: **RocksDB Wiki** - the engine's own documentation. Its leveled compaction page puts the
      usual write amplification at "often larger than 10", and the companion tuning guide works a
      standard 10x-fanout example out to roughly 33x, `1 + 2 + 10 + 10 + 10`. Both figures are
      given as typical rather than as bounds.
      [github.com/facebook/rocksdb](https://github.com/facebook/rocksdb/wiki/Leveled-Compaction)

## Related

- [[Transactions and Isolation]] - what the storage engine has to guarantee under concurrency.
- [[Database Comparisons]] - which engines pick which of these structures.
