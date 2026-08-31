## Page 11

### State based CRDT

- ↳ Send whole CRDT (merge (local, incoming))
- ↳ (ex) now we have duplicate?
- ↳ Needs to be
  - ↳ Commutative : f(a,b) = f(b,a)
  - ↳ Associative : f(a, f(b,c)) = f(f(a,b), c)
  - ↳ Idempotent
- ↳ works well with ~~gossip protocol~~
  - ↳ Requires no extra messaging infrastructure

### Types of CRDT

> **[margin note]** ← Used by Redis, Riak

- ↳ inc counter
- ↳ inc, dec decreasable counter
- ↳ add, remove sets ⟶ Once removed can't be added
- ↳ merge (unknown)

> **[margin note]** ↓ or tags — Attach unique id to allow re-add

### Sequence CRDT → build event consistent list

- ↳ V. hard because elements are ordered
- ↳ Used in real-time text editors

### ==Leaderless Replication Intro==

```
W ──→ many nodes
R ←── many nodes
```

### Used in Casandra, Riak

### Read repair → updating stale value
