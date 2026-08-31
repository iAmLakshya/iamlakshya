## Page 36

### Stream-table Joins

- ↳ Same as stream-stream but where one stream data comes from Database
  - ↳ Could be via CDC
  - ↳ Naive approach n/w call to DB
  - ↳ Keep in-mem copy of required data
    - ↳ Keep consistent using CDC

### Table-Table Join

- ↳ When we want to get join results as tables change
  - ↳ faster than polling → every 5 sec. query → unmanageable *[inferred — the word runs off the
    right edge of the scan; only "…nab…" is legible. Read from context as a
    drawback of polling.]*
- → Same as stream-Table by now both sources are from CDC of tables (CDC twice)
- ↳ if tables too big for consumer memory
  - ↳ Partition queues
  - ↳ 1 consumer per partition
  - ↳ partition by join key

### Patterns

- → In order to maximize perf. → cache derived state in mem.
- → Issue1 → Memory → less space per consumer
  - → Need a lot of partitioning to hold the data
  - ↳ Queues need to be partitioned the same way as consumer
- ↳ Issue2 → memory → consumer state is not fault tolerant
  - ↳ having WAL isn't enough
  - ↳ Other consumers can process more messages and become inconsistent

### Soln.? → Stream processing frameworks
