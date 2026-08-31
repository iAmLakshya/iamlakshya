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
