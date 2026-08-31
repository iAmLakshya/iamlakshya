## Page 08

- → Shards v/s partition matrix
- → Split brain (2 leaders)

### Consistent prefix reads

↳ Keep track of causal deps of write and put them on the same partition

→ ==Single Leader Replication==

```
                                        ┌────────────┐
                                        │  Follower  │
   ဝ                  ┌──────────┐  ┌──>│            │
  ─人─  ── w ──>       │          │ ╳╳   └────────────┘        ဝ
   ┃                  │          │╳   ╳ ─────────           ─人─
  ╱ ╲                 │          │  async         ──── R ──>  ┃
                      └──────────┘ ╳                         ╱ ╲
                        Leader      ╳
                                     ╳   ┌────────────┐
                                      ─> │            │
                                    ↑    │            │
                                    └────└────────────┘
                                          ──> Sends repl. log
```

- (+ve) Inc. durability
- (+ve) Inc. read throughput

### Follower goes down?

↳ Rebuild from Repl. log (diff. from leader)

### Leader goes down?

↳ we need distributed consensus

→ ==Multi Read Replication==

```
                                              ↓ w
                                             (L) ──> (F)
              ↓ w              <─────────────  ↗
             (L) ────────────────             ╱
            ↙   ╲                            ╱
          (F)     ╲                         ╱
                    ──────────>  (L) ──> (F)
                                  ↑ w
```
