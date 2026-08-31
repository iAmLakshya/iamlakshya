## Page 25

→ ==Hbase==

### Problems with hadoop

- ↳ No way to make an adhoc update to one file at a time and edit one piece of data.
  - ↳ Need to write whole file again.

Hbase → DB built on top of hadoop
- ↳ Allows for quick queries/key updates
  - ↳ via LSM
- ↳ Allows for good batch processing abilities due to data locality
  - ↳ via column oriented storage
  - ↳ via range based partitioning.

### Hbase data model

- ↳ wide key store (NoSQL) → Similar Cassand.
- ↳ No dedicated cluster key = range based partitioning.

### Hbase architecture

```
                                             ZooKeeper
        whom to                                 ( )———————( )
   O  ———— write ———→  ┌──────────┐          ↗   ↑  \        \
  /|\                  │  Master  │ ←————————'   |   ↘         \
  / \  ←———————————────│   Node   │              ( )            ┌───────────┐
        w to node      └──────────┘               \_____↗       │ Secondary │
   ↑                                                            │   Node    │
   └──────────────────────┐                                     └───────────┘
                    write │                        └─────────────────┘
                          ↘                             High Avail.

  ┌───────────────────┐   ┌───────────────────┐
  │ ┌───────────────┐ │   │ ┌───────────────┐ │   Hbase
  │ │  Region Node  │ │   │ │  Region Node  │ │
  │ └───────────────┘ │   │ └───────────────┘ │
  │ ┌───────────────┐ │   │ ┌───────────────┐ │   HDFS
  │ │   Data Node   │ │   │ │   Data Node   │ │
  │ └───────────────┘ │   │ └───────────────┘ │
  └───────────────────┘   └───────────────────┘
     Comp 1, node 1           Comp 2, node 2
```
