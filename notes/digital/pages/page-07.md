## Page 07

→ ### ==Intro to Replication==

- Redundant data → Geolocate
- Increased DB throughput

### Synchronous Replication
- ↳ confirmation from all replica
- ↳ Strong consistency → Stale data not possible
  - ↳ Rare, but used

### ==Async Replication==
- ↳ Confirmation only from write node
- ↳ eventual consistency
  - ↳ Stale data possible.
  - ↳ common

```
Copying statements → Non-deterministic   X
  ↓
WAL → useless if diff. software/version of DB
  ↓        ↳ MySQL → Postgres
  ↓
Replication Log
   (logical log)
```

### Dealing with Stale Reads

- Reading your own writes
  - ↳ using timestamp.

- Monotonic writes
  - ↳ user reads off same replica every time
  - ↳ Id mod (uid = 20, 20%3 = 2)
