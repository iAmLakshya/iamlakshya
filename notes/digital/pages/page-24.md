## Page 24

↳ Client writes into replication pipeline

```
        ←—— Ack ——      ←—— Ack ——       ←—— Ack ——
   웃                 ___              ___              ___
   |                ( A )            ( B )            ( C )
        ——write——→   ‾‾‾   ——write——→  ‾‾‾  ——write——→  ‾‾‾
        once
```

→ This is not strongly consistent

- → Failed replication ( A ↛ B, or B ↛ C )
- → Dropped Ack
- → Client can try again
- ↳ Tries to be consistent, but is not

### High availability HDFS

↳ Single NN is point of failure.

```
 ┌──────────────┐   |     ○----- - -            ┌───────────────┐
 │  Primary NN  │---→   ( )          -  ○  ---→ │ Secondary N.N │
 └──────────────┘   |    \        - -    |      └───────────────┘
        \           |     \  ( )         |            ↑
         \          |      ‾‾‾‾          |           /
   WAL    ——→            Dist. Log       |         State
                        (Zookeeper)      |        Machine
                     Strongly consistent |      Replication
                          consensus
```

Hadoop is a fundamental building block for
a lot of today's distributed systems. It is rack
aware FS is a major optimization. ~~Many of our~~
