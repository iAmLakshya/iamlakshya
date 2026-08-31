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
