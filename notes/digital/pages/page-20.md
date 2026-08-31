## Page 20

Q. Predicate lock?

### Can we solve this with snapshots?

- → w/o some centralized sys. we don't know which snapshots to send
- ↳ Not sufficient

### Typical soln.

- ↳ 2PL
  - → Grab lock on rows &
  - ↳ (-ve) very slow and prevent writes

Spanner allow us to make CCD reads w/o locks

- ↳ uses timestamps (Google True Time)
- ↳ Any write that depends on another write will have a greater timestamp than it.

### Part 1

- ↳ W1: [100, 102] , Δ ≤ 2 sec.
  - ↳ Wait Δ seconds then commit
  - ↳ Actual Tstamp > 102, call it T1

### Part 2

- ↳ We read W1 and writes to part 2,
  - ↳ clearly happens after 102
  - → W2: [x, y] where y > T1
  - ↳ Wait y-x seconds then commit.
    - ↳ T2 > T1

### Δ is as low as possible.

- ↳ GPS & atomic clock in Data center
  - ↳ expensive & proprietary
  - ↳ not pract. for all companies
