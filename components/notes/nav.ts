export type NoteLink = { slug: string; title: string; blurb: string };

export const SYSTEM_DESIGN_BASE = "/notes/system-design";

/** Top-level collections listed on /notes. */
export type Collection = {
  slug: string;
  title: string;
  emoji: string;
  blurb: string;
  status: "live" | "planned";
  count?: number;
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "system-design",
    title: "System Design",
    emoji: "\u{1F5C4}\uFE0F",
    blurb:
      "Storage engines, replication, consensus, batch and stream processing, and caching. What each mechanism costs, and the point at which it stops being worth it.",
    status: "live",
    count: 10,
  },
];

export const SYSTEM_DESIGN: NoteLink[] = [
  { slug: "storage-and-retrieval", title: "Storage and Retrieval",
    blurb: "Hash indexes, B-trees, LSM-trees with SSTables, the WAL, column-oriented storage." },
  { slug: "transactions", title: "Transactions and Isolation",
    blurb: "ACID, read committed through serialisable, and the three routes to serialisability." },
  { slug: "replication", title: "Replication",
    blurb: "Single-leader, multi-leader and leaderless, plus CRDTs, read repair and quorums." },
  { slug: "partitioning", title: "Partitioning",
    blurb: "Range and hash partitioning, secondary indexes, consistent hashing, 2PC." },
  { slug: "consensus", title: "Consensus and Linearizability",
    blurb: "Lamport clocks, total order broadcast, Raft, and coordination services." },
  { slug: "database-comparisons", title: "Database Comparisons",
    blurb: "Relational against document, MySQL against PostgreSQL, VoltDB, Spanner, Cassandra." },
  { slug: "batch-processing", title: "Batch Processing",
    blurb: "HDFS, HBase, MapReduce, the three batch join strategies, and Spark." },
  { slug: "stream-processing", title: "Stream Processing",
    blurb: "Time windows, CDC, event sourcing, delivery semantics, brokers and Flink." },
  { slug: "search-and-specialised-stores", title: "Search and Specialised Stores",
    blurb: "Inverted indexes, Lucene, Elasticsearch, time-series, graph and geospatial." },
  { slug: "caching", title: "Caching",
    blurb: "Where a cache sits, the three write strategies and what each one costs." },
];
