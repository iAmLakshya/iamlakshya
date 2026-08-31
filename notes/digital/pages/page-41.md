## Page 41

### Optimizing deletes

  ↳ (Recap) Deletes in LSM/SSTables are as exp. as writes
  ↳ Hashing chunktable makes it easy

Time series DB are great optimization for time series data, <u>Knowing how they work under the hood</u> in order to increase performance is extremely useful for any systems design question that involves metrics/logging.

→ ==### Graph Databases (Neo4j)==

Non native graph DB takes existing DB and write a query lang on top of it allowing you to ~~fo~~ traverse graph easily.

- ↳ Slow → O(log|E|) + O(log|N|)
  - ↳ Relational implementation ↑
  - ↳ Non-Relational implementation
    - ↳ O(log(N|)

### Native/Neo4j implementation

- → O(1) time complexity across an edge using <u>index free adjacency</u>

```
        Nodes                        Edges
  Addr   Name   Edge Addr      Addr    Points to   Next E.Addr
  0x001  JOE    null           0x007   0x002       null
  0x002  Jane   0x007          0x008   0x001       null
```

- → We jump around, not loop through
