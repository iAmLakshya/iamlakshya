## Page 34

→ ==Kafka v/s Rabbit MQ.==

- In-memory message broker
  - ↳ RabbitMQ, ActiveMQ, Amazon SQS
- Log-based message brokers
  - ↳ Kafka, Amazon Kinesis

### In memory message broker

- → Round Robin delivery leads to more throughput
  - ↳ (-ve) but out of order message
  - ↳ To handle messages in order we need to <u>fan-out</u>
- ↳ Messages in-mem are deleted,
  - ↳ Poor fault tolerance
  - ↳ No replayability.

> **[margin note]** ↓ Separate Queues for separate consumers

```
                                  Ack
                              ↖ ‑ ‑ ‑ ‑ ─┐
                        ┌ ‑ ‑ ‑ ‑ ‑ ‑ ‑ → ┌──────────────┐
                        ↓                 │  Consumer 1  │
   O ──→ O ──→ O ──→ ⊗ ← temp delet,      └──────────────┘
                        perm. after Ack
       ↖    ↑
   ⌣‑‑‑‑‑‑‑‑⌣   ‑ ‑ ‑ ‑ ‑ ‑ ‑ →  ┌──────────────┐
   Linked List        Ack        │  Consumer 2  │
    (Queue)                      └──────────────┘
```

### Log-based message broker

- → All consumers reading from a Queue get every
  message in order.
  - ↳ one slow to process message slows processing of rest
    - ↳ need to partition to inc. throughput
- ↳ More durability, messages not deleted on disk
  - ↳ can be replayed later
