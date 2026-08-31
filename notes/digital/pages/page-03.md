## Page 03

WAL → Monotonically Increasing Seq.

### → ==Index Conclusions==

### → ==ACID Transactions==

- All writes Save or none ← Atomicity
- All fails occur gracefully ← Consistency
- No Race condition ← Isolation
- Committed writes don't get lost ← Durability

### → ==Read Committed Isolation==

- DB are multithreaded → Concurrent processes

- Dirty Write → Writing over uncommitted values
  - ↳ Fixed w/ locks (Row lvl)

- Dirty Reads → Reading uncommitted values
  - ↳ Row level lock
    - ↳ Slow
  - ↳ Store old value until commit

### → ==Snapshot Isolation==

Repeatable read / Read skew

Store all the values with WAL TXN number.

- ↳ We don't delete old value
- ↳ when reading read last valid value at txn.
- ↳ Do not consider value that come after the txn.
- ↳ DB snapshot
