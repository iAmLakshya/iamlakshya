## Page 05

Snapshot → consistent state at time T

### Index range locking
  ↳ uses table index
  ↳ Grab more predicate lock than necessary
  ↳ (-ve) interfere with many transactions

→ ### ==Serializable Snapshot Isolation (Optimistic con. control)==

Why grab locks when you could just run as normal
and correct mistakes after they happen?

Use SSI instead of 2PL if most trx are overlapping
with each other, otherwise use 2PL.

### Distributed Cockroach → ✗ SSI

→ ### ==Column Oriented Storage (Parquet)==

> **[margin note]** ↖ Apache Iceberg format
> &nbsp;&nbsp;&nbsp;&nbsp;↳ date + min, max, avg metadata

Better when we want to all the values from one colmn
  ↳ Analytics

### Column compression → similar data in column

```
Column compression → similar data in column
  ↑
  │          ↳ Bitmap encoding       ⎤
  │          ↳ Run length encoding   ⎦ dict. comp
  ├→ less data over network
  └→ more data in CPU cache memory
```

### Predicate Push down
  ↳ skip data based on metadata

(-ve) same sort order for all column
(-ve) Write needs to go to diff. places on disk
  ↳ unless write in LSM tree (in-mem, balanced search tree)
      row
