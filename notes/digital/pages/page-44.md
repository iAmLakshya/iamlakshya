## Page 44

What do we cache?
- ↳ Anything that is computationally expensive or utilises a lot of Network bandwidth.
  - ↳ DB results
  - ↳ Computations done by app server
  - ↳ Popular static content

### Server-local caching
- → Occurs on app. server, database nodes, message brokers

> **[margin note]** -etc

- → (+ve) Fewer network calls, Very fast
- → (-ve) Cache size is proportional to no. of servers

### Global caching layer
- → (+ve) Scale independently of nos. of servers for both partitioning and replications
- → (-ve) Extra network calls, more can go wrong
  - ↳ or/and mem/disk IO

### Caches can seriously speed up our application by:
- → Using faster form of storage
- → Being closer to our client
- ↳ Reducing load on other components

But: We want to avoid cache miss, and possibly have consistent data.
