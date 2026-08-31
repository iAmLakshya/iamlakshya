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
