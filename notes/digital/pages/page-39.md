## Page 39

→ ==ElasticSearch==

Convenience wrapper around Lucene to allow for fast searching in dist. systems.
- ↳ Rest API
- ↳ Its own Query language
- ↳ Managed replications & partitioning
- ↳ Visualization

### Elastic Search Partitioning

- → ES maintains a <u>local index per node</u>, less duplication

```
+---------+   +---------+          +---------+   +---------+
| a: 1,2  |   | b: 3,8  |   Not    | a: 1,2  |   | c: 2,3,9|
| c: 2,5  |   | c: 3,9  |          | b: 3,8  |   |         |
+---------+   +---------+          +---------+   +---------+
```

- ↳ Try to keep all searches limited to one partition
  - ↳ Eg: part. chat documents by chatId
  - ↳ Otherwise need to aggregate

### Elastic Search caching

- → Normally: Cache piece of idx or full query result
- ↳ ES: Cache parts of query

→ ==Time Series DB==

Great for handling time series/range data
- ↳ Eg.: logs, metrics, sensor reading etc.

Popular Implementations: TimeScale DB, Influx DB, Druid.
