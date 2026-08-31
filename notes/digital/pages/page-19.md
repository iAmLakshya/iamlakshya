## Page 19

==→ VoltDB==

> **[margin note — top right doodle]** a flag on a pole planted in a CPU chip
> ```
>   ╭──────────╮
>   │ ≡≡≡      │
>   │ ≡≡≡      │
>   ╰────┬─────╯
>        │
>     ┌──┴──┐
>    ≡│ CPU │≡
>    ≡│     │≡
>     └┬───┬┘
> ```

### Actual Serial Execution

- ↳ Running everything on one thread
- ↳ Bottleneck : HDD or Network

### Dealing with disk

- ↳ stores all data in memory.
  - ↳ (+ve) Hash idx for O(1) lookup and writes
  - ↳ optional WAL, optional tree set backups
  - ↳ (-ve) less data per node means more partitions
  - ↳ (-ve) More cross partition R/w
    - ↳ 2PL

### Dealing with Net. latency

- ↳ use stored procedures.

### VoltDB

→ very int. approach in achieving ACID txn without 2PL or SSI.

- ↳ However, must make a lot of sacrifices because of this.

==→ Spanner==

### Causally consistent dist. reads

- ↳ If write B depends on write A and my read contains write B, it must also contain write A.

```
   1. ┌─ T1 sees comment1
      │
       ╲                                     ┌ T4 sees comment3,
        ↘      ╭─────╮        ╭─────╮  ✓ ────┤
               │     │        │     │        └ WTF is comment2?
               │  A  │        │  B  │
        ───→   │     │        │     │
               ╰─────╯        ╰─────╯
                                  ↖  3. T3 writes comment3 replying
   2. T2 writes comment 2                     to comment2

               └──────────────┬──────────────┘
                     Not causally consistent
```
