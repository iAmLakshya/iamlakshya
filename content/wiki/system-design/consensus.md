---
title: "Consensus and Linearizability"
description: "Why Lamport clocks and version vectors are not linearizable, total order broadcast, Raft leader election and log replication, and coordination services"
section: "system-design"
order: 6
tags: ["consensus", "raft", "linearizability", "zookeeper"]
source:
  notes: ["notes/digital/pages/page-15.md", "notes/digital/pages/page-16.md", "notes/digital/pages/page-17.md"]
---

# Consensus and Linearizability

## ==Linearizable database==

Needed for "correct" reads: all writes are ordered, and our reads can never go back in
time.

The promise made to a client is that the store behaves as if there were one copy of the data and
one clock ticking over it, however many replicas are actually running. Every operation appears to
take effect at a single instant somewhere between the client sending it and the client receiving a
response. Once a write has been acknowledged, any read issued afterwards, by that client or any
other, against any replica, returns that write or something later.

That promise rules out a whole family of behaviours. Once any read has returned the new value, no
read after it may return the old one, and it makes no difference that the second read came from a
different client talking to a different replica. Two clients reading the same key at the same
moment have to be told the same thing. The guarantee also extends to channels the database has no
visibility into: if one client reads `x = 1` and mentions the fact to somebody over the phone, and
that person then queries the database, the answer they get back cannot be `x = 0`.

The mechanism that does the ordering depends on how the data is replicated.

| Scheme | Ordering mechanism |
|---|---|
| Single leader | Replication logs |
| Multi leader | Version vectors / Lamport clock |
| Leaderless | Lamport clocks / version vectors |

### Lamport clock

One register per process, so constant space. Can be assigned to each write to order it. Each
process bumps its counter on every event and stamps outgoing messages with the current value. On
receipt it raises its own counter above the stamp, so anything caused by a message sorts after it.
What comes out is a total order over every event in the system, and it never contradicts
causality: if one event could have caused another, the counters put it first.

The rule is usually written `max(s, c) + 1`, which is a valid implementation but stronger than
what is required. Lamport states it as an inequality and leaves the increment unspecified: on
receiving a message, a process "sets `Ci` greater than or equal to its present value and greater
than `Tm`".[^1] Any monotonic choice satisfying that works.

### Neither is linearizable

Version vectors and Lamport clocks are ⊗ not linearizable, because the ordering is applied after
the fact.

A client writes `x = 1` to replica A and gets an acknowledgement back. A second client reads the
same key from replica B a moment later and is told `x = 0`, because B has heard nothing about the
write yet. Some time afterwards the two replicas exchange what they hold, compare timestamps and
settle on an order that puts the write before the read — the correct order, arriving long after
the second client was handed the wrong answer and acted on it. A timestamp can sort
two writes, but only after both writes have reached the same replica. It says nothing about a
write that a replica has never seen, and it has no way of withdrawing a response that has already
been sent. Version vectors decide which of two conflicting values ought to win. Guaranteeing that
a read never returns a stale value is a different problem, and they do not address it at all.

<!-- FIGURE: LinearizabilityTimeline -->

Single leader replication is **not** linearizable either. One log on one machine does produce a
real order, but reads served by followers trail behind that log, and a leader that has been
partitioned away without noticing will carry on answering as though it were still in charge.

**Total order broadcast** is the primitive that fixes this. It asks for two things: that every
node agrees on the order of writes, and that no write is lost when nodes fail. Those two
requirements are distributed consensus wearing a different name, and the relationship is not a
loose analogy but a proven result. Total order broadcast, which the literature usually calls
atomic broadcast, and consensus can each be reduced to the other in asynchronous systems.[^3]



| Mechanism | Orders writes | Linearizable | Costs |
|---|---|---|---|
| **Lamport clock** | after the fact | no | one register per process |
| **Version vector** | after the fact, detecting concurrency | no | one counter per node |
| **Single-leader log** | at the leader | no, followers lag | a leader to lose |
| **Total order broadcast** | before anything is visible | yes | a majority round trip per write |

Ordering applied after the fact records what happened. It cannot un-tell a client that already
read the wrong value, which is the whole reason the last row costs what it does.

## ==Distributed consensus: Raft leader election==

Raft builds a distributed log.

A node that stops receiving the leader's heartbeat concludes the leader is gone and proposes
itself. It sets the **term** to the last leader's term plus one and asks the other nodes for their
votes. A quorum of yes votes wins the election, and the winner immediately starts sending
heartbeats of its own.

Two leaders cannot exist at the same time. Any two majorities drawn from the same set of nodes
share at least one member, and that member casts a single vote per term, so a second candidate
asking the same population for a majority will find somebody in it has already voted. Old leaders
cannot come back either, because the term number gives every server grounds to reject a stale one.
A leader that was cut off and has since returned finds its messages refused over a term it has
never heard of, and steps down. The leader that survives has an up-to-date log and backfills the
stale nodes from it.

The counter is a **term**: "Raft divides time into terms of arbitrary length... Terms are
numbered with consecutive integers. Each term begins with an election."[^2] Outside the paper the
vocabulary changes. The same mechanism is an *epoch* in Zab and in Kafka, and a *fencing token* in
the general distributed-systems literature. Neither of those words appears in Raft. In every case
what is being named is a single number that only ever goes up, issued by whatever process elected
the current authority, and checked by every node that receives a message stamped with it. A
message carrying a number lower than the receiver's own has come from an authority that has since
been superseded, and that is enough to reject it without knowing anything else about the sender.

## ==Distributed consensus: Raft writes==

Writes backfill logs. One leader holds the term, and a write only counts as successful once it has
brought the follower's log fully up to date. Raft's **Log Matching** property falls out of that:
"if two logs contain an entry with the same index and term, then the logs are identical in all
entries up through the given index".[^2]

<!-- FIGURE: RaftLogMatch -->

Because that property holds, repairing a lagging follower is cheap. The leader does not have to
resend the whole log. It sends the missing suffix, along with the count of prefix entries it
believes the two of them already agree on. Where the follower disagrees with that count, the
leader walks its guess backwards until the two logs meet. A quorum of yes votes then commits
everything up to that point.

### Where Raft lands

What Raft gives you is a linearizable database that survives faults, and what it charges for that
is throughput. Every write goes through one machine, because clients have nowhere else to send
them. The leader appends the entry to its own log, ships it to each follower, waits for a majority
to acknowledge, commits, and only then replies. Adding nodes to the cluster does not help with any
of that. Each additional node is another follower the leader has to send entries to, and it makes
the majority the leader waits on slightly larger. The write ceiling is whatever one machine can
manage in fanning out entries and counting the replies that come back, plus a round trip to the
slowest member of whichever majority happens to be fastest, and buying more hardware does not
move it.

Failure costs more again, because writes stop completely until an election has finished and the
new leader has caught up. How long that stall lasts is set by the election timeout, which is a
tuning parameter rather than a property of the algorithm, and there is no comfortable value for
it. Set it low and a leader that is merely having a slow moment gets deposed by nodes that have
concluded it is dead. Set it high enough that this stops happening and every genuine failure
now takes correspondingly longer to notice, which the callers upstream experience as an outage.

The paper's own recommendation is a timeout drawn at random from the range 150 to 300 ms.[^5] The
range matters, but so does the drawing at random: if every server used the same figure they would
all time out at the same moment and all stand for election at once. Giving each server a different
number means one of them almost always wakes first and has won before the others have started.
What the paper cannot supply is the figure you actually want, which is how long a write stall
lasts on your cluster. That depends on how quickly your particular followers can be brought
current, which is a property of your hardware and your write volume rather than of the algorithm.

Being fault tolerant does not make Raft a substitute for two-phase commit. Every replica in a Raft
cluster is applying the same write, so what the cluster agrees on is many copies of a single
decision, taken by nodes doing identical work. Two-phase commit has a harder problem in front of
it. Its participants hold different data, do different things with it, and each of them can refuse
for reasons of its own. The protocol has to bring all of them to commit, or all of them to abort.

## ==Zookeeper: coordination services==

A coordination service is a key-value store that allows this data to be stored reliably. ZooKeeper
uses Zab and etcd uses Raft.[^4] The consensus algorithm underneath is what makes the contents
linearizable.

Consensus is slow. Some part of a system usually needs it anyway, and a coordination service is
where that need gets concentrated, so the rest of the system can be built without paying for it.

Reads can always be sent to the leader. That is correct, and it is slow, and it puts the whole
read load on the one machine that is already the write bottleneck. Spreading reads across the
followers instead requires <u>Sync</u>: before answering, the follower asks the leader for
everything it has missed and applies it, which means its reply cannot be behind a write that has
already been acknowledged somewhere else. The follower pays for that catch-up on every read it
serves. In exchange, the leader stops being in the path of every read in the system, and that is
where the extra throughput comes from.

Too slow to be used for application data. Only for key-value config that the backend needs to be
correct.

The slowness is deliberate rather than a defect waiting to be optimised away. Every write costs a
round trip to a majority of the cluster, and what the design buys with that round trip is
certainty. The question, then, is which data is worth the price. Locks and leases are, because the
entire point of a lease is that two holders must never believe they hold it at once. Cluster
membership qualifies too, along with the partition assignments that depend on knowing who counts
as a member. Then there is the identity of whichever node is currently leading some other service,
and the small set of configuration values that every backend has to agree on before anything it
does afterwards can be correct. All of that data has the same shape. A few kilobytes at most, read
enormously more often than it is written, and changing rarely enough that a majority round trip
per write never turns into the limiting factor.

Application data is a different proposition. There is far more of it and it is written constantly.
Nothing in ZooKeeper or etcd will prevent you storing it there; the cluster will take the writes
and replicate them exactly as correctly as it replicates a lease. What changes is who ends up
paying. The majority round trip that made the lease trustworthy is now charged against every
application request queued behind those writes, and a service sized for a few kilobytes of
configuration becomes the throughput ceiling for the whole product.

[^1]: **Time, Clocks, and the Ordering of Events in a Distributed System**, Leslie Lamport,
      Communications of the ACM, July 1978 - the original paper. It gives the clock condition as
      two implementation rules, IR1 ("Each process `Pi` increments `Ci` between any two successive
      events") and IR2(b) ("Upon receiving a message `m`, process `Pi` sets `Ci` greater than or
      equal to its present value and greater than `Tm`"). The familiar `max(s, c) + 1` expression
      satisfies both but does not appear in the paper.
      [lamport.azurewebsites.net](https://lamport.azurewebsites.net/pubs/time-clocks.pdf)

[^2]: **In Search of an Understandable Consensus Algorithm (Extended Version)**, Diego Ongaro and
      John Ousterhout, Stanford University, 2014 - the Raft paper. Source for the term
      terminology and for the Log Matching property quoted above. The strings "epoch" and
      "fencing" occur zero times in the extended paper.
      [raft.github.io](https://raft.github.io/raft.pdf)

[^3]: **Unreliable Failure Detectors for Reliable Distributed Systems**, Tushar Deepak Chandra and
      Sam Toueg, Journal of the ACM, Vol. 43 No. 2, March 1996 - Corollary 7.1.7: "Consensus and
      Atomic Broadcast are equivalent in asynchronous systems", proven by mutual reduction. The
      paper's "Atomic Broadcast" and total order broadcast are the same primitive under two
      names.
      [cs.utexas.edu](https://www.cs.utexas.edu/~lorenzo/corsi/cs380d/papers/p225-chandra.pdf)

[^4]: **Zab: High-performance broadcast for primary-backup systems**, Junqueira, Reed and
      Serafini, Yahoo! Research, DSN 2011 - "Zab is a crash-recovery atomic broadcast algorithm we
      designed for the ZooKeeper coordination service." Apache ZooKeeper's own internals
      documentation calls the protocol "atomic broadcast" without ever using the name Zab, which
      is why the paper is cited here. For etcd, its README states that it "uses the Raft consensus
      algorithm to manage a highly-available replicated log".
      [classpages.cselabs.umn.edu](https://classpages.cselabs.umn.edu/Fall-2017/csci8211/Papers/Distributed%20Systems%20Zab-%20High-performance%20broadcast%20for%20primary-backup%20systems.pdf),
      [github.com/etcd-io/etcd](https://raw.githubusercontent.com/etcd-io/etcd/main/README.md)

[^5]: **In Search of an Understandable Consensus Algorithm**, Ongaro and Ousterhout, 2014 - the
      Raft paper's section on timing and availability. It supplies the recommended range: "election
      timeouts are chosen randomly from a fixed interval (e.g., 150-300ms)", and the reason for
      randomising rather than fixing them, which is that it "spreads out the servers so that in
      most cases only a single server will time out". The paper also warns against tuning below
      that: shorter timeouts mean "leaders have difficulty broadcasting heartbeats before other
      servers start new elections", causing unnecessary leader changes.
      [raft.github.io](https://raft.github.io/raft.pdf)

## Related

- [[Replication]] - what consensus is called in to fix.
- [[Database Comparisons]] - Spanner's approach to ordering without a single consensus bottleneck.
