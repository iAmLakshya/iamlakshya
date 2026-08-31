## Page 09

more throughput on write

### Circle topology

```
                 ┌──> ( L ) ───┐
                 │             │  w
                 │             ↓
             ( L )           ( L )
                 │             ↑
              w  │             │
                 └──> ( L ) ───┘
```

### Star topology

```
      ( L )                      ( L )
        ↑ ↘                     ↗ ↑
        │   ↘                 ↗   │
        │     ↘   ↙         ↗     │
        └───→ ( L ) ←───────┘
                ↑ │
                │ ↓
              ( L )
```

### All to All topology

```
              ┌──→ ( L ) ──┐
              │      │      ↘
        ( L ) ←──────┼───────→ ( L )
              ↑      │      ↗
              └──→ ( L ) ←──┘
```

> **[margin note]** Out of order writes?

Modify Rep. log to record which nodes have seen key data change events

- N-leader → w-conflicts
  - ↳ Fix: all writes to a key go to a fixed replica
    - ↳ conflict avoidance
    - ↳ limited write throughput
  - ↳ Last write wins → everything time stamped
    - ↳ Does not work perfectly. (not secure)
