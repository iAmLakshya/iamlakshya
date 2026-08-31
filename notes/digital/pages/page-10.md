## Page 10

Timestamp

- ↳ Sender not ~~[struck out]~~ not secure
- ↳ Rec. timestamp not reliable
  - ↳ Clock skew due to Quartz crystal
    - ↳ NTP (Network Time Protocol)
      - ↳ GPS clock
      - ↳ still not reliable, net. delay

We can't order writes using timestamps in dist. sys.

> **[margin note]** → (arrow pointing at the heading below)

### ==Dealing with Write conflicts==

Version vectors    ( [0, 1, 1, 2] )

↓

Store siblings
- ↳ Let user/App layer choose value

CRDT
- ↳ Conflict Free Replicated Data types
- ↳ DB resolves conflicting values themselves

> **[margin note]** → (arrow pointing at the heading below)

### ==CRDT==

Operational CRDT
- ↳ Send operation (inc(0)) instead of vector
- ↳ (-ve) Fails for causal relationships
  - ↳ We need causally consistent message delivery
    - ↳ No drops or duplicates.
    - ↳ Needs to be idempotent
