## Page 21

→ ==MongoDB v/s Apache Cassandra==

### MongoDB

- ↳ B-trees
- ↳ Acid txn
- ↳ Single leader repl.
  > **[margin note]** } SQL typical — brace grouping B-trees / Acid txn / Single leader repl.
- ↳ but <u>doc-oriented data model</u> + rich feat. set
  - ↳ flexibility of data model

~~Cassandra~~

### Cassandra

- ↳ wide column data mode
- ↳ clusterkey, sortkey, ... optionals

### Cassandra partitioning

- ↳ via the cluster key
- ↳ Config. shared via gossip
- ↳ All R/W should go to one partition, very little support for distributed txn.
- ↳ Local index with sortkey in each partition.
- → very oppinionated. *(brace groups the two lines above)*

```
             gossip
                ↘
       ⇄⇄⇄⇄⇄⇄⇄⇄⇄⇄⇄⇄ ( )
  ( )                   ⇅
         Hash Ring      ⇅
       ⇄⇄⇄⇄⇄⇄⇄⇄⇄⇄⇄⇄ ( )
```

### Cassandra replication

- ↳ Leaderless replication → Read repair, anti-entropy
  - ↳ configurable            ↳ merkle trees
- ↳ Write conflicts? ──────────┐
  - ↳ Last write wins          ↓
  - ↳ Lost writes    (see Riak with CRDTs)
