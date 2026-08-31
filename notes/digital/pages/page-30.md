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
