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
