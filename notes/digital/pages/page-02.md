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
