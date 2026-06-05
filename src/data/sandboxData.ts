export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'Distributed Systems' | 'Databases' | 'Networking' | 'Algorithms';
}

export interface CompanyTrack {
  company: string;
  description: string;
  focus: string;
  problems: string[]; // List of problem IDs matching problems data
}

export interface RubricCategory {
  name: string;
  description: string;
  weight: number; // Percentage
  score0: string; // Failure case
  score5: string; // Good case
  score10: string; // Outstanding case
}

export const glossary: GlossaryTerm[] = [
  {
    term: "Gossip Protocol",
    definition: "A peer-to-peer communication method where nodes periodically share membership information with a few random neighbors, allowing decentralized state updates across large clusters.",
    category: "Distributed Systems"
  },
  {
    term: "Split-Brain Scenario",
    definition: "A network partition where nodes split into two disconnected sub-clusters, and both sub-clusters independently elect a leader, leading to concurrent writes and database corruption.",
    category: "Distributed Systems"
  },
  {
    term: "Write-Ahead Log (WAL)",
    definition: "A sequential append-only log file on disk where every transaction is recorded before being applied to the in-memory database pages, enabling crash recovery.",
    category: "Databases"
  },
  {
    term: "Bloom Filter",
    definition: "A space-efficient, probabilistic data structure used to test set membership. It returns 'definitely not in set' or 'probably in set', preventing expensive disk reads for missing cache keys.",
    category: "Algorithms"
  },
  {
    term: "Consensus Algorithm (RAFT / Paxos)",
    definition: "A protocol ensuring that a distributed cluster of nodes agrees on a shared state or sequence of events, maintaining transaction safety even if some nodes fail.",
    category: "Distributed Systems"
  },
  {
    term: "Anycast Routing",
    definition: "A networking pathing technique where multiple servers share the same IP address. Network routers automatically deliver packets to the closest physical server.",
    category: "Networking"
  },
  {
    term: "CAP Theorem",
    definition: "States that a distributed system can guarantee at most two of these three: Consistency, Availability, and Partition Tolerance. In reality, partitions cannot be avoided, forcing CP vs. AP choice.",
    category: "Distributed Systems"
  },
  {
    term: "Quorum",
    definition: "The minimum number of database replica votes required to complete a write (W) or read (R) operation successfully. If R + W > N (replicas), strong consistency is guaranteed.",
    category: "Databases"
  },
  {
    term: "SSTable (Sorted String Table)",
    definition: "An immutable file structure holding sorted key-value pairs. Used in LSM-Tree databases (like Cassandra) to perform sequential writes and merge files in background tasks.",
    category: "Databases"
  },
  {
    term: "Cache Stampede (Thundering Herd)",
    definition: "When a highly popular cache key expires, and thousands of concurrent read requests miss the cache at the same time, hitting the database and crashing it.",
    category: "Networking"
  }
];

export const companyTracks: CompanyTrack[] = [
  {
    company: "Google",
    description: "Focuses heavily on algorithmic scale, raw throughput limits, and mathematical trade-offs.",
    focus: "Distributed Algorithms, Scalability, Consistency models",
    problems: ["rate-limiter", "web-crawler", "message-queue", "chat-service"]
  },
  {
    company: "Meta",
    description: "Interviews center around massive graph operations, caching layers, and high-frequency content feeds.",
    focus: "Graph Databases, Caching strategies, Real-time messaging",
    problems: ["chat-service", "video-streaming", "url-shortener"]
  },
  {
    company: "Uber",
    description: "Emphasizes geospatial systems, radial dispatch indexing, dynamic caching, and fast in-memory updates.",
    focus: "Geospatial indexing (H3/S2), Dispatcher threads, Event streaming",
    problems: ["ride-sharing", "rate-limiter"]
  },
  {
    company: "Netflix",
    description: "Focuses heavily on CDN caching architectures, media streaming transcoders, and chaotic fault tolerance.",
    focus: "CDN Edge serving, Playback buffers, Resilience (Chaos Engineering)",
    problems: ["video-streaming", "url-shortener"]
  },
  {
    company: "Amazon",
    description: "Requires deep understanding of distributed transactions, transaction rollback patterns, and inventory locks.",
    focus: "Saga patterns, Pessimistic locking, Relational ACID",
    problems: ["ticket-booking", "message-queue"]
  }
];

export const rubricScorecard: RubricCategory[] = [
  {
    name: "1. Scope & Requirements",
    description: "How well you clarify the boundaries of the problem and define functional vs. non-functional requirements.",
    weight: 15,
    score0: "Starts drawing immediately without asking questions or defining goals.",
    score5: "Clarifies core requirements but misses scaling estimates or volume calculations.",
    score10: "Identifies hidden assumptions, lists active users, writes clear QPS/bandwidth estimates before drawing."
  },
  {
    name: "2. API & Data Modeling",
    description: "Defining clear REST/gRPC interfaces and structural database tables matching requirements.",
    weight: 20,
    score0: "No database schema outlined; API paths lack methods, request payloads, or response codes.",
    score5: "Drafts simple relational table schemas but fails to specify partition keys or describe indexing.",
    score10: "Writes complete REST/gRPC endpoints, designs indexes, and selects optimal SQL vs NoSQL models with reasoning."
  },
  {
    name: "3. System Architecture (HLD)",
    description: "Structuring boxes, load balancers, and services to handle data pipelines smoothly.",
    weight: 25,
    score0: "Draws a single box for 'Server' and 'Database' without load balancing, caching, or message streams.",
    score5: "Draws standard layers (Client -> LB -> Web Server -> DB) but lacks details on how components communicate.",
    score10: "Structures stateless services behind L4/L7 load balancers, utilizes message queues, CDNs, and read replicas."
  },
  {
    name: "4. Scale & Deep Dives (LLD)",
    description: "Solving performance bottlenecks, explaining caching, database sharding, and consensus rules.",
    weight: 25,
    score0: "Fails to explain what happens when a database shard crashes or how cache invalidation works.",
    score5: "Mentions 'sharding database' or 'adding cache' but cannot describe shard keys or cache eviction policies.",
    score10: "Explains consistent hashing, selects range vs. hash sharding, describes master-leader consensus, and designs lock loops."
  },
  {
    name: "5. Communication & Structure",
    description: "Driving the conversation, structuring your whiteboard, and handling critical interviewer critique.",
    weight: 15,
    score0: "Needs constant prompts to speak, gets defensive when designs are critiqued.",
    score5: "Speaks clearly but gets lost in detail, losing track of the high-level roadmap checklist.",
    score10: "Proactively drives the whiteboard, manages the 45-minute timer, and explains trade-offs with confidence."
  }
];
