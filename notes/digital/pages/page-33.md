## Page 33

### Change data capture

- ↳ Allows keeping derived data in sync with DB

```
                    w          ,-----.        +--------+        +--------------+
   Client  ------------->     ( DB    ) ----> | Broker | -----> | Search index |
                              `-----'         +--------+        +--------------+
                              source of                          derived data
                                truth
```

### Event sourcing

- → DB agnostic events allow us to build new types of derived data in the future

```
                                   Raw event
                                +----------+          +----------+         ,-----.
   Client  ------------------>  |  Broker  | ------>  | Consumer | ----->  (  DB  )
                                +----------+          +----------+         `-----'
                     x cached                              ↳  +--------+
                                                             | New DB |
                                                             +--------+
```

- ↳ Assumes broker holds onto events

### Exactly once message processing

- ↳ At least once: Fault tolerant brokers
  - ↳ Some disk persistence and replication, cons. ack
- ↳ No more than once
  - ↳ 2PL (commit)  ← Bad & Slow
  - ↳ idempotence

```
        +---------------+                                  +-----------+
        | Coordinator   |                                  |  Broker   |
        +---------------+                                  +-----------+
    can dele  |  ↑ confm   |  ↑     can              ←K:1 |    ↑     | K:1
      ↓       ↓  |         ↓  |     proc?                 ↓    | ack  ↓  seen
              |  ↓ comm    ↓  |                                |
     +----------+       +----------+                +-------------------+
     |  Broker  |       | Consumer |                |     Consumer      |
     +----------+       +----------+                +-------------------+

              2PL                                        idempotence
```

> **[margin note]** Assumes the same consumer sees the same message
