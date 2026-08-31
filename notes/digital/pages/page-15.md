## Page 15

need to choose a good number:

Too few → part. get too big for the db

Too many → overhead ~~of~~ on disk of storing pad.

### Dynamic Partitioning

- ↳ split automatical.
  - ↳ merge small automatically.
  - ↳ we do it to often the ser are sending ~~tons~~ lot of data over net.

> **[margin note]** "lot" written above the struck-out "tons"

→ ### ==Linearizable Database==

we need it for "correct" reads

- ↳ all the writes are ordered
- ↳ ~~we~~ our reads can never go back in time

Single leader → Repl. logs

Multi leader → ~~Vector~~ Ver. vectors / Lamport clock.

Leader less → Lamport clocks / Ver. vect.

### Lamport clock - O(1) space!

- ↳ can be assigned to each write to order it
- ↳ max(s, c) + 1 ← clock number

### Ver. Vector / Lamport clock → ⊗ not linearizable

- ↳ because ordering is after the fact.

Single leader Replication is NOT linearizable

we need "Total order broadcast"

- ↳ Every node has to agree on the order of writes
- ↳ In case of faults we cannot lose any writes
- ↳ we do this via "Dist consensus"
