export interface InterviewQuestion {
  id: number;
  question: string;
  answer: string;
  category: 'System Design Basics' | 'Databases & Sharding' | 'Caching & Networking' | 'Rate Limiters & Queues' | 'SOLID & LLD';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  frequency: 'high' | 'medium' | 'low';
}

export const interviewQuestions: InterviewQuestion[] = [
  // CATEGORY 1: System Design Basics (Questions 1 - 40)
  {
    id: 1,
    question: "What is the difference between latency and throughput?",
    answer: "Latency is the time taken to process a single request (measured in ms). Throughput is the number of requests processed per second (RPS or QPS). High throughput does not guarantee low latency, and vice versa.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 2,
    question: "What is Vertical Scaling (Scale-up) vs Horizontal Scaling (Scale-out)?",
    answer: "Vertical scaling increases CPU/RAM of a single server. Horizontal scaling adds more servers to a pool. Horizontal scaling is preferred for distributed systems because it avoids single points of failure and physical hardware ceilings.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 3,
    question: "What is a Single Point of Failure (SPOF)?",
    answer: "A single component in a system whose failure stops the entire system from working. It is resolved by introducing redundancy (active-passive or active-active configurations) at every layer.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 4,
    question: "What is SLA (Service Level Agreement) vs SLO (Service Level Objective) vs SLI?",
    answer: "SLA is the legal contract promising system reliability to customers. SLO is the target metric for reliability (e.g., 99.9% uptime). SLI is the actual metric measured in real-time to check if SLO is met.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 5,
    question: "What are the 'Four Golden Signals' of monitoring?",
    answer: "Latency (time to service request), Traffic (demand on system, e.g., HTTP QPS), Errors (rate of failed requests), and Saturation (how full resources are, e.g., CPU/memory %).",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 6,
    question: "Explain the concept of 'Graceful Degradation'.",
    answer: "When a system is overloaded, it intentionally turns off non-critical features (like recommended items or chat widgets) to keep core functions (like payments and checkout) operational.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 7,
    question: "What is the difference between Stateful and Stateless services?",
    answer: "Stateless services do not store client session data locally, allowing requests to hit any instance behind a load balancer. Stateful services maintain session state locally, requiring sticky sessions.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 8,
    question: "What is backpressure in data pipelines?",
    answer: "A feedback mechanism where a slow receiver signals to a fast sender to throttle down data production, preventing buffer overflows and out-of-memory errors.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 9,
    question: "What is a heartbeating mechanism?",
    answer: "Periodic signals sent from worker nodes to a master node to indicate that the worker is alive. If the master misses a heartbeat window, it marks the worker as dead and redistributes tasks.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 10,
    question: "What is Clock Skew in distributed systems?",
    answer: "The difference in time values reported by clocks on different physical servers. Since physical clocks drift due to temperature, NTP is used, but true order cannot rely solely on physical system time.",
    category: "System Design Basics",
    difficulty: "Hard",
    frequency: "high"
  },
  {
    id: 11,
    question: "Explain the difference between synchronous and asynchronous processing.",
    answer: "Synchronous blocks the caller until the operation completes. Asynchronous returns control immediately and notifies the caller later (callbacks, events, or polling), improving throughput.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 12,
    question: "What is the purpose of a UUID?",
    answer: "Universally Unique Identifier. A 128-bit number used to generate unique IDs across distributed databases without coordinating with a central server.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 13,
    question: "What is clock drift?",
    answer: "The phenomenon where physical clocks on servers run at slightly different speeds, drifting away from reference atomic clocks, causing timestamp inconsistencies.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 14,
    question: "Explain high availability vs fault tolerance.",
    answer: "High availability measures system uptime (e.g., 99.99%) by recovering quickly from failures. Fault tolerance guarantees zero downtime by running redundant systems in parallel.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 15,
    question: "What is the 'Long Tail' problem?",
    answer: "When a tiny percentage of requests (the 99th percentile) take significantly longer than average requests (50th percentile) due to garbage collection, packet loss, or resource locks.",
    category: "System Design Basics",
    difficulty: "Hard",
    frequency: "high"
  },
  {
    id: 16,
    question: "What is the difference between active-passive and active-active failover?",
    answer: "Active-passive runs a standby server that takes over if the primary fails. Active-active runs both servers concurrently, balancing load, but requiring data synchronization.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 17,
    question: "What is a reverse proxy?",
    answer: "A server placed in front of backend servers. It intercepts client requests, handles SSL termination, coordinates load balancing, caches responses, and shields servers from direct internet access.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 18,
    question: "What is a forward proxy?",
    answer: "A proxy placed in front of clients. It filters outgoing traffic, blocks restricted sites, caches web content, and anonymizes client IP addresses to the external internet.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 19,
    question: "What is Amdahl's Law?",
    answer: "A formula representing the theoretical speedup of a task when parallelized. It states that speedup is limited by the serial (non-parallelizable) portion of the program.",
    category: "System Design Basics",
    difficulty: "Hard",
    frequency: "high"
  },
  {
    id: 20,
    question: "What is the Shared-Nothing Architecture?",
    answer: "A distributed system model where each node is independent, possessing its own memory, CPU, and disk. Nodes communicate solely via network API calls, facilitating horizontal scaling.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 21,
    question: "Explain circuit breaker pattern.",
    answer: "A design pattern to prevent cascading failures. It wraps API calls; if failures exceed a threshold, the breaker trips (opens), returning instant errors to avoid hanging resources.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 22,
    question: "What is bulkheading?",
    answer: "Isolating resources (like separating thread pools for different APIs) so that if one service fails or runs out of threads, it does not exhaust resources for the rest of the application.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 23,
    question: "What is chaotic engineering?",
    answer: "The practice of intentionally injecting failures (like shutting down instances, dropping network packets) into production systems to test resilience (pioneered by Netflix's Chaos Monkey).",
    category: "System Design Basics",
    difficulty: "Hard",
    frequency: "high"
  },
  {
    id: 24,
    question: "Explain Read-Heavy vs Write-Heavy systems.",
    answer: "Read-heavy systems (like blogs, catalogs) benefit from intensive caching and read replicas. Write-heavy systems (like logs, chat) require append-only databases and write buffers.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 25,
    question: "What is the 99th percentile (p99) latency?",
    answer: "The threshold beneath which 99% of requests complete. It represents the slowest 1% of transactions and is the standard metric used to gauge real user experiences.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 26,
    question: "What is fail-soft vs fail-safe?",
    answer: "Fail-soft continues running in a degraded capacity when components fail. Fail-safe completely shuts down operations to protect data integrity and avoid unsafe states.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 27,
    question: "Explain the concept of 'Loose Coupling'.",
    answer: "Designing system components to have minimal dependencies on other modules, enabling one service to be modified or replaced without affecting adjacent services.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 28,
    question: "What is split-brain scenario?",
    answer: "When a network partition splits a distributed cluster into two halves, and both halves elect a leader, leading to concurrent edits and corrupt databases.",
    category: "System Design Basics",
    difficulty: "Hard",
    frequency: "high"
  },
  {
    id: 29,
    question: "What is consistent logging?",
    answer: "A write-ahead log (WAL) system where all operations are recorded sequentially before updating the database state, ensuring recovery after power or process failure.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 30,
    question: "Explain the difference between scalability and performance.",
    answer: "Performance is how fast a system processes tasks with a fixed load. Scalability is the system's ability to maintain performance when traffic or data load increases.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 31,
    question: "What is Anycast routing?",
    answer: "A routing technique where multiple physical servers share the same IP address. Routers automatically direct packets to the closest server geographically.",
    category: "System Design Basics",
    difficulty: "Hard",
    frequency: "medium"
  },
  {
    id: 32,
    question: "Explain cold start in serverless computing.",
    answer: "The latency delay when a serverless function (like AWS Lambda) is invoked after being idle, requiring the cloud provider to spin up a new container instance.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 33,
    question: "What is service discovery?",
    answer: "A registry (like Consul or ZooKeeper) tracking IP addresses of microservice instances, allowing services to locate and call each other dynamically in container environments.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 34,
    question: "Explain event-driven architecture.",
    answer: "A pattern where services communicate asynchronously by publishing events. Services react to events in real-time, decoupling execution timelines and service bounds.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 35,
    question: "What is the snowflake ID generator?",
    answer: "A Twitter-developed algorithm generating unique 64-bit IDs using a timestamp, worker node ID, and sequence number, requiring no central coordination database.",
    category: "System Design Basics",
    difficulty: "Hard",
    frequency: "medium"
  },
  {
    id: 36,
    question: "Explain heartbeats vs ping-pong.",
    answer: "Heartbeats are one-way status pings sent from worker to master. Ping-pong is a bi-directional request-response to measure actual round-trip latency.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 37,
    question: "What is hot spotting in sharding?",
    answer: "When a single database shard receives a disproportionate share of writes or reads (e.g., a viral user's data), exhausting its resources while other shards sit idle.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 38,
    question: "What is over-provisioning?",
    answer: "Allocating more hardware resources (CPU, RAM) than needed to handle traffic spikes, increasing operating costs to safeguard against peak load crashes.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 39,
    question: "Explain locality of reference.",
    answer: "The tendency of systems to access the same data repeatedly or access adjacent data, which forms the theoretical foundation for memory and CPU caching.",
    category: "System Design Basics",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 40,
    question: "What is a health check?",
    answer: "An endpoint (e.g., /healthz) exposed by a service that returns HTTP 200. Load balancers check this periodically to route traffic away from failing servers.",
    category: "System Design Basics",
    difficulty: "Easy",
    frequency: "high"
  },

  // CATEGORY 2: Databases & Sharding (Questions 41 - 80)
  {
    id: 41,
    question: "What is the CAP Theorem?",
    answer: "States that a distributed data store can guarantee at most two of: Consistency, Availability, and Partition Tolerance. In practice, partitions are inevitable, forcing a choice between CP and AP.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 42,
    question: "What is the PACELC Theorem?",
    answer: "An extension of CAP: If there is a Partition (P), choose Availability (A) vs Consistency (C); Else (E), choose Latency (L) vs Consistency (C).",
    category: "Databases & Sharding",
    difficulty: "Hard",
    frequency: "medium"
  },
  {
    id: 43,
    question: "Explain ACID vs BASE.",
    answer: "ACID (SQL): Atomicity, Consistency, Isolation, Durability. BASE (NoSQL): Basically Available, Soft State, Eventual Consistency. ACID guarantees strict validity; BASE prioritizes availability.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 44,
    question: "What is Database Sharding?",
    answer: "Horizontal partitioning of a database. Splitting data across multiple servers using a shard key (e.g., hash(userId) % N), allowing parallel writes and scale.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 45,
    question: "What is a Read Replica?",
    answer: "A read-only copy of a master database. Master handles all writes and replicates edits to replicas. Replicas handle read queries, relieving master database load.",
    category: "Databases & Sharding",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 46,
    question: "Explain Multi-Leader Replication.",
    answer: "Data is written to multiple leader databases, which sync with each other. Useful across geographic regions, but requires conflict resolution algorithms.",
    category: "Databases & Sharding",
    difficulty: "Hard",
    frequency: "medium"
  },
  {
    id: 47,
    question: "What is Write-Ahead Logging (WAL)?",
    answer: "A logging pattern where database modifications are written to a append-only log file before they are applied to actual data pages, ensuring crash recovery.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 48,
    question: "What is the N+1 Query Problem?",
    answer: "An ORM anti-pattern where a query is executed to fetch a list of parent rows, and then N separate queries are executed to fetch child data for each row.",
    category: "Databases & Sharding",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 49,
    question: "What is indexes in databases?",
    answer: "Data structures (e.g., B-Trees, Hash indexes) that speed up data retrieval queries at the cost of slower writes and additional disk space.",
    category: "Databases & Sharding",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 50,
    question: "Explain the difference between B-Trees and LSM Trees.",
    answer: "B-Trees are optimized for reads and random updates (updating in-place). LSM Trees buffer writes in memory (MemTable) and flush them sequentially to disk (SSTables), optimized for writes.",
    category: "Databases & Sharding",
    difficulty: "Hard",
    frequency: "medium"
  },
  {
    id: 51,
    question: "What is Eventual Consistency?",
    answer: "A consistency model where if no new updates are made, all replicas will eventually converge to display the same data, but stale reads can occur temporarily.",
    category: "Databases & Sharding",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 52,
    question: "Explain Strong Consistency.",
    answer: "A consistency model guaranteeing that any read request returning a response will receive the absolute latest successfully committed write data.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 53,
    question: "What is Cassandra's Wide-Column Store?",
    answer: "A NoSQL database storing data in rows with dynamic column sets. Optimized for sequential writes based on a composite partition/clustering key structure.",
    category: "Databases & Sharding",
    difficulty: "Hard",
    frequency: "medium"
  },
  {
    id: 54,
    question: "What is MongoDB's Document Store?",
    answer: "A document-oriented database storing JSON-like records (BSON). Supports nested hierarchies, dynamic schemas, and ad-hoc query indexes.",
    category: "Databases & Sharding",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 55,
    question: "Explain Neo4j Graph Database.",
    answer: "A NoSQL database storing entities as Nodes and relationships as Edges, optimized for traversing highly interconnected networks (e.g., social graphs).",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 56,
    question: "What is Optimistic Concurrency Control (OCC)?",
    answer: "A locking strategy where transactions don't block. Before committing, the database checks if a version number changed. If yes, it aborts and retries.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 57,
    question: "What is Pessimistic Locking?",
    answer: "A locking strategy where a transaction locks database rows (e.g., SELECT ... FOR UPDATE) immediately, blocking others until it completes to avoid collisions.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 58,
    question: "Explain Distributed Transactions.",
    answer: "Transactions executing across multiple physical databases or microservices, requiring coordination mechanisms like Two-Phase Commit (2PC) or Saga.",
    category: "Databases & Sharding",
    difficulty: "Hard",
    frequency: "medium"
  },
  {
    id: 59,
    question: "What is Two-Phase Commit (2PC)?",
    answer: "A blocking consensus protocol for distributed databases. Phase 1: Prepare (coordinator asks nodes if ready). Phase 2: Commit (coordinator commits if all vote yes).",
    category: "Databases & Sharding",
    difficulty: "Hard",
    frequency: "medium"
  },
  {
    id: 60,
    question: "Explain the Saga Pattern.",
    answer: "A sequence of local transactions. Each transaction updates its local database; if one fails, compensating transactions run to roll back previous steps.",
    category: "Databases & Sharding",
    difficulty: "Hard",
    frequency: "medium"
  },
  {
    id: 61,
    question: "What is Consistent Hashing?",
    answer: "An algorithm mapping database keys and servers to a circular ring, minimizing keys remapped when nodes are added or removed to 1/N.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 62,
    question: "What is the purpose of Virtual Nodes in consistent hashing?",
    answer: "Virtual nodes (Vnodes) represent physical servers at multiple spots on the hash ring, preventing 'hot spots' and distributing keys evenly.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 63,
    question: "Explain database partition pruning.",
    answer: "An optimization where the query engine skips scanning partitions that cannot contain the queried key range, reducing disk reads.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 64,
    question: "What is a columnar database (e.g., ClickHouse)?",
    answer: "A database storing data tables by columns rather than rows, maximizing compression and performance for analytics and aggregate queries.",
    category: "Databases & Sharding",
    difficulty: "Hard",
    frequency: "medium"
  },
  {
    id: 65,
    question: "Explain row-oriented database (e.g., PostgreSQL).",
    answer: "Stops data records by full rows consecutively on disk. Optimized for transactional systems (OLTP) where entire records are read/written.",
    category: "Databases & Sharding",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 66,
    question: "What is database denormalization?",
    answer: "Intentionally introducing duplicate data into a database schema to avoid expensive JOIN queries, optimizing for read performance.",
    category: "Databases & Sharding",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 67,
    question: "Explain database normalization.",
    answer: "The process of organizing tables to eliminate data redundancy and dependency anomalies, optimizing for write integrity.",
    category: "Databases & Sharding",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 68,
    question: "What is DynamoDB's Partition Key vs Sort Key?",
    answer: "Partition key determines the physical hash partition storing the document. Sort key groups and orders items sequentially within that partition.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 69,
    question: "What is replication lag?",
    answer: "The delay between a write operation completing on the master node and that change being successfully written to follower replica nodes.",
    category: "Databases & Sharding",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 70,
    question: "Explain dirty reads vs non-repeatable reads.",
    answer: "Dirty read occurs when a transaction reads uncommitted changes. Non-repeatable read occurs when concurrent edits alter rows read twice by a transaction.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 71,
    question: "What is phantom reads?",
    answer: "When a transaction queries a range of rows, and a concurrent transaction inserts new rows matching the range, causing different results on re-query.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 72,
    question: "What is database isolation levels?",
    answer: "Transactional isolation levels: Read Uncommitted, Read Committed, Repeatable Read, and Serializable (strictest, runs transactions as if serial).",
    category: "Databases & Sharding",
    difficulty: "Hard",
    frequency: "medium"
  },
  {
    id: 73,
    question: "Explain CQRS (Command Query Responsibility Segregation).",
    answer: "A pattern segregating write models (commands) from read models (queries), allowing them to use different databases optimized for writes vs reads.",
    category: "Databases & Sharding",
    difficulty: "Hard",
    frequency: "medium"
  },
  {
    id: 74,
    question: "What is Event Sourcing?",
    answer: "A pattern where database states are derived by replaying a sequence of immutable events from an append-only log, rather than storing direct row edits.",
    category: "Databases & Sharding",
    difficulty: "Hard",
    frequency: "medium"
  },
  {
    id: 75,
    question: "What is dynamic sharding?",
    answer: "Sharding where a central locator service directs queries to shards dynamically based on config lookup, rather than static modulo hashing.",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 76,
    question: "Explain the difference between replication and sharding.",
    answer: "Replication copies the same data across multiple nodes (avail/read scale). Sharding splits distinct data subsets across nodes (write scale).",
    category: "Databases & Sharding",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 77,
    question: "What is a dead lock?",
    answer: "A state where two transactions are blocked indefinitely, each holding a lock the other transaction needs to commit.",
    category: "Databases & Sharding",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 78,
    question: "What is an index scan vs sequential scan?",
    answer: "Index scan queries the index tree first (O(log N)). Sequential scan traverses the entire database table on disk row-by-row (O(N)).",
    category: "Databases & Sharding",
    difficulty: "Easy",
    frequency: "high"
  },
  {
    id: 79,
    question: "What is a composite index?",
    answer: "A database index built on multiple columns. Query filters must match prefix ordering (e.g., index(A,B) assists filter on A, or A and B, not B alone).",
    category: "Databases & Sharding",
    difficulty: "Medium",
    frequency: "high"
  },
  {
    id: 80,
    question: "What is Vector Search in modern databases?",
    answer: "Search indexing based on high-dimensional vector embeddings, measuring Cosine Similarity to find semantic matches (used in AI search).",
    category: "Databases & Sharding",
    difficulty: "Hard",
    frequency: "medium"
  },

  // CATEGORY 3: Caching & Networking (Questions 81 - 120)
  {
    id: 81,
    question: "Explain Cache-Aside (Lazy Loading).",
    answer: "Application checks cache. Hit: returns data. Miss: queries database, writes response to cache, and returns. Reduces db load, but misses are slow.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 82,
    question: "Explain Write-Through caching.",
    answer: "Data is written to the cache and the database simultaneously. Prevents stale cache data, but increases write latency.",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 83,
    question: "Explain Write-Behind (Write-Back) caching.",
    answer: "Writes go directly to cache, which acknowledges immediately. Cache asynchronously batches and flushes writes to database later. High write speed, data loss risk.",
    category: "Caching & Networking",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 84,
    question: "What is Cache Invalidation?",
    answer: "The process of removing stale data from a cache. A hard problem in engineering, managed via timeouts (TTL) or write hooks.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 85,
    question: "Explain LRU (Least Recently Used) cache eviction.",
    answer: "Discards the least recently accessed items first. Implemented in O(1) time using a Doubly Linked List and a Hash Map.",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 86,
    question: "Explain LFU (Least Frequently Used) cache eviction.",
    answer: "Discards items that have the lowest access counts, resolving scenarios where old items stay cached due to a single recent access.",
    category: "Caching & Networking",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 87,
    question: "What is Cache Penetration?",
    answer: "When requests query keys that exist in neither cache nor database. Bypasses cache entirely, hitting the DB. Solved by caching empty/null values or using Bloom Filters.",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 88,
    question: "What is Cache Stampede (Thundering Herd)?",
    answer: "When a hot cache key expires, and thousands of concurrent requests miss the cache at once, hitting the database simultaneously and crashing it. Solved via mutex locking.",
    category: "Caching & Networking",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 89,
    question: "What is Cache Breakdown?",
    answer: "When a single highly popular key expires and multiple threads access it, overloading the DB. Addressed by pre-fetching keys before they expire.",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 90,
    question: "What is the role of a Content Delivery Network (CDN)?",
    answer: "A network of edge servers geographically distributed. Caches static assets close to users, reducing latency and backend origin load.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 91,
    question: "Explain Edge Computing.",
    answer: "Executing simple code logic (e.g. routing redirects, A/B testing) at CDN edge servers instead of routing back to primary servers.",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 92,
    question: "What is Layer 4 vs Layer 7 Load Balancing?",
    answer: "L4 balances based on network TCP/IP details (fast, simple). L7 balances based on HTTP data like path, headers, cookies (smart routing, slower).",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 93,
    question: "What is DNS (Domain Name System)?",
    answer: "The internet's phonebook. Translates human-readable domain names (example.com) to machine IP addresses (192.0.2.1) recursively.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 94,
    question: "What is DNS TTL?",
    answer: "Time-To-Live. The time duration local DNS clients should cache IP records before querying DNS servers again.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 95,
    question: "Explain the difference between TCP and UDP.",
    answer: "TCP is connection-oriented, guarantees packet delivery and ordering (slower). UDP is connectionless, fast, but drops packets (used in gaming/video).",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 96,
    question: "What is HTTP Long Polling?",
    answer: "Client requests data. Server holds the request open until new data is available, returns it, and client immediately opens a new request.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 97,
    question: "What is Server-Sent Events (SSE)?",
    answer: "A persistent, uni-directional network connection. Server streams updates continuously to the client over standard HTTP protocol.",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 98,
    question: "What is WebSockets?",
    answer: "A persistent, bi-directional, full-duplex TCP communication protocol over a single socket, ideal for real-time applications.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 99,
    question: "Explain HTTP/1.1 vs HTTP/2 vs HTTP/3.",
    answer: "HTTP/1.1 suffers head-of-line blocking. HTTP/2 introduces multiplexing over single TCP connection. HTTP/3 uses UDP-based QUIC protocol, avoiding TCP packet drops bottlenecks.",
    category: "Caching & Networking",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 100,
    question: "What is gRPC?",
    answer: "A high-performance remote procedure call framework developed by Google. Uses HTTP/2 for transport and Protocol Buffers for serialization.",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 101,
    question: "Explain GraphQL vs REST.",
    answer: "REST has fixed endpoints and yields over/under-fetching. GraphQL allows clients to define the exact response JSON shape via a query.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 102,
    question: "What is SSL/TLS Termination?",
    answer: "Decrypting HTTPS traffic at the load balancer level, passing plain HTTP to backend servers, reducing CPU overhead on app nodes.",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 103,
    question: "Explain CORS (Cross-Origin Resource Sharing).",
    answer: "A browser security mechanism allowing servers to define origins authorized to fetch resources, preventing unauthorized domains calls.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 104,
    question: "What is a CDN cache hit ratio?",
    answer: "The percentage of file requests successfully served from CDN edge cache without querying origin servers. High ratio is desired.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 105,
    question: "Explain Session Stickiness.",
    answer: "A load balancer feature routing all requests from a specific client to the same backend server, required for stateful apps.",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 106,
    question: "What is consistent hashing routing in load balancers?",
    answer: "Using request parameters (like client IP) to route requests to the same backend node, supporting local caching without session locks.",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 107,
    question: "What is Head-of-Line Blocking?",
    answer: "When a single slow packet blocks the delivery of subsequent packets in a network queue, degrading transmission speed.",
    category: "Caching & Networking",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 108,
    question: "What is Anycast DNS?",
    answer: "DNS queries automatically route to the geographically nearest DNS server sharing the IP, accelerating initial domain resolution.",
    category: "Caching & Networking",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 109,
    question: "Explain the difference between caching code vs database caching.",
    answer: "Code caching saves program objects in memory. Database caching (like Redis query caching) stores database record strings on fast cache keys.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 110,
    question: "What is connection multiplexing?",
    answer: "Reusing a single physical network connection to send multiple concurrent streams of data, reducing connection establishment overhead.",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 111,
    question: "What is Keep-Alive?",
    answer: "An instruction in HTTP headers requesting the TCP connection to remain open for subsequent requests, reducing socket latency.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 112,
    question: "What is protocol buffers?",
    answer: "An XML/JSON alternative. Serializes structured data into compact binary arrays, speeding up network transmissions (used in gRPC).",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 113,
    question: "Explain the difference between REST and RPC.",
    answer: "REST is resource-oriented (URI paths like /users). RPC is action-oriented (invoking methods like executeTransaction directly).",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 114,
    question: "What is a Bloom Filter?",
    answer: "A space-efficient probabilistic data structure used to test if an element is a member of a set. False positives occur, false negatives do not.",
    category: "Caching & Networking",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 115,
    question: "Explain how DNS caching works.",
    answer: "Saves IP translations at client browser, OS, router, ISP, and resolvers levels, preventing redundant root-DNS queries.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 116,
    question: "What is geo-blocking?",
    answer: "Using DNS or incoming IP addresses coordinates to block users in specific countries or regions from accessing server content.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 117,
    question: "What is TCP slow start?",
    answer: "A congestion control mechanism where a sender slowly increases packets sent until network packet drop limits are hit, finding safe speeds.",
    category: "Caching & Networking",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 118,
    question: "Explain what TLS handshake does.",
    answer: "Exchange of encryption keys, verifying certificates, and establishing a secure symmetric session key between client and server.",
    category: "Caching & Networking",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 119,
    question: "What is connection pooling?",
    answer: "Maintaining a cache of open database connections that can be reused, avoiding the overhead of opening and closing sockets repeatedly.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 120,
    question: "What is gzip/brotli compression?",
    answer: "Algorithms compressing HTTP text files (HTML, CSS, JS) at the server before transmission, reducing network payload sizes.",
    category: "Caching & Networking",
    difficulty: "Easy",
    frequency: "medium"
  },

  // CATEGORY 4: Rate Limiters & Queues (Questions 121 - 160)
  {
    id: 121,
    question: "Explain Token Bucket rate limiting algorithm.",
    answer: "Tokens are added to a bucket at a constant rate. Request is allowed if bucket contains tokens. Handles bursts of requests gracefully.",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 122,
    question: "Explain Leaky Bucket rate limiting algorithm.",
    answer: "Requests enter a FIFO queue. Requests leak out of the bucket at a constant, smooth rate. Smooths out traffic spikes, but drops requests if bucket overflows.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 123,
    question: "Explain Sliding Window Counter rate limiting.",
    answer: "Calculates request frequency dynamically by checking the count in the current window and portion of the previous window, saving memory.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 124,
    question: "Why use Redis for a distributed rate limiter?",
    answer: "Provides shared memory state, sub-millisecond lookups, and supports atomic Lua script execution to avoid race conditions.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 125,
    question: "What is the thundering herd problem in message queues?",
    answer: "When multiple worker nodes wait on a queue; when a task enters, all workers wake up to grab it, consuming high CPU resources.",
    category: "Rate Limiters & Queues",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 126,
    question: "What is a Message Queue?",
    answer: "An asynchronous communication channel decoupling publisher and subscriber. Publisher writes tasks; subscriber pulls and runs them.",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 127,
    question: "Explain the difference between message queues (RabbitMQ) and event streaming (Kafka).",
    answer: "Message queues delete tasks after consumption. Event streaming appends tasks to an immutable log on disk, allowing replayability.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 128,
    question: "What is a Consumer Group in Kafka?",
    answer: "A set of consumers reading a topic. Kafka assigns distinct partitions of the log to each consumer, scaling read speeds.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 129,
    question: "What is Zero-Copy socket transfer?",
    answer: "A system call (sendfile) letting the OS kernel read data from disk cache directly to network socket, bypassing application memory.",
    category: "Rate Limiters & Queues",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 130,
    question: "Explain At-Least-Once delivery guarantee.",
    answer: "Guarantee that a message is delivered, but duplication can occur if acknowledgements fail, requiring idempotent consumers.",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 131,
    question: "Explain At-Most-Once delivery guarantee.",
    answer: "Message is sent once; if it fails, it is lost. Avoids duplicates, but risks task loss.",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 132,
    question: "Explain Exactly-Once delivery guarantee.",
    answer: "The gold standard. Message is processed exactly once, typically requiring transaction coordination between broker and database.",
    category: "Rate Limiters & Queues",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 133,
    question: "What is dead letter queue (DLQ)?",
    answer: "A separate queue where a broker routes messages that failed processing repeatedly, allowing manual auditing later.",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 134,
    question: "Explain consumer lag in message queues.",
    answer: "The difference between the latest message offset written by producers and the offset currently being processed by consumers.",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 135,
    question: "What is log partitioning?",
    answer: "Splitting a single message topic log into multiple distinct logs (partitions) across different broker servers to parallelize writes.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 136,
    question: "Explain what a message broker exchange does.",
    answer: "In AMQP (RabbitMQ), the exchange accepts messages from publishers and routes them to queues based on routing keys.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 137,
    question: "What is poison pill message?",
    answer: "A corrupted message that crashes the consumer worker every time it is read, halting queue progress until discarded.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 138,
    question: "What is a sliding window log rate limiter?",
    answer: "Limiter storing timestamps of all client requests in a set. Deletes old timestamps, counting size. Highly accurate but memory intensive.",
    category: "Rate Limiters & Queues",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 139,
    question: "Explain flow control in messaging.",
    answer: "Mechanisms preventing a fast producer from overloading a slow consumer (e.g., using pull client batch sizes).",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 140,
    question: "What is a message broker broker node?",
    answer: "A physical server instance running queue software, handling network connections and persisting queue states to disk.",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 141,
    question: "Explain the concept of idempotency in API design.",
    answer: "Making sure that executing an API multiple times (e.g. duplicating requests) does not change the server state beyond the first call.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 142,
    question: "What is transaction log tailing?",
    answer: "Reading the database's internal transaction log (like PostgreSQL replication logs) to stream updates as events (CDC).",
    category: "Rate Limiters & Queues",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 143,
    question: "What is CDC (Change Data Capture)?",
    answer: "A design pattern identifying and capturing database changes in real-time and pushing them as events to Kafka for downstream consumers.",
    category: "Rate Limiters & Queues",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 144,
    question: "Explain what fan-out pattern does in messaging.",
    answer: "Routing a single published message to multiple distinct queues or consumers simultaneously, duplicating the data.",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 145,
    question: "What is the role of ZooKeeper in Kafka?",
    answer: "Coordinates cluster metadata, maintains active brokers lists, registers topic configs, and elects partition leaders.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 146,
    question: "What is KRaft in Kafka?",
    answer: "A consensus protocol replacing ZooKeeper, allowing Kafka to manage metadata internally in a specialized event log.",
    category: "Rate Limiters & Queues",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 147,
    question: "What is message serialization?",
    answer: "Converting program data objects into binary arrays (JSON, Protobuf, Avro) for transmission or storage in message brokers.",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 148,
    question: "Explain message TTL.",
    answer: "Time-To-Live. A configuration setting instructing the queue to delete messages automatically if they sit unconsumed for too long.",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 149,
    question: "What is message routing keys?",
    answer: "String metadata attached to messages, guiding the broker's exchange on how to route the message to distinct queues.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 150,
    question: "What is task queue backoff?",
    answer: "An error retry mechanism (exponential backoff) increasing waiting time before retrying failed message operations.",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 151,
    question: "Explain how rate limiting headers look.",
    answer: "Standard HTTP headers: X-RateLimit-Limit (max allowed), X-RateLimit-Remaining, and X-RateLimit-Reset (epoch timestamp to wait).",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 152,
    question: "What is client-side rate limiting?",
    answer: "Throttling requests within the client code, avoiding sending calls that are guaranteed to yield HTTP 429.",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 153,
    question: "What is queue priority?",
    answer: "Designing queues to process higher priority tasks (like payment alerts) before lower priority tasks (like newsletters).",
    category: "Rate Limiters & Queues",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 154,
    question: "What is a message broker cluster?",
    answer: "A group of broker servers working together to share topic workloads, replicating data to ensure high availability.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 155,
    question: "Explain message ingestion metrics.",
    answer: "Monitoring stats: write throughput, publish error rate, consumer lag offset, and broker disk capacity.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 156,
    question: "Explain partition rebalancing in Kafka.",
    answer: "When consumers leave or join a group, the coordinator redistributes topic partitions among remaining consumers.",
    category: "Rate Limiters & Queues",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 157,
    question: "What is partition key hashing?",
    answer: "Applying a hash function to message keys to guarantee that all events with the same key (e.g., userId) land in the same partition.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 158,
    question: "What is page cache in distributed storage?",
    answer: "Using server RAM cache pages to read/write log files directly, bypassing disk accesses during sequential read loops.",
    category: "Rate Limiters & Queues",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 159,
    question: "What is partition replication factor?",
    answer: "The number of broker nodes storing copies of a partition. A factor of 3 means 1 leader and 2 followers exist.",
    category: "Rate Limiters & Queues",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 160,
    question: "Explain transactional messages.",
    answer: "API calls guaranteeing that a message is successfully written to a broker if and only if a database update commits (atomic).",
    category: "Rate Limiters & Queues",
    difficulty: "Hard",
    frequency: "low"
  },

  // CATEGORY 5: SOLID & LLD (Questions 161 - 200)
  {
    id: 161,
    question: "What does SOLID stand for?",
    answer: "Single Responsibility Principle (SRP), Open-Closed Principle (OCP), Liskov Substitution Principle (LSP), Interface Segregation Principle (ISP), and Dependency Inversion Principle (DIP).",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 162,
    question: "What is the Single Responsibility Principle (SRP)?",
    answer: "A class should have only one reason to change, meaning it should perform exactly one job or encapsulate one cohesive responsibility.",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 163,
    question: "Explain the Open-Closed Principle (OCP).",
    answer: "Software entities should be open for extension (adding new behaviors) but closed for modification (changing existing working source code).",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 164,
    question: "What is Liskov Substitution Principle (LSP)?",
    answer: "Subclasses must be substitutable for their parent classes without breaking client code execution or throwing unexpected exceptions.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 165,
    question: "Explain the Interface Segregation Principle (ISP).",
    answer: "Clients should not be forced to depend on methods they do not use, advocating for many small, cohesive interfaces over a bloated general one.",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 166,
    question: "What is the Dependency Inversion Principle (DIP)?",
    answer: "High-level modules should not depend on low-level modules; both should depend on abstractions (interfaces). Abstractions should not depend on details.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 167,
    question: "What is the difference between an Interface and an Abstract Class?",
    answer: "Interfaces define a strict API contract but store no state/variables. Abstract classes can contain implemented helper methods and member states.",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 168,
    question: "Explain the Singleton Pattern.",
    answer: "Guarantees a class possesses only one instance globally and exposes a single point of access (must handle thread safety in Java/C++).",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 169,
    question: "What is the Factory Pattern?",
    answer: "A creational pattern defining an interface for creating an object, but letting subclasses decide which class to instantiate.",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 170,
    question: "Explain the Observer Pattern.",
    answer: "Defines a one-to-many relationship where multiple observer objects monitor a subject, automatically receiving updates on state changes.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 171,
    question: "What is the Strategy Pattern?",
    answer: "Defines a family of algorithms, encapsulates each one, and makes them interchangeable, letting clients toggle algorithms at runtime.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 172,
    question: "What is the Decorator Pattern?",
    answer: "Attaches additional responsibilities to an object dynamically, providing a flexible alternative to subclassing for extending functionality.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 173,
    question: "Explain the Adapter Pattern.",
    answer: "Converts the interface of a class into another interface clients expect, allowing incompatible interfaces to cooperate.",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 174,
    question: "What is Dependency Injection (DI)?",
    answer: "A technique where objects receive their dependencies from external coordinators (injected via constructor) rather than instantiating them internally.",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 175,
    question: "Explain Composition over Inheritance.",
    answer: "Designing classes by combining helper objects (composition) rather than subclassing parent classes, avoiding rigid hierarchies.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 176,
    question: "What is the State Pattern?",
    answer: "Allows an object to alter its behavior when its internal state changes, encapsulating state-specific actions into dedicated classes.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 177,
    question: "Explain the Command Pattern.",
    answer: "Encapsulates a request as an object, letting you parameterize clients with queues, logs, and support undoable operations.",
    category: "SOLID & LLD",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 178,
    question: "What is OOP encapsulation?",
    answer: "Bundling data variables and methods operating on them into a single class, hiding internal details from direct external access.",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 179,
    question: "Explain OOP Polymorphism.",
    answer: "The ability of different objects to respond to the same interface call in distinct, specialized ways (method overriding/overloading).",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 180,
    question: "What is the Proxy Pattern?",
    answer: "Provides a placeholder/surrogate object to control access to a real object (e.g., checking permissions, logging calls).",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 181,
    question: "What is the Facade Pattern?",
    answer: "Provides a simplified, high-level interface to a complex subsystem of classes, making the library easier to interact with.",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 182,
    question: "Explain the Template Method Pattern.",
    answer: "Defines the skeleton of an algorithm in a parent class method, deferring implementation details of steps to subclasses.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 183,
    question: "What is the Chain of Responsibility Pattern?",
    answer: "Passes client requests along a chain of handlers. Each handler decides to either process the request or pass it to the next node.",
    category: "SOLID & LLD",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 184,
    question: "What is coupling vs cohesion?",
    answer: "Coupling measures external dependencies between modules (aim for low). Cohesion measures similarity of internal functions in a module (aim for high).",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 185,
    question: "Explain the Flyweight Pattern.",
    answer: "Minimizes memory usage by sharing state elements across multiple similar objects rather than storing duplicates.",
    category: "SOLID & LLD",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 186,
    question: "What is the Builder Pattern?",
    answer: "A creational pattern that separates complex object construction from its representation, facilitating step-by-step object assembly.",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 187,
    question: "What is a Class Diagram?",
    answer: "A UML diagram representing classes, their member fields, methods, and relationships (inheritance, association, composition).",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 188,
    question: "Explain the difference between association and composition.",
    answer: "Association is a loose relationship where classes exist independently. Composition is a strong ownership relationship; children die if parent dies.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 189,
    question: "What is aggregation in class relationships?",
    answer: "A specialized association where a parent owns children, but children can survive independent of parent lifetime.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 190,
    question: "Explain the MVC (Model-View-Controller) pattern.",
    answer: "Segregates applications into Data Models, UI Views, and Controller routing logic, organizing frontend/backend codes.",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 191,
    question: "What is double dispatch?",
    answer: "A mechanism dispatching calls dynamically based on runtime types of both the receiver and the argument (visitor pattern).",
    category: "SOLID & LLD",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 192,
    question: "What is the Mediator Pattern?",
    answer: "Restricts direct communications between objects, forcing them to communicate through a central mediator object, reducing dependencies.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 193,
    question: "Explain the Iterator Pattern.",
    answer: "Provides a way to access elements of an aggregate collection sequentially without exposing its underlying structure representation.",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 194,
    question: "What is clean code Refactoring?",
    answer: "Restructuring existing code without changing its external behavior, aiming to improve non-functional attributes like readability and maintainability.",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 195,
    question: "Explain class inheritance limits.",
    answer: "Inheritance is compile-time (inflexible), breaks encapsulation (parent exposing internals to subclasses), and triggers deep hierarachy traps.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 196,
    question: "What is the state pattern in LLD booking?",
    answer: "Modeling states (PENDING, PAID, CANCELLED) as separate classes implementing a State interface, cleaning up messy nested switch states.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 197,
    question: "What is the Visitor Pattern?",
    answer: "Separates algorithms from the operational class elements on which they act, allowing you to add new operations without edits.",
    category: "SOLID & LLD",
    difficulty: "Hard",
    frequency: "low"
  },
  {
    id: 198,
    question: "What is code abstraction?",
    answer: "Simplifying complex reality by modeling classes appropriate to the problem, hiding trivial background details from implementation scope.",
    category: "SOLID & LLD",
    difficulty: "Easy",
    frequency: "medium"
  },
  {
    id: 199,
    question: "Explain thread safety in LLD design patterns.",
    answer: "Ensuring patterns like singletons or registries behave correctly when accessed concurrently by multiple threads, using locks or sync keys.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  },
  {
    id: 200,
    question: "Why does the Dependency Inversion Principle prevent merge conflicts?",
    answer: "By forcing services to depend on static interfaces rather than dynamic concrete code, developers can work on distinct implementations in isolation.",
    category: "SOLID & LLD",
    difficulty: "Medium",
    frequency: "medium"
  }
];
