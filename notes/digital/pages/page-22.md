## Page 22

### Cassandra Single node

- ↳ LSM trees + SSTables → Write optimized
- ↳ Only row level locking, no ACID txn

MongoDB → When you need the data gurantees of SQL DB with schema flexibility of NoSQL

Cassandra → Incredible high single partition write throughput and read throughput.
- ↳ Very poor data gurantees.

Eg. FB messages
- ↳ clusterKey = ChatId
- ↳ sort key = timestamp
- ↳ doesn't matter if the occasional message get dropped.

### → ==Hadoop==

### Distributed computing framework
- ↳ data storag : HDFS
- ↳ Big computing : MapReduce, Spark

### HDFS
- ↳ distributed file store with "Rack aware" storage
  - ↳ Fault tolerant

```
"Rack aware"
     |
     ↓
Location of nodes
     ↓
Reduced latency
```
