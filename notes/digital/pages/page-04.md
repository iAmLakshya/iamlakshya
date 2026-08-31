## Page 04

> **[margin note]** (top of page, arrow ← pointing down-left to the "Write Skew & Phantom Writes" heading)
>
> ```
> Read, mod, up
>       ↓
>   ← when Update add new rows
> ```

→ ### ==Write Skew & Phantom Writes==

Grab lock on all relevant rows
  ↳ on all the reads.

Phantom occurs when 2 people write ~~to~~ new
rows that conflicts ~~with~~ the conditions set.
  ↳ No locks to grab.
  ↳ Fixed by materializing writes.
      ↳ Prepopulate rows. to allow locks.

→ ### ==Serial Execution. (Actual/VoltDB)==

Everything on one core
  ↳ Using Disk → Slow → Using memory.
  ↳ Network is slow (Bandwidth)

Stored Procedures → SQL function over network
  ↳ less data to send over networ
  ↳ (-ve) hard to manage wide deployments

→ ### ==Two Phase Locking==

Making concurrent transactions seem as if they
were running on one thread.

### Shared Reader Lock & Exclusive Writer Lock
  ↳ Read, modify, update → predicate valid.

### Slow → Too many deadlocks
      ↳ Detect & Abort → Run again

### Predicate locks → lock on matching rows
      ↳ Slow, eval full query.
