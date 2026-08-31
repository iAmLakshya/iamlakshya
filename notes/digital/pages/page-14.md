## Page 14

- ↳ Receiver goes down?
  - ↳ Txn can't commit, coordinator needs to send it messages until it comes back up

Dist. Txn are hard & dangerous
  - ↳ avoid when possible

→ ### ==Consistent Hashing==

hash(key) % n          n = no of nodes
  ↓
Modulus doesn't work
  - ↳ v. sensitive to node count. (not efficient)

Dist. keys evenly
  - ↳ Minimal data sent over net on rebalance
  - ↳ Great for partitioning & load balancing
  - ↳ K ⟶ the no. of partitions per node
    - ↳ we can think of each node as having a fixed no. of partitions per node

### total fixed partitions per sys

```
 ┌───┐ ┌───┐ ┌───┐                        ┌───┐  ┌───┐
 │ 4 │ │ 4 │ │ 4 │ ──── loose node ────→  │ 6 │  │ 6 │
 └───┘ └───┘ └───┘  \                     └───┘  └───┘
 └────────┬───────┘   \
       12 part.        \                  ┌───┐  ┌───┐
                        \                 │ 3 │  │ 3 │
                         └─ gain node ─→  └───┘  └───┘
                                          ┌───┐  ┌───┐
                                          │ 3 │  │ 3 │
                                          └───┘  └───┘
```
