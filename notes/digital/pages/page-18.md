## Page 18

> **[margin note]** Non-relational *(written above, correcting the struck-through word below)*

### → ==Relational v/s ~~Documents~~ based DB==

- Rel → poor Data locality in dist. sys

- Non-rel → we have duplicate data
  - ↳ Relevant data together
    - ↳ <u>Denormalized</u>
    - ↳ Whole doc over network
    - ↳ better for highly decoupled non-rel. data
    - ↳ Disjoint data

### → ==MySQL v/s PostgreSQL==

Common feat.
- → B-tree based indexes
- → Single leader replication →
- ↳ Configurable isolation levels

```
                                                    (SSI)
     MySQL : 2P Lock              |   Postgres - Serializable Snap. Iso.
                                  |
                                  |
 - Every row has locks            | - Txn read from data snapshot
 - Read only txns can grab        | - If Txn reads value which is
   in shared mode                 |   modified by another txn
 - To write must grab in          |   before committing, original
   excl. mode                     |   needs to be _rolled back_
 - Lots of deadlock to            |              ↓
   detect and undo.               |            ↳ OCC
                                  |         ↳ optimistic con. control
```

Conclusion ?
- ↳ <u>Use SQL both for that needs to be normalized and for data needs to be correct</u>
- ↳ In theory SSI > 2PL, if <u>many conflicts</u> pessimistic maybe better
       (2PL)
  - ↳ many overlaps   *(arrow points to "many conflicts")*
