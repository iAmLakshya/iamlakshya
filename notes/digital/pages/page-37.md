## Page 37

→ ==Apache Flink==

- Stream processing frameworks
  - ↳ eg → Flink (per event)
    - ↳ Spark streaming (Micro-batching)
      - ↳ Tez, Storm

> **[margin note]** (brace spanning the three framework lines) Declarative — Specify a topology and let the workout the details

Flink allows us to gurantee that each message only effects state once.

Stream processing frameworks are not type of message brokers, they are specifically consumers.

Flink ensures that each event impacts state exactly once
- ↳ Barriers ensure ~~casually~~ causal consistency
- ↳ Node takes snapshot when it recieves barriers from all of its input queues
- ↳ Stores checkpoints externally (S3)

~~eg~~

```
                (B)
                 ↘  ┌────┐
     ┌───┐  ──────→ │ C1 │ ────────────┐
     │ P │                             ↘
     └───┘                          ┌────┐        Requires
        │    (B)                    │ C3 │        Replayable
        └──────────┐                └────┘         queues
                   ↘   ┌────┐    ↗
                       │ C2 │ ──┘
                       └────┘
                                  checkpoint
                                  ⇒⇒  (S3)
```

C3 will checkpoint only when it will recieved (B) from ~~b~~ both C1 & C2

Every checkpoint only includes messages before the barriers so we can just resume each consumer reading messages after the barrier.
