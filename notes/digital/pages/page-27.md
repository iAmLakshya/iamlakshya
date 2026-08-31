## Page 27

→ ==MapReduce==

Allows us to perform batch processing of big data sets
- ↳ Works with data that is already in HDFS

Main Adv.
- ↳ Can run arbitrary code, just define mapper & reducer
- ↳ Runs computations on the same nodes that hold the data
- ↳ Failed mappers & reducers are restarted independently
- ↳ Same node → data locality
- ↳ Designed to be super resilient

Mappers: Obj ⟶ (Key, Value)

Reducers: List(Key, Value) → (Key, Value)

### Map Reduce Architecture

```
          Start (on disk)
         ┌──────────┐        ┌───────┐ ┌───────┐ ┌───────┐  ┌───────┐ ┌──────┐
Node 1   │  ≡       │        │ K₃ V  │ │ K₃ V  │ │ K₃ V ┐│ │ K₃ V  │ │  ≡   │
         │  ≡       │        │ K₁₂ V │ │ K₁₂ V │ │ K₃ V ││ │       │ │      │
         ├──────────┤        ├───────┤ ├───────┤ ├──────┼┤ ├───────┤ ├──────┤
Node 2   │  ─       │        │ K₆ V  │ │ K₃ V  │ │ K₆ V ││ │ K₆ V  │ │  ≡   │
         │  ≡       │        │ K₃ V  │ │ K₆ V  │ │ K₈ V ││ │ K₈ V  │ │      │
         ├──────────┤        ├───────┤ ├───────┤ ├──────┼┤ ├───────┤ ├──────┤
Node 3   │  ─       │        │ K₈ V  │ │ K₈ V  │ │ K₁₂ V┐│ │ K₁₂ V │ │  ≡   │
         │  ≡       │        │ K₁₂ V │ │ K₁₂ V │ │ K₁₂ V┘│ │       │ │      │
         └──────────┘        └───────┘ └───────┘ └───────┘  └───────┘ └──────┘
H. Cluster                    map → sort ⇢ → shuffle → Reduce →
```

> **[margin note]** Materialize on disk (HDFS)

Sort → O(n) merge join
