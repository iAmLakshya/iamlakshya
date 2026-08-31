## Page 40

### Optimizing Reads in TS DB

- → Since we mostly cares about a couple of metrics at a time, we should use column ordered storage
  - ↳ (+ve) Less data to cache
  - ↳ (+ve) can cache more
  - ↳ (+ve) better data locality

- → As opposed to one large table with one big index, use many small indexes

```
              Sensor1   Sensor2   Sensor3
                 ↓         ↓         ↓
              +---------+---------+---------+
1:00 - 2:00 { |         |         |/////////|  ──→ Place in cache
              +---------+---------+---------+
2:00 - 3:00 { |         |         |         |
              +---------+---------+---------+
3:00 - 4:00 { |         |         |         |──→ Chunk table
              +---------+---------+---------+
              |_________________________|
                      Hyper Table
```

- ↳ Since most R/w go to just one chunk at a time, we can cache the whole thing.

### Optimizing Writes

- → Imp. to have fast writes when we have a lot of data or everthing else will be slow down
- ↳ Shard by (sensor, time range) for best data locality

```
 +- - - - - - - - - - - - - - - - -+
 | +-----------+   +-----------+   |
 | | Sensor 1  |   | Sensor 2  |   |            o
 | +-----------+   +-----------+   |           / \
 |       ↓               ↓         |  ───→    o   o    →   +------+  +------+
 | +-----------+   +-----------+   |             / \       | ==== |  | ==== |
 | | Chunk 1   |   | Chunk 2   |   |            o   o      | ==== |  | ==== |
 | +-----------+   +-----------+   |                       +------+  +------+
 +- - - - - - - - - - - - - - - - -+
                                            LSM Tree          SSTable
                                            In-memory         on disk
```
