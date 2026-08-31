---
title: "Stream Processing"
description: "Time windows, change data capture, event sourcing, delivery semantics, log-based against in-memory brokers, stream joins and Flink"
section: "system-design"
order: 9
tags: ["streaming", "kafka", "flink", "cdc", "event-sourcing"]
source:
  notes: ["notes/digital/pages/page-31.md", "notes/digital/pages/page-32.md", "notes/digital/pages/page-33.md", "notes/digital/pages/page-34.md", "notes/digital/pages/page-35.md", "notes/digital/pages/page-36.md", "notes/digital/pages/page-37.md", "notes/digital/pages/page-38.md"]
---

# Stream Processing

Reacting to "events" in real time.

A batch job runs against a fixed input. Somebody decided where that input stopped, the job reads
all of it, and when it finishes there is nothing left to read. A stream has no such boundary. New
events keep arriving while the job that consumes them is still running, which means any figure the
job reports is a figure about the events it had seen at the moment it reported, not about the
events that exist now. Most of the decisions below are really decisions about how large that gap
is allowed to get.

## Event and message brokers

<!-- FIGURE: BrokerFanout -->

Direct connections are `O(n²)` in the worst case. A broker makes it `O(n)`.

The count of connections matters less than what each connection has to contain. Wiring producers
straight to consumers means every producer carries a retry policy and a backpressure story for
every consumer it feeds, and adding a consumer means editing every producer that has to reach it.
With a broker in the middle, each side knows one address, and a producer can keep writing while a
consumer is down. The retry policy has not disappeared; it has moved into the broker's redelivery
configuration, where there is one copy of it to reason about rather than one per producer.

### Common use cases

Metrics and logs arrive faster than anyone wants to store them row by row, and they get grouped
and bucketed by time on the way through.

Change data capture turns a database's writes into a stream, which lets anything derived from that
database follow along. Event sourcing takes the same idea further: the stream itself becomes the
record of what happened, and the databases downstream are views built over it.

## Time windows

Events arrive through the broker carrying a timestamp, and that timestamp gives the minute to
bucket on.

Bucketing on the event's own timestamp rather than on the time it turned up lets a delayed event
land in the bucket it belongs to. The cost is that a bucket is no longer finished when its
wall-clock minute ends, because an event stamped inside that minute might still be in flight
somewhere. Something has to decide how long to hold the bucket open, and most windowing systems
hand that decision straight back to you as a lateness threshold.

<!-- FIGURE: TimeWindows -->

A tumbling window is a fixed-width bucket that does not overlap its neighbours, and every event
falls into exactly one of them. Aggregating tumbling windows gives a hopping window. An hourly
figure refreshed every five minutes is twelve five-minute buckets summed. The next hop reuses
eleven of those twelve and never goes back to the raw events. The width of the underlying tumbling
bucket therefore sets the finest resolution the hop can have, because anything shorter than one
bucket is invisible to the query. Narrowing it later means recomputing every bucket, which is why
the width tends to be chosen once and left alone for as long as the buckets are retained.

A sliding window has no grid to align to. Its boundaries move with every arrival, so it is usually
implemented as an in-memory queue or linked list, with events pushed on as they arrive and popped
off the head once they fall outside the window. The memory it costs tracks how many events sit
inside it at once, which is a property of the arrival rate rather than of anything you configured.

## Change data capture

Keeps derived data in sync with the database.

The alternative is a job that rescans the table on a schedule. What that job costs tracks the size
of the table rather than the amount of change in it. Ten changed rows in a billion-row table cost
exactly the same full scan as a million changed rows. Downstream staleness is whatever the
interval between runs happens to be.

A rescan also only ever sees current state. A row created and then deleted between two runs never
existed as far as the derived store is concerned, and a row updated four times is seen once, at
whatever value it held when the job ran. Deletes are the worst of it. A deleted row leaves nothing
behind for the scan to find, which means the only way to notice it has gone is to compare the
whole table against the whole derived copy. Reading the database's own write log avoids all of
this, since a write log records transitions rather than state.

<!-- FIGURE: FLOW:cdc -->

Every insert, update and delete shows up in commit order, and the consumer applies them in that
order. The derived store ends up as a follower of the primary, lagging by however long the
pipeline takes and never skipping an intermediate value on the way.

<!-- FIGURE: CdcVsBatch -->

## Event sourcing

Database-agnostic events allow new types of derived data to be built in the future.

CDC starts from a write that has already happened to a particular table, which means the event it
produces carries that table's shape, column names and all. An event in the event-sourcing sense
describes what occurred in the language of the domain rather than the language of a table, and it
commits you to no schema at all. That trade only pays off if the domain vocabulary turns out to be
the more stable of the two, which is an assumption about the business rather than a property of
the technology.

<!-- FIGURE: FLOW:eventsourcing -->

Assumes the broker holds onto events.

If the broker deletes a message once it has been consumed, the only surviving trace of an event is
whatever the consumer chose to record at the time, and a consumer records the fields that the
questions being asked then happened to need. Ask a different question a year later and the fields
that would have answered it were never written down anywhere. With retention, a new consumer can
start at the beginning of the log and build a view that nobody had thought of when the events were
produced. An existing view can be dropped entirely and regenerated when a bug turns up in the code
that built it, which is not an option once the input has gone. Retention is not free, though, and
however far back the log is kept is exactly how far back any new view can reach. That window is
usually set when the topic is created, by someone who does not yet know what will be asked of it.

## Exactly-once message processing

Exactly-once *delivery* cannot be built. A sender that receives no acknowledgement has no way of
telling whether the message was lost or whether the acknowledgement was, because both look like
silence from where it is standing. It can resend, which duplicates the message if the first copy
did arrive, or it can stay quiet, which loses the message if the first copy did not. There is no
third option. Every guarantee described below is a choice between those two failures.

**At least once** relies on a fault-tolerant broker: disk persistence and replication underneath,
with consumer acks on top. The broker redelivers whenever an acknowledgement fails to arrive. A
consumer that crashes after acting on a message but before acknowledging it sees it twice.

**No more than once** can be built as a two-phase commit between the broker, a coordinator and the
consumer. That is correct, and the coordination it requires makes it slow enough that almost
nobody chooses it. What gets built instead is idempotence. The consumer records which message keys
it has already handled, and a redelivery of a key it recognises does nothing. This relies on the
same consumer seeing every copy of the same message, which is what partitioning by key buys you.

Idempotence does not move the delivery guarantee at all. The message still arrives twice; the
second arrival simply has no effect, and the state ends up as though it had arrived once. Stream
processing frameworks formalise that distinction, and Flink's guarantee below is stated in exactly
those terms.



| Guarantee | Mechanism | Failure it accepts |
|---|---|---|
| **At most once** | send and forget | a lost message, whenever an acknowledgement goes missing |
| **At least once** | resend until acknowledged | duplicates, whenever the original did arrive |
| **Exactly once, on state** | at-least-once delivery plus idempotent application | nothing, provided the consumer can recognise a repeat |
| **Exactly once, end to end** | replayable source and a transactional or idempotent sink | nothing, at the cost of coupling both ends to the framework |

Exactly-once *delivery* is not on that list because it cannot be built.

## ==Kafka against RabbitMQ==

Brokers are often split into "in-memory" (RabbitMQ, ActiveMQ, Amazon SQS) and "log-based"
(Kafka, Amazon Kinesis). The split is a real one, but the labels describe the wrong property. What
separates the two families is whether a consumed message is **deleted** or **retained in an
ordered, replayable log**, and neither answer says anything about RAM against disk. SQS is a
durable multi-server queue with a retention period measured in days, and RabbitMQ writes
persistent messages to disk on arrival.[^1] Read the pair as *delete-on-consume* against
*retain-and-replay*.

### Delete-on-consume broker

A message is held until a consumer acknowledges it, then deleted for good. Delivery is round-robin
across consumers, which maximises throughput and destroys ordering.

Throughput comes from any free consumer being able to take any waiting message, so no consumer
sits idle while another works through a backlog. The price is that two messages sent in order can
be handled in either order, by different machines, at the same time. The only way back to ordering
is <u>fan-out</u> to a queue per consumer, at which point each of those queues is serial again and
you have given up most of what round-robin was buying. Deletion is the other cost, and it is one
that nobody notices until much later. A consumer that runs for a week with a bug in it
produces a week of wrong output, and the input that would let you regenerate the correct output
was acknowledged and deleted as it went.

### Log-based broker

Every consumer reading a queue sees every message, in order, because a consumer here is a cursor
over an append-only log. Nothing is claimed and nothing is removed. All a consumer tracks is an
offset, the position in the log it has read up to, and the broker does not much care how far
behind that position has fallen.

Getting to offset n+1 means finishing offset n first. A record that takes a long time to process
therefore holds up every record behind it in the same log, and there is no idle consumer to hand
it to, because handing it off is exactly what would break the ordering you are paying for.

The log splits into partitions, each an independent ordered log with its own offset and its own
consumer. Throughput scales with partition count, and a slow record stalls only the partition it
sits in. Ordering becomes per partition, which pushes the partitioning key towards the thing whose
order matters to the application rather than whatever spreads load most evenly. Messages are also
not deleted from disk once read, and a consumer can be pointed back at an old offset and replayed.

Partition counts are easier to get wrong than that description suggests. Kafka will not reduce the
number of partitions on a topic at all,[^4] and adding partitions does not redistribute the data
already written, so a topic keyed by `hash(key) % number_of_partitions` sees that mapping shuffle
the moment the divisor changes.[^4] Existing keys start landing in a different partition from their
own history, and any consumer relying on that affinity is now reading a key's past and its future
from two different places. The usual defence is to pick a generous count up front, which means
paying a definite cost in per-partition overhead today to avoid a possible reshuffle later.

Consumer group membership shifts underneath all of this as well. Kafka reassigns partitions any
time the members of the group change or their subscription changes, which covers processes dying,
new instances starting, old instances coming back after a failure, and partitions being added
administratively.[^5] Reassignment is not free. A consumer giving up partitions stops fetching
first, runs its revocation callback, and only then does the group settle into its new assignment,
with fetching resuming after that.[^5] A rolling deployment triggers the sequence once per
instance.

<!-- FIGURE: LogBroker -->

<!-- FIGURE: HeadOfLine -->

### Choosing

Choose delete-on-consume when throughput is the priority and order does not matter. Video encoding
jobs are the usual example, as is fanning a tweet out into followers' feed caches. The work is
independent per item, and nobody downstream can tell what order it happened in.

Go log-based when every item should be handled by one consumer, in order, with the ability to
replay. A rolling average over the last `n` sensor readings needs it. So does a stream of database
writes feeding a search index, where applying an update before the insert it depends on leaves the
index holding a value that no later message will overwrite.

## ==Stream joins and enrichment==

Augmenting events with more data. An event as it comes off the broker tends to carry identifiers
and little else, and whatever those identifiers refer to is held somewhere the consumer has to go
and fetch it from.



| Join | Both sides are | Held where | The hard part |
|---|---|---|---|
| **Stream-stream** | events | consumer memory, until the partner arrives | how long to wait before giving up on a match |
| **Stream-table** | one stream, one table | an in-memory copy kept current by CDC | keeping the copy from going stale |
| **Table-table** | both tables, both via CDC | consumer memory, both sides | memory, once either table outgrows one consumer |

### Stream-stream joins

Match events from two streams using a common key. The consumer holds an event until its partner
arrives. Enrichment happens then, and the result goes to another queue (the sink).

Everything still waiting for a partner sits in the consumer's cache, and nothing guarantees a
partner ever turns up. That is why the join is bounded by a window: an event that reaches the end
of the window unmatched is dropped. Sizing the window is a guess about how far apart two related
events can drift in a system you do not fully control, and a generous guess costs consumer memory
for the entire time the window stays open.

### Stream-table joins

Here one side of the join comes from a database rather than from a second stream, often via CDC.
The first version anyone writes does a network call per event. That puts the database on the
critical path and caps the whole pipeline at whatever the database will serve — usually well below
what the stream can deliver, since the stream was never asked to do a random read per record. The
fix is to hold the data the join needs in memory on the consumer, and to keep that copy current
from the database's change stream. That is CDC again, maintaining a cache this time rather than
populating a derived store.

### Table-table joins

When both sides come from CDC of tables, the join is stream-table done twice, with the same
constraints applying to each half. It is worth being clear about what the change stream is
actually saving here. Polling both tables every 5 seconds costs a full query per table per
interval whether anything moved in that interval or not, and it still misses every intermediate
value between two polls. The constraint on the other side is memory, since the consumer is now
holding two tables instead of one. If they outgrow what a single consumer can keep, the queues get
partitioned by join key with one consumer per partition, which works precisely because two rows
that need to be joined share the key that decided their partition.

### Patterns

To maximise performance, cache derived state in memory.

Memory is the first constraint to bite. No single consumer has enough of it to hold the whole
dataset, so the state has to be spread across many consumers, and the queues have to be
partitioned the same way the state is. Partition them differently and a consumer will receive
messages for keys whose state is sitting on another machine, where it can do nothing useful with
them.

Consumer state has no fault tolerance at all by default. Take a consumer holding a running
aggregate over four thousand messages when the process dies. It restarts, reads its committed
offset, and begins on message four thousand and one with empty state. Everything it emits from
then on is wrong, and nothing raises an error, because the consumer is doing exactly what it was
told to do with the state it has. Replaying from offset zero would rebuild the state, but the
replay is as long as the job's entire history. A job that has been running for a month has a month
of replay to get through before it is useful again.

A write-ahead log per consumer does not solve this, because the other consumers carry on
processing while one of them recovers. Recovery has to be a cut taken across every consumer at
once. A consumer that rewinds and re-emits is re-emitting output that its neighbours have already
read and acted on, and nothing rewound them, so the damage spreads outward from the point of
failure rather than staying local to it. Coordinating a consistent cut across a set of independent
consumers is hard enough that most teams reach for a framework rather than build it themselves.

## ==Apache Flink==

Flink processes per event, where Spark Streaming micro-batches. Tez and Storm are the other names
that come up.

A stream processing framework is not a broker. It sits on the consumer side of one, and what it
adds there is ownership of the consumer's state together with checkpointed recovery for that
state. The code you write becomes a function from an event to a change in state, and the framework
takes responsibility for the state surviving a crash.

Flink guarantees that each event affects state exactly once.[^2] That is a narrower claim than
exactly-once *delivery*. Recovery replays source data, so an event can be reprocessed, and
end-to-end exactly-once additionally requires replayable sources and sinks that are transactional
or idempotent.[^2]

The mechanism is **Asynchronous Barrier Snapshotting**, inspired by the Chandy-Lamport
distributed snapshot algorithm.[^3]

A barrier is a marker injected into the stream and carried along with the records, splitting it
into everything before and everything after. Because it travels with the data rather than out of
band, it reaches each operator at the same position in the stream, which is why the snapshot comes
out causally consistent. A node takes its snapshot once it has received barriers on all of its
input queues, which means a node with several upstreams waits for the slowest of them before it
can do anything. Checkpoints are stored externally, in a configurable distributed filesystem such
as S3, so losing the node does not lose its saved state.

<!-- FIGURE: FlinkBarriers -->

C3 checkpoints only once it has received the barrier from both C1 and C2. Every checkpoint
includes only messages before the barriers, so each consumer can resume by reading messages after
the barrier.

Flink snapshots are <u>lightweight</u> in a specific sense. They run in the background while
processing carries on, and recovery only has to replay the messages that arrived since the last
checkpoint. That puts a bound on what a crash costs, wherever in the job it happens to land.

The mechanism says nothing about how often to take one. The interval is really a service level
agreement on how much reprocessing you are willing to do when a failure lands just before a
checkpoint would have completed.[^6] It sets result latency too, since exactly-once sinks such as
Kafka or the FileSink only make results visible when a checkpoint completes. And it is not free in
itself: asynchronous checkpointing still consumes CPU cycles and network bandwidth.[^6] Flink's
own guidance names no number, only that every application is unique and the way to find the
appropriate interval is to see how yours behaves in practice.[^6] Until the job is running there
is nothing to observe, though, so the first interval is a guess, bounded on one side by however
much reprocessing the SLA already permits.

[^1]: **Amazon SQS Developer Guide** and the **RabbitMQ persistence documentation** - checked
      against the common claim that SQS and RabbitMQ are "in-memory" brokers. AWS
      describes SQS as durable ("For the safety of your messages, Amazon SQS stores them on
      multiple servers") with a retention period defaulting to 4 days and configurable up to 14.
      RabbitMQ's own docs state that "Persistent messages will be written to disk as soon as
      they reach the queue", and its quorum queues and streams are log-based. The in-memory
      against log-based taxonomy comes from Kleppmann's *Designing Data-Intensive Applications*,
      where it distinguishes delete-on-consume from retain-and-replay rather than RAM from disk.
      [docs.aws.amazon.com](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html)
      and [rabbitmq.com](https://www.rabbitmq.com/docs/persistence-conf)

[^2]: **Fault Tolerance via State Snapshots**, the Apache Flink documentation - states the
      guarantee precisely: "this does *not* mean that every event will be processed exactly once.
      Instead, it means that *every event will affect the state being managed by Flink exactly
      once*." End-to-end exactly-once additionally requires replayable sources and transactional
      or idempotent sinks.
      [nightlies.apache.org](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/)

[^3]: **Lightweight Asynchronous Snapshots for Distributed Dataflows**, Carbone, Fóra, Ewen,
      Haridi and Tzoumas, arXiv:1506.08603, 29 June 2015 - the paper behind Flink's checkpointing,
      which names the algorithm Asynchronous Barrier Snapshotting (ABS). Flink's own docs say the
      mechanism "is inspired by the standard Chandy-Lamport algorithm". ABS differs from plain
      Chandy-Lamport in that on acyclic graphs its snapshots contain no in-flight records and it
      needs no backup logging.
      [arxiv.org](https://arxiv.org/abs/1506.08603)

[^4]: **Apache Kafka documentation** - the basic operations guide, covering topic modification.
      It is the source for partition counts being one-way ("Kafka does not currently support
      reducing the number of partitions for a topic") and for the warning that adding partitions
      shuffles the `hash(key) % number_of_partitions` mapping, since Kafka "will not attempt to
      automatically redistribute data in any way".
      [kafka.apache.org](https://kafka.apache.org/10/operations/basic-kafka-operations/)

[^5]: **Apache Kafka Javadoc** - the API reference for `ConsumerRebalanceListener` and
      `KafkaConsumer`. It gives the rebalance triggers, that "a partition re-assignment will be
      triggered any time the members of the group change or the subscription of the members
      changes", covering processes dying, new instances arriving, old ones returning after a
      failure, and partition counts being administratively adjusted. It is also the source for the
      revocation cost: the callback runs when the consumer has to give up partitions, after
      fetching has stopped, and reassignment completes before fetching resumes.
      [kafka.apache.org](https://kafka.apache.org/40/javadoc/org/apache/kafka/clients/consumer/ConsumerRebalanceListener.html)

[^6]: **Apache Flink documentation** - the production readiness checklist, which devotes a section
      to choosing a checkpoint interval and calls it "an expression of the jobs service level
      agreement (SLA)". It balances tolerable reprocessing against exactly-once sinks, which
      "only make results visible on checkpoint completion", and against the CPU and network cost
      of asynchronous checkpointing. Flink gives no recommended number, only that "every Flink
      application is unique, and the best way to find the appropriate checkpoint interval is to
      see how yours behaves in practice".
      [nightlies.apache.org](https://nightlies.apache.org/flink/flink-docs-stable/docs/ops/production_ready/)

## Related

- [[Batch Processing]] - Spark, and the batch counterpart to these joins.
- [[Search and Specialised Stores]] - the search index CDC usually feeds.
