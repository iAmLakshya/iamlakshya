## Page 26

```
      Client write                    WAL too                        diff part.
            ↖                            ↓                              ↘
             ┌──────────────────────────────────────┐   ┌───────────────────────────────┐
             │                        o             │ ⎫ LSM │  ┌──────────────────────┐ │
             │   Region             /   \           │ ⎬     │  │  Region      o       │ │
             │                     o     o          │ ⎭ flush│ │            /   \     │ │
             │                    / \               │   │    │ │           o     o    │ │
             │                   o   o              │   ↓    │ └──────────────────────┘ │
   HDFS ⎧    ├──────────────────────────────────────┤        │   SSTable      ↓ flush   │
        ⎨    │        ┌─────┐   ┌─────┐             │   W    │  ┌──────────────────────┐│
        ⎩    │  Data  │ ≋≋≋ │   │ ≋≋≋ │             │ ──────→│  │  Data   ┌───┐        ││ ──→
             │        └─────┘   └─────┘             │ ←──────│  │         │ ≡ │        ││
             └────┬───────┬──────────────────────---┘  Ack   │  └──────────────────────┘│
                  │       │                                  └───────────────────────────┘
                  │       │                    Rep. pipeline
              Datanode  SSTable
                        HDD
```

Uses column oriented storage
- ↳ only fetches the rows you want
- ↳ Cache stats per column
- ↳ Column comp
- ↳ Better for analytics queries and batch process
- ↳ (+ve) range based partitioning keeps related data close.
  - ↳ think of ts. which would have diff hashes

Not as good as Cassandra for a typical app. level dB in terms of speed. However If you want to be able to store and <u>Modify</u> big data on HDFS so that you can run analytical batch queries, HBase maybe better option.

(⊞) Sensor data, Analytics
