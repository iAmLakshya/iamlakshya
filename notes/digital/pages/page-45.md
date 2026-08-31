## Page 45

→ ==Distributed Cache writes==

### Write around cache
- ↳ (+ve) Database is central source of truth
- ↳ (−ve) Expensive cache miss
- ↳ Approach: Invalidation v/s stale read (TTL)
  - ↳ When do you need correct data?
    - ↳ Both expensive

### Write through cache
- ↳ (+) Data consistency b/w cache & database
- ↳ (−) can have correctness issues is not usig 2PL (slower)
- ↳ Approaches: YOLO v/s 2PC

### Write Back cache ✓

> **[margin note]** Grubhub

> **[margin note]** ↙ mini batch flush

- ↳ (+) Lowest latency writes (eventual write to DB)
- ↳ (−) Data Staleness / correctness issues
- ↳ Approaches: YOLO v/s Dist. Lock + replication
  - ↳ cache puts a lock on DB preventing stale reads (Bad)

### Write Around: Write like normal, cannot avoid cache miss
- ↳ Low complexity, less read benefits, no write penalty

### W. Through: Super slow with 2PC, pretty slow without it
- ↳ Writes much slower, consistent data, no miss

### W. Back: Write directly to cache, async flush to db
- ↳ Writes & reads very fast, can lead to consistency issues.
