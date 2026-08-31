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
