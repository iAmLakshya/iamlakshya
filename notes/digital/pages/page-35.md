## Page 35

```
        DbR
          │
          ↓                                  ┌──────────────┐
  ┌────┬──┴──┬─────┬─────┬─────┐      ⌐──→   │  Consumer A  │
  ; M5 │ M1  │ M2  │ M3  │ M4  │      │      └──────────────┘
  └────┴─────┴─────┴─────┴─────┘      │
           for B  ─────  for A  ───────────→ ┌──────────────┐
        └────────────┬───────────┘           │  Consumer B  │
                     │                       └──────────────┘

           Sequential writes on disk
```

### Memory based

- ↳ Max throughput, order doesn't matter
- ↳ Users posting videos, you want to encode them
- ↳ Users posting tweets that will be sent to feed cache
  of followers

### Log based

- ↳ Want all items in queue to be handled by one
  consumer, in order, ability to replay
- → Sensor metrics coming in
  - ↳ want to take average of last n events
- ↳ Each write from a dB that we will put in search idx

→ ==<u>Stream Joins/Enrichment</u>==

Augmenting events with more data.

### Stream-stream Joins

- ↳ Want to match events from two streams using
  common key
- ↳ Cache event in consumer, enrich when other
  event arrives
  - ↳ when enriched, push to another queue (sink)
