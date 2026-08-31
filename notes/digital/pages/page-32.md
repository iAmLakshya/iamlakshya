## Page 32

### Common stream Processing use cases

- ↳ Metric/log time grouping & bucketing
- ↳ Change data capture
- ↳ Event sourcing

### Time windows

```
Producer ———→ ┌────────┐ ——→ client
              │ Broker │
              └────────┘
```

timestamp ⇒ extract min.

```
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│  A  │  │ B,C │  │     │  │D,E,F│  │  G  │
└─────┘  └─────┘  └─────┘  └─────┘  └─────┘
 0001     0002     0003     0004     0005
 └──────────────────┬──────────────────┘
              1 min tumbling windows
```

```
┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│ A,B, C │   │        │   │ D,E,F,G│   │        │
└────────┘   └────────┘   └────────┘   └────────┘
 0001-0003    0002-0004    0003-0005   0004-0006
 └───────────────────┬──────────────────────┘
               2 min hopping windows
```

Agg. tumbling window gives hopping window

### Sliding window

- ↳ using in-memory queue / linked list
- ↳ As events come we push to Queue
- ↳ pop (head) when node invalid

```
 ✗——→o——→o———→o——→(o)
```
