export interface ComparisonOption {
  name: string;
  tagline: string;
  pros: string[];
  cons: string[];
  useCases: string[];
  examples: string[];
}

export interface TechComparison {
  id: string;
  title: string;
  category: 'Databases' | 'Messaging' | 'API' | 'Architecture' | 'Networking' | 'Caching' | 'Storage';
  emoji: string;
  summary: string;
  optionA: ComparisonOption;
  optionB: ComparisonOption;
  optionC?: ComparisonOption;  // for 3-way comparisons
  verdict: {
    useA: string;
    useB: string;
    useC?: string;
    tldr: string;
  };
}

export const techComparisons: TechComparison[] = [
  {
    id: "sql-vs-nosql",
    title: "SQL vs NoSQL",
    category: "Databases",
    emoji: "🗄️",
    summary: "The foundational database choice. SQL enforces ACID guarantees with structured schemas; NoSQL trades some consistency for horizontal scalability and schema flexibility.",
    optionA: {
      name: "SQL (Relational)",
      tagline: "Structured, consistent, relational",
      pros: [
        "ACID transactions — strong consistency guarantees",
        "Complex queries with JOINs, aggregations, and GROUP BY",
        "Mature ecosystem: PostgreSQL, MySQL — decades of tooling",
        "Schema enforcement catches data bugs at the DB layer",
        "Foreign keys enforce referential integrity automatically"
      ],
      cons: [
        "Vertical scaling is the primary path — horizontal sharding is complex",
        "Schema migrations require careful planning in production",
        "Poor fit for hierarchical, graph, or unstructured data",
        "Can become a bottleneck at very high write throughput"
      ],
      useCases: ["Financial transactions, banking ledgers", "E-commerce orders and inventory", "User accounts and authentication", "Any domain with complex relationships and strong consistency needs"],
      examples: ["PostgreSQL", "MySQL / MariaDB", "Amazon RDS", "Google Cloud SQL"]
    },
    optionB: {
      name: "NoSQL",
      tagline: "Scalable, flexible, eventually consistent",
      pros: [
        "Horizontal scaling built-in (sharding is first-class)",
        "Schema-less or flexible schema — easy to evolve",
        "Optimized for specific access patterns (key-value, document, time-series)",
        "High write throughput at scale (Cassandra writes 1M+ ops/sec)",
        "Multi-region replication with eventual consistency"
      ],
      cons: [
        "Limited or no multi-document ACID transactions (varies by DB)",
        "No JOINs — must denormalize data for query patterns",
        "Eventual consistency means stale reads are possible",
        "Schema flexibility can become a liability — inconsistent data"
      ],
      useCases: ["User sessions, shopping carts (Redis)", "Social media feeds, activity streams (Cassandra)", "Product catalogs, content (MongoDB)", "IoT sensor data, time-series metrics (InfluxDB, Cassandra)"],
      examples: ["MongoDB", "Cassandra", "DynamoDB", "Redis", "InfluxDB"]
    },
    verdict: {
      useA: "Strong consistency + complex relations: finance, orders, auth",
      useB: "High write volume + simple access patterns + massive scale",
      tldr: "Default to PostgreSQL. Switch to NoSQL only when you've identified a specific scaling bottleneck or access pattern SQL can't serve efficiently."
    }
  },

  {
    id: "kafka-vs-rabbitmq",
    title: "Kafka vs RabbitMQ",
    category: "Messaging",
    emoji: "📨",
    summary: "Both are message brokers, but with fundamentally different philosophies. Kafka is a distributed commit log optimized for high-throughput event streaming; RabbitMQ is a traditional message broker optimized for routing and task queues.",
    optionA: {
      name: "Apache Kafka",
      tagline: "High-throughput event log with replay",
      pros: [
        "Extremely high throughput — millions of messages/sec per broker",
        "Messages are persisted to disk and replayable (retention period)",
        "Consumer groups scale horizontally without affecting each other",
        "Immutable append-only log — natural audit trail",
        "Native support for exactly-once semantics (v0.11+)"
      ],
      cons: [
        "High operational complexity — ZooKeeper/KRaft, partition management",
        "No per-message routing or direct exchange logic",
        "Messages not deleted after consumer reads — partition-based retention",
        "Complex consumer offset management",
        "Ordering only guaranteed within a single partition"
      ],
      useCases: ["Event streaming pipelines (user activity, clicks, logs)", "Change data capture (CDC) from databases", "Real-time analytics ingestion", "Event sourcing event store"],
      examples: ["LinkedIn (invented Kafka)", "Uber ride events", "Twitter event stream", "Confluent Cloud"]
    },
    optionB: {
      name: "RabbitMQ",
      tagline: "Flexible routing with traditional queue semantics",
      pros: [
        "Rich routing: direct, topic, fanout, headers exchanges",
        "Messages deleted after successful consumer acknowledgment",
        "Simple task queue model — easy to implement worker pools",
        "Per-message TTL, priority queues, dead-letter queues built-in",
        "Lightweight and easy to operate compared to Kafka"
      ],
      cons: [
        "Not designed for replay — messages gone after consumption",
        "Lower throughput ceiling than Kafka for high-volume streaming",
        "Not optimized for long-term event retention",
        "Horizontal scaling is harder than Kafka"
      ],
      useCases: ["Task/job queues (email sending, image processing)", "RPC-style request/reply patterns", "Routing events to multiple queues with different rules", "Simpler microservice integration"],
      examples: ["Pivotal RabbitMQ", "CloudAMQP", "Amazon MQ"]
    },
    verdict: {
      useA: "High-volume event streaming, audit logs, replay needed",
      useB: "Task queues, complex routing, RPC, simpler ops",
      tldr: "Kafka for event streaming at scale; RabbitMQ for task queues and flexible message routing. Many systems use both."
    }
  },

  {
    id: "redis-vs-memcached",
    title: "Redis vs Memcached",
    category: "Caching",
    emoji: "⚡",
    summary: "Both are in-memory key-value stores used for caching. Redis is a feature-rich data structure server; Memcached is a simpler, high-performance pure cache.",
    optionA: {
      name: "Redis",
      tagline: "Feature-rich in-memory data structure store",
      pros: [
        "Rich data structures: strings, hashes, lists, sets, sorted sets, streams",
        "Persistence options: RDB snapshots + AOF write-ahead log",
        "Native pub/sub, Lua scripting, transactions (MULTI/EXEC)",
        "Sorted sets enable leaderboards, rate limiters, priority queues",
        "Redis Cluster for horizontal sharding"
      ],
      cons: [
        "More complex to configure and operate than Memcached",
        "Single-threaded for commands (until Redis 6 I/O threads)",
        "Persistence has overhead — pure caching use case doesn't need it",
        "Memory overhead per key is higher than Memcached"
      ],
      useCases: ["Session storage, rate limiting, leaderboards", "Pub/sub messaging", "Distributed locks (Redlock)", "Caching complex objects with TTL"],
      examples: ["Redis OSS", "Redis Enterprise", "AWS ElastiCache for Redis", "Upstash"]
    },
    optionB: {
      name: "Memcached",
      tagline: "Simple, fast, pure caching",
      pros: [
        "Extremely simple — just key-value strings",
        "Multi-threaded architecture — can utilize all CPU cores",
        "Lower memory overhead per key",
        "Dead simple to operate and scale"
      ],
      cons: [
        "Only strings — no rich data structures",
        "No persistence — data lost on restart",
        "No native clustering with data consistency",
        "No pub/sub, scripting, or transactions"
      ],
      useCases: ["Simple object/page caching", "Database query result caching", "High-throughput string lookups"],
      examples: ["Memcached", "AWS ElastiCache for Memcached"]
    },
    verdict: {
      useA: "Almost always — Redis does everything Memcached does and more",
      useB: "Only if you need pure multi-threaded caching and absolute simplicity",
      tldr: "Default to Redis. Memcached is only compelling for pure, high-throughput string caching where you've measured a performance gap."
    }
  },

  {
    id: "rest-vs-graphql-vs-grpc",
    title: "REST vs GraphQL vs gRPC",
    category: "API",
    emoji: "🌐",
    summary: "Three dominant API paradigms with different tradeoffs for data fetching efficiency, performance, and type safety.",
    optionA: {
      name: "REST",
      tagline: "Resource-based, ubiquitous, stateless",
      pros: [
        "Universally understood — every HTTP client can consume it",
        "Easy to cache with HTTP semantics (GET is cacheable)",
        "Simple mental model: nouns are resources, verbs are HTTP methods",
        "Excellent tooling: OpenAPI/Swagger, Postman, curl"
      ],
      cons: [
        "Over-fetching: endpoint returns more data than client needs",
        "Under-fetching: multiple round trips needed to get related data",
        "No strong type contract without OpenAPI schema enforcement",
        "Versioning (v1/v2) creates proliferating endpoints"
      ],
      useCases: ["Public APIs consumed by third parties", "Simple CRUD services", "Mobile + web where caching matters", "Any API where simplicity > performance"],
      examples: ["GitHub API", "Stripe API", "Twitter v1 API"]
    },
    optionB: {
      name: "GraphQL",
      tagline: "Query exactly what you need, nothing more",
      pros: [
        "Client specifies exactly the fields it needs — no over/under-fetching",
        "Single endpoint for all queries and mutations",
        "Strongly typed schema is a built-in contract",
        "Introspection — clients can discover the API schema at runtime"
      ],
      cons: [
        "HTTP caching is complex (all queries are POST to same endpoint)",
        "N+1 query problem without DataLoader batching",
        "Higher server-side complexity to implement resolvers",
        "Poor fit for simple CRUD or file upload"
      ],
      useCases: ["Complex frontends fetching from many entity types", "Mobile apps where bandwidth is precious", "Developer-facing APIs with diverse query needs"],
      examples: ["GitHub v4 API", "Shopify Storefront API", "Facebook API"]
    },
    optionC: {
      name: "gRPC",
      tagline: "High-performance binary protocol for service-to-service",
      pros: [
        "Binary protobuf encoding — 5-10x smaller than JSON",
        "Strongly typed contracts with .proto files and code generation",
        "HTTP/2 multiplexing — bidirectional streaming, no head-of-line blocking",
        "Excellent for internal service-to-service calls at high throughput"
      ],
      cons: [
        "Not human-readable — requires tooling to inspect",
        "Limited browser support (gRPC-web proxy needed)",
        "Harder to consume without generated client libraries",
        "Schema changes require careful backward compatibility"
      ],
      useCases: ["Internal microservice communication", "Real-time bidirectional streaming", "Mobile client ↔ backend where latency is critical"],
      examples: ["Google internal services", "Kubernetes API server", "Netflix inter-service calls"]
    },
    verdict: {
      useA: "Public APIs, external consumers, simple CRUD, caching matters",
      useB: "Complex frontend data needs, mobile bandwidth optimization",
      useC: "Internal microservice-to-service calls at high throughput",
      tldr: "REST for external/public APIs. gRPC for internal service mesh. GraphQL for data-hungry frontends with many entity relationships."
    }
  },

  {
    id: "websocket-vs-sse",
    title: "WebSocket vs SSE vs Long Polling",
    category: "Networking",
    emoji: "🔌",
    summary: "Three techniques for pushing real-time updates from server to client, each with different complexity, directionality, and browser compatibility tradeoffs.",
    optionA: {
      name: "WebSocket",
      tagline: "Full-duplex bidirectional persistent connection",
      pros: [
        "Full duplex — client and server can send messages simultaneously",
        "Low latency — single TCP connection, no HTTP overhead per message",
        "Ideal for real-time bidirectional flows (chat, gaming, collaboration)",
        "Binary or text frames"
      ],
      cons: [
        "Stateful connections complicate horizontal scaling (use sticky sessions or pub/sub)",
        "More complex server infrastructure",
        "Firewalls/proxies may block non-standard WebSocket ports"
      ],
      useCases: ["Chat applications", "Multiplayer games", "Live collaboration (Google Docs-style)", "Trading terminals"],
      examples: ["WhatsApp, Discord, Slack (real-time messaging)", "Figma (live cursors)", "Stock ticker dashboards"]
    },
    optionB: {
      name: "Server-Sent Events (SSE)",
      tagline: "Server-to-client one-way HTTP streaming",
      pros: [
        "Simple — built on plain HTTP, automatic reconnection, standard API",
        "Works through HTTP/2 multiplexing — many SSE streams on one connection",
        "No special server infrastructure needed",
        "Native browser EventSource API with auto-reconnect"
      ],
      cons: [
        "Unidirectional — server to client only (use AJAX for client → server)",
        "Limited to text (UTF-8) — no binary frames",
        "Some proxy/load balancer timeout issues for long-lived connections"
      ],
      useCases: ["Live news feeds, notifications", "Progress updates (file upload status)", "Dashboard metrics updates", "AI streaming responses (ChatGPT-style token streaming)"],
      examples: ["GitHub Actions live log streaming", "ChatGPT response streaming", "Twitter live count updates"]
    },
    optionC: {
      name: "Long Polling",
      tagline: "HTTP request held open until data available",
      pros: [
        "Works everywhere — pure HTTP, no WebSocket support needed",
        "Simplest to implement server-side",
        "Compatible with all proxies and load balancers"
      ],
      cons: [
        "High server resource usage — each client holds an open connection",
        "Higher latency than WebSocket or SSE",
        "Thundering herd: all clients reconnect simultaneously when server responds"
      ],
      useCases: ["Legacy browser support fallback", "Low-frequency updates where SSE is overkill", "Simple notification polling"],
      examples: ["Old Facebook chat (pre-WebSocket)", "Comet-style push in legacy apps"]
    },
    verdict: {
      useA: "Bidirectional real-time: chat, games, live collaboration",
      useB: "Server push only: notifications, feeds, AI streaming",
      useC: "Fallback only — avoid when SSE is available",
      tldr: "Default to SSE for server-push. Use WebSocket only when you need client-to-server messages at high frequency (chat, gaming). Avoid long polling."
    }
  },

  {
    id: "monolith-vs-microservices",
    title: "Monolith vs Microservices",
    category: "Architecture",
    emoji: "🏗️",
    summary: "The most consequential architectural decision for a new service. Monoliths are simpler to build and operate; microservices enable independent scaling and deployment but add enormous distributed systems complexity.",
    optionA: {
      name: "Monolith",
      tagline: "Single deployable unit — simple and fast to start",
      pros: [
        "Simple local development — run one process, no service discovery",
        "In-process function calls — zero network latency for internal operations",
        "Easy to refactor — rename, move code with compiler help",
        "Single database — ACID transactions across all entities",
        "Lower operational complexity — one deployment pipeline"
      ],
      cons: [
        "Scaling the entire app even if only one module needs more resources",
        "Long build/test/deploy cycles as codebase grows",
        "Technology lock-in — entire system must use same language/framework",
        "A bug in one module can bring down the whole process"
      ],
      useCases: ["Early-stage startups and MVPs", "Small teams (< 5 engineers)", "Applications where all components scale together", "When operational simplicity matters more than independent scale"],
      examples: ["Early Shopify", "Basecamp", "Stack Overflow (still monolith at high scale)"]
    },
    optionB: {
      name: "Microservices",
      tagline: "Independent services with independent deployment",
      pros: [
        "Independent deployment — update Payment service without touching Orders",
        "Independent scaling — scale only the service under load",
        "Technology diversity — each service can use the best tool for its job",
        "Fault isolation — a crash in Recommendations doesn't affect Checkout",
        "Smaller codebases — each service is easier to understand and test"
      ],
      cons: [
        "Distributed systems complexity: network failures, latency, partial failures",
        "No ACID across services — need Saga pattern for distributed transactions",
        "Operational overhead: service discovery, CI/CD per service, distributed tracing",
        "Data consistency is much harder — eventual consistency is the default",
        "Network calls replace in-process calls — latency adds up"
      ],
      useCases: ["Large organizations with multiple teams owning different domains", "Services with vastly different scaling requirements", "When independent deployment velocity is critical"],
      examples: ["Netflix (hundreds of services)", "Amazon", "Uber (1000+ services)"]
    },
    verdict: {
      useA: "Start here — almost always the right choice for early-stage products",
      useB: "When monolith scaling pain is real and teams are large enough",
      tldr: "Start monolith. Extract to microservices at identified scaling seams. 'Microservices from day one' is almost always the wrong choice for startups."
    }
  },

  {
    id: "strong-vs-eventual-consistency",
    title: "Strong vs Eventual Consistency",
    category: "Databases",
    emoji: "🔗",
    summary: "The core tradeoff in distributed systems per the CAP theorem. Strong consistency guarantees every read sees the latest write; eventual consistency allows stale reads for higher availability and performance.",
    optionA: {
      name: "Strong Consistency",
      tagline: "Every read reflects the most recent write",
      pros: [
        "Simple programming model — no need to handle stale data",
        "Essential for financial, inventory, and booking systems",
        "No read-your-writes surprises",
        "Easier to reason about correctness"
      ],
      cons: [
        "Higher latency — reads must wait for replica acknowledgment",
        "Lower availability — system may refuse requests during network partition",
        "Harder to achieve across geographically distributed systems",
        "Throughput limited by synchronous replication"
      ],
      useCases: ["Bank account balances", "Seat/ticket booking (prevent double booking)", "Inventory decrement on purchase", "Authentication tokens"],
      examples: ["Google Spanner (TrueTime)", "CockroachDB", "Zookeeper", "etcd"]
    },
    optionB: {
      name: "Eventual Consistency",
      tagline: "All replicas will converge given no new updates",
      pros: [
        "Higher availability — system accepts writes even during network partition",
        "Lower latency — no synchronous replication round-trips",
        "Better performance at global scale (write locally, replicate async)",
        "Higher throughput — no coordination overhead"
      ],
      cons: [
        "Stale reads — user may see outdated data",
        "Conflict resolution needed for concurrent writes (CRDTs, last-write-wins)",
        "Complex application logic to handle inconsistency windows",
        "Hard to guarantee correctness for monetary operations"
      ],
      useCases: ["Social media feeds and likes (count doesn't need to be exact)", "Shopping cart (can merge diverged carts)", "DNS propagation", "Product reviews and ratings"],
      examples: ["Amazon DynamoDB", "Cassandra", "CouchDB", "DNS"]
    },
    verdict: {
      useA: "Money, inventory, bookings — anything with real-world consequences",
      useB: "Social counts, caches, content — where staleness is tolerable",
      tldr: "Always ask 'what's the cost of a stale read?' If it involves money or a physical resource, use strong consistency. For social metrics, use eventual consistency."
    }
  },

  {
    id: "tcp-vs-udp",
    title: "TCP vs UDP",
    category: "Networking",
    emoji: "🌍",
    summary: "TCP guarantees ordered, reliable delivery at the cost of latency overhead. UDP is fast and lightweight with no guarantees — the application handles reliability if needed.",
    optionA: {
      name: "TCP",
      tagline: "Reliable, ordered, connection-oriented",
      pros: [
        "Guaranteed delivery — retransmits lost packets automatically",
        "In-order delivery — data arrives in sequence",
        "Flow control and congestion control built-in",
        "Connection handshake ensures both sides are ready"
      ],
      cons: [
        "Head-of-line blocking — lost packet blocks later packets",
        "3-way handshake adds latency for connection setup",
        "Higher overhead per packet (20-byte header + control messages)",
        "Not suitable for real-time where latency > reliability"
      ],
      useCases: ["HTTP/HTTPS, API calls", "File transfers (FTP, SFTP)", "Email (SMTP, IMAP)", "Database connections"],
      examples: ["All HTTP traffic", "SSH connections", "WebSocket (over TCP)"]
    },
    optionB: {
      name: "UDP",
      tagline: "Fast, connectionless, no guarantees",
      pros: [
        "Low latency — no connection setup, no retransmission delays",
        "Stateless — no per-connection state on server",
        "Broadcasts and multicasts are possible",
        "Application controls what reliability mechanisms to add"
      ],
      cons: [
        "No delivery guarantee — packets can be lost, duplicated, or reordered",
        "Application must handle reliability if needed",
        "No congestion control — can overwhelm networks",
        "Firewalls often block UDP"
      ],
      useCases: ["Real-time gaming (stale position data is worthless)", "Voice/video calls (dropped frame better than frozen frame)", "DNS queries (fast, retried at app layer)", "Live video streaming"],
      examples: ["QUIC (HTTP/3 uses UDP)", "Zoom/WebRTC", "DNS", "Online games (CS:GO, Valorant)"]
    },
    verdict: {
      useA: "Reliable data transfer: APIs, files, auth, databases",
      useB: "Real-time low-latency: gaming, video calls, live streaming",
      tldr: "Default TCP. Use UDP only when latency beats correctness — realtime media and games. Note: HTTP/3 uses QUIC (UDP) for reduced latency everywhere."
    }
  },

  {
    id: "jwt-vs-sessions",
    title: "JWT vs Session Cookies",
    category: "API",
    emoji: "🔐",
    summary: "Two dominant approaches for maintaining authenticated state between client and server. JWTs are self-contained and stateless; sessions require server-side storage but are easier to revoke.",
    optionA: {
      name: "JWT (JSON Web Tokens)",
      tagline: "Stateless self-contained token",
      pros: [
        "Stateless — server holds no session state, scales horizontally easily",
        "Works across domains and services (microservices can validate the token independently)",
        "Compact and self-describing — contains claims (userId, roles)",
        "Perfect for mobile apps and third-party API access"
      ],
      cons: [
        "Cannot be revoked before expiry without a server-side token blacklist",
        "If signing key is compromised, all tokens are compromised",
        "Token size increases with claims — added HTTP header overhead",
        "Must rotate keys carefully; improper validation causes security issues"
      ],
      useCases: ["Microservice authentication (no shared session store needed)", "Mobile API authentication", "Short-lived access tokens with refresh token pattern", "Third-party API keys"],
      examples: ["Auth0, Firebase Auth", "AWS Cognito", "Most REST APIs"]
    },
    optionB: {
      name: "Session Cookies",
      tagline: "Server-side session with opaque cookie",
      pros: [
        "Instant revocation — delete the session server-side to log out immediately",
        "Smaller cookie — just a session ID, not the full payload",
        "HttpOnly + Secure flags protect from XSS and interception",
        "Simpler security model — server is the single source of truth"
      ],
      cons: [
        "Requires shared session store (Redis) for horizontal scaling",
        "Cross-domain requests need CORS + SameSite configuration",
        "CSRF attacks if not protected with CSRF tokens",
        "Session store becomes a bottleneck and SPOF if not replicated"
      ],
      useCases: ["Traditional web apps where server controls the full stack", "Applications requiring instant logout/revocation", "Banking and financial apps (security-critical)"],
      examples: ["Traditional Rails, Django, Laravel apps", "Bank portals", "GitHub (web session)"]
    },
    verdict: {
      useA: "Microservices, mobile apps, stateless APIs, third-party access",
      useB: "Traditional web apps, security-critical flows requiring instant revocation",
      tldr: "Use short-lived JWTs (15min) + refresh tokens for APIs. Use sessions for traditional web apps where instant revocation is critical."
    }
  },

  {
    id: "btree-vs-lsm",
    title: "B-Tree vs LSM-Tree Index",
    category: "Storage",
    emoji: "🌲",
    summary: "The two dominant database index structures. B-Trees optimize for read-heavy mixed workloads; LSM-Trees optimize for write-heavy append-only workloads.",
    optionA: {
      name: "B-Tree",
      tagline: "Balanced tree — fast reads, moderate write cost",
      pros: [
        "Fast point reads and range scans — O(log n)",
        "In-place updates — good for mixed read/write workloads",
        "Predictable read performance — tree depth is bounded",
        "Used in virtually all traditional databases (PostgreSQL, MySQL, Oracle)"
      ],
      cons: [
        "Write amplification — every write updates the B-Tree in-place, causing random I/O",
        "Not optimal for SSDs (random writes wear flash cells faster)",
        "Fragmentation over time reduces space efficiency"
      ],
      useCases: ["OLTP databases with mixed read/write", "PostgreSQL, MySQL primary indexes", "Any workload where reads are more frequent than writes"],
      examples: ["PostgreSQL (default index)", "MySQL InnoDB", "SQLite", "Oracle"]
    },
    optionB: {
      name: "LSM-Tree (Log-Structured Merge)",
      tagline: "Sequential writes — optimized for high write throughput",
      pros: [
        "Sequential writes only — no random I/O on write path",
        "Very high write throughput (Cassandra, RocksDB handle 1M+ writes/sec)",
        "Excellent for SSDs — sequential writes extend SSD lifespan",
        "Compression during compaction reduces storage size"
      ],
      cons: [
        "Read amplification — must check multiple SSTables for a key",
        "Background compaction consumes CPU and I/O",
        "Write amplification during compaction (data rewritten multiple times)",
        "More complex implementation and tuning"
      ],
      useCases: ["Write-heavy workloads: IoT, logging, time-series", "Cassandra, RocksDB, LevelDB", "Any workload where writes outnumber reads significantly"],
      examples: ["Cassandra", "RocksDB (Facebook)", "LevelDB (Google)", "InfluxDB", "ScyllaDB"]
    },
    verdict: {
      useA: "OLTP mixed workloads: PostgreSQL, MySQL for typical web apps",
      useB: "Write-heavy: time-series, event logs, IoT, Cassandra-backed systems",
      tldr: "B-Tree for balanced mixed workloads. LSM for high-volume sequential writes. This is why Cassandra uses LSM and is suited for time-series/event data."
    }
  },

  {
    id: "active-active-vs-passive",
    title: "Active-Active vs Active-Passive HA",
    category: "Architecture",
    emoji: "🔁",
    summary: "Two strategies for high availability in distributed systems. Active-active runs multiple live nodes sharing traffic; active-passive keeps a warm standby that activates on failure.",
    optionA: {
      name: "Active-Active",
      tagline: "All nodes serve traffic simultaneously",
      pros: [
        "No failover downtime — traffic redistributes seamlessly when a node fails",
        "Better resource utilization — all nodes serve requests",
        "Higher total throughput — combined capacity of all nodes",
        "Horizontal scaling is natural"
      ],
      cons: [
        "Write conflicts — concurrent writes to different nodes need conflict resolution",
        "More complex consistency model (eventual consistency is common)",
        "Requires load balancer with health checks",
        "Session stickiness issues if state is node-local"
      ],
      useCases: ["Stateless services (web servers, API servers)", "Global multi-region databases (DynamoDB global tables)", "CDN edge nodes"],
      examples: ["AWS ELB across multiple EC2 instances", "DynamoDB global tables", "CockroachDB multi-region"]
    },
    optionB: {
      name: "Active-Passive",
      tagline: "Primary serves traffic; standby activates on failure",
      pros: [
        "No write conflicts — only one primary accepts writes at a time",
        "Simpler consistency model",
        "Straightforward failover logic",
        "Good for stateful systems (databases with strong consistency)"
      ],
      cons: [
        "Failover takes time — standby needs to detect failure and promote itself",
        "Passive node wastes resources while idle",
        "Brief downtime during failover (seconds to minutes)",
        "Lower total capacity — only primary handles traffic"
      ],
      useCases: ["Relational databases (PostgreSQL primary/replica)", "Leader election in distributed systems", "Systems requiring strict write ordering"],
      examples: ["PostgreSQL primary/replica", "Redis Sentinel", "MySQL primary/replica", "Many database HA setups"]
    },
    verdict: {
      useA: "Stateless services and global scale with eventual consistency",
      useB: "Stateful databases requiring strict consistency and strong ordering",
      tldr: "Active-active for stateless app servers and eventually-consistent stores. Active-passive for ACID databases where write conflicts are unacceptable."
    }
  },

  {
    id: "cache-strategies",
    title: "Cache-Aside vs Read-Through vs Write-Behind",
    category: "Caching",
    emoji: "💾",
    summary: "Three patterns for integrating a cache with your database. They differ in who is responsible for loading/writing cache entries and how write durability is handled.",
    optionA: {
      name: "Cache-Aside (Lazy Loading)",
      tagline: "App manages cache manually — check cache, miss → load DB → populate cache",
      pros: [
        "Simple to understand and implement",
        "Cache only contains what's actually requested — efficient use of memory",
        "Cache failures are transparent — app falls back to DB directly",
        "Works with any cache and database combination"
      ],
      cons: [
        "Cache miss penalty — first request after TTL expires is slow",
        "Risk of stale data — cache and DB can diverge",
        "Cache stampede: many requests simultaneously miss and query the DB"
      ],
      useCases: ["Read-heavy workloads where most data isn't accessed", "Any system where the cache failing gracefully to DB is acceptable", "Most common pattern — used by default in Redis integrations"],
      examples: ["Redis + any application", "Memcached + Rails", "Most web app caching"]
    },
    optionB: {
      name: "Read-Through",
      tagline: "Cache itself fetches from DB on miss — transparent to application",
      pros: [
        "Application only interacts with the cache — simpler code",
        "Cache is always populated on read — no explicit populate code",
        "Consistent access pattern for application"
      ],
      cons: [
        "Cache miss still causes latency — first request is slow",
        "Cache library must support read-through configuration",
        "Less control over what gets cached"
      ],
      useCases: ["When you want to abstract away DB logic behind the cache", "CDNs naturally implement read-through caching from origin"],
      examples: ["CDN origin pull (read-through from origin server)", "AWS DAX for DynamoDB"]
    },
    optionC: {
      name: "Write-Behind (Write-Back)",
      tagline: "Write to cache first, async flush to DB later",
      pros: [
        "Extremely low write latency — writes complete at cache speed",
        "Database write batching reduces load",
        "Absorbs write spikes — cache buffers bursts"
      ],
      cons: [
        "Risk of data loss if cache fails before flush — durability concerns",
        "Complex to implement correctly with failure handling",
        "Not suitable for financial/transactional data"
      ],
      useCases: ["Write-heavy workloads where durability can be delayed", "Game state, analytics counters, non-critical event data"],
      examples: ["Redis write-behind plugins", "Game score counters", "Analytics event buffering"]
    },
    verdict: {
      useA: "Default choice — read-heavy workloads with explicit cache management",
      useB: "When you want cache to be fully transparent to application code",
      useC: "Write-heavy, latency-sensitive, non-critical data only",
      tldr: "Use Cache-Aside by default. Upgrade to Write-Behind only for high-volume writes where DB latency is a bottleneck and durability can be deferred."
    }
  }
];
