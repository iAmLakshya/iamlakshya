## Page 17

- Raft creates fault tolerant linearizable DB
- (-ve) Raft is slow (leader is a bottleneck)
- Raft is fault ~~taut~~ tolerant, but it doesn't ~~rep~~ replace two phase commit since all writes to replicas are the same.

→ ### ==Zookeeper - coordination Services==

A coordination service is KV store that allow us to store this data in a reliable way.

eg. Zookeeper, Etcd. ↗ (Raft based)

  ↳ Zab

Consensus is slow, but somehow we need it.

- Can always read from the leader (Slow)
- If you want to read from multiple nodes, <u>Sync</u> will keep read linearizable ↰
  - ↳ only needs to be done once
    - ↳ Greater read throughput as Result

Too slow to be used for app. data, only KV pair of config for your backend that need to be correct.

Built ~~of~~ on top of cons. algo. to maintain ~~[cancelled, illegible]~~
                                                linearizability
