## Page 16

> **[margin note]** Writes are rejected if it does not achieve quorum from nodes

### → ==Distributed Consensus – Raft Leader Election==

Raft → build dist. log

- If a node loses heartbeat/ping it proposes itself as leader
  - ↳ update epoch to epoch of last leader + 1
  - ↳ If get's "yes" from quorum, it has won election

- ↳ Can't two leader at the same time due to quorum
- ↳ Old leaders can't come back due to fenching token (epoch number)
- ↳ leader has upto date log & backfill stale nodes

### → ==Distributed consensus – Raft Writes==

(Write backfills logs)
- ↳ There is only one leader per turn
- ↳ Successful writes must make log fully upto date
- ↳ If two logs have same turn no. at the same index, they must be ~~totally~~ identical prior to that index

```
                        ^Prefix                    Suffix
        10     4                10        4
   ...   A     D           ...   A    {    F
        20    23                20    {   22

        Leader                    Follower
```

We only send missing ~~for~~ suffix, and take no. of matching prefix
- ↳ If quorum ~~rep~~ responds yes, commit everything until then 2P locking
- ↳ For write to succeed it needs to go through majority of writes
