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
