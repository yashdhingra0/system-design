export interface Concept {
  id: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  keyPoints: string[];
  tradeoffs: {
    optionA: string;
    optionB: string;
    comparison: string;
  }[];
  visualAid: string; // Describes the mental model for UI rendering
}

export const concepts: Concept[] = [
  {
    id: "scaling",
    title: "Horizontal vs. Vertical Scaling",
    category: "Architecture",
    summary: "Scale Out vs. Scale Up: The fundamental design decision for handling increased resource demand in computing systems.",
    description: `Scaling is the process of adding resource capacity to a system to handle growing workloads.
    
**Vertical Scaling (Scale Up)**: Adding more power (CPU, RAM, Storage) to a single server/node.
**Horizontal Scaling (Scale Out)**: Adding more servers/nodes to the pool, distributing the load across them.

### When to use which?
- **Vertical scaling** is great for simple architectures, databases with low write/read rates, and when development speed is critical. However, it hits a hard physical hardware limit and introduces a Single Point of Failure (SPOF).
- **Horizontal scaling** is the standard for modern distributed applications. It offers near-infinite scale, high fault tolerance, and zero-downtime upgrades, but introduces massive complexity (data consistency, network latency, distributed transactions).`,
    keyPoints: [
      "Vertical scaling is bounded by hardware limits; horizontal scaling is theoretically infinite.",
      "Vertical scaling requires no architectural changes; horizontal scaling requires load balancers and stateless applications.",
      "Horizontal scaling naturally provides high availability, whereas vertical scaling creates a single point of failure.",
      "Data consistency is easy in vertical scaling (single memory space), but complex in horizontal (distributed consensus required)."
    ],
    tradeoffs: [
      {
        optionA: "Vertical Scaling",
        optionB: "Horizontal Scaling",
        comparison: "Vertical is cheap and simple initially but becomes exponentially expensive and has a hard ceiling. Horizontal requires complex engineering up front (stateless servers, sharding, consensus) but scales cost-effectively to millions of users."
      }
    ],
    visualAid: "A comparison visualization: one giant box (Vertical) vs. multiple small connected boxes behind a load balancer (Horizontal)."
  },
  {
    id: "load-balancers",
    title: "Load Balancers (L4 vs. L7)",
    category: "Network",
    summary: "Distribute incoming network traffic across a group of backend servers to optimize resource utilization and prevent overload.",
    description: `A load balancer acts as a 'traffic cop' sitting in front of your servers and routing client requests across all servers capable of fulfilling those requests.

### Layer 4 (L4) Load Balancing
L4 load balancing operates at the intermediate transport layer (TCP/UDP). It routes traffic based on network details (IP address and port numbers) without looking inside the actual data packets.
- **Pros**: Super fast (no packet inspection), consumes less memory/CPU.
- **Cons**: Cannot do smart routing (like routing based on URL path or headers), cannot decrypt TLS (SSL termination).

### Layer 7 (L7) Load Balancing
L7 load balancing operates at the application layer (HTTP/HTTPS/gRPC). It inspects the content of the message (header, cookies, URL path, query params) to make routing decisions.
- **Pros**: Smart routing (e.g., /video goes to video-servers, /images goes to image-servers), SSL termination, rate limiting, authentication, session stickiness.
- **Cons**: Slower than L4 because it must decrypt and inspect packets, more resource-intensive.`,
    keyPoints: [
      "L4 balances traffic based on IP/Port; L7 balances based on HTTP path, headers, cookies, or payload content.",
      "L7 LBs can perform SSL termination (decrypting HTTPS traffic at the load balancer level to relieve backend servers).",
      "L4 is highly performant and secure for simple load balancing; L7 is essential for microservices architectures.",
      "Common L7 load balancers: Nginx, HAProxy, AWS ALB. Common L4: IPVS, AWS NLB."
    ],
    tradeoffs: [
      {
        optionA: "Layer 4 (Transport)",
        optionB: "Layer 7 (Application)",
        comparison: "Choose L4 for raw throughput, TCP streaming, or database load balancing. Choose L7 for microservice routing, URL path-based routing, header injections, or rate-limiting at the entry point."
      }
    ],
    visualAid: "Interactive pipeline: Incoming traffic -> LB (revealing IP/Port headers or HTTP payload headers) -> split pathways to different server pools."
  },
  {
    id: "caching",
    title: "Caching Strategies & Eviction Policies",
    category: "Performance",
    summary: "Temporary high-speed data storage layer which stores a subset of data, enabling faster data access than is possible from primary storage.",
    description: `Caching is the single most effective way to speed up system performance. However, keeping cache and database consistent is a classic distributed systems challenge.

### Common Caching Strategies
1. **Cache-Aside (Lazy Loading)**: The application queries the cache. If a miss occurs, it queries the DB, stores the result in the cache, and returns it.
   - *Pros*: Cache only contains requested data; DB failures don't crash the cache.
   - *Cons*: Cache misses are slow; data can become stale if updated in the DB directly.
2. **Write-Through**: The application writes to the cache and the DB simultaneously.
   - *Pros*: Data is never stale; fast reads.
   - *Cons*: Write latency is higher (must write to both); unused data might clutter the cache.
3. **Write-Behind (Write-Back)**: The application writes to the cache, which immediately acknowledges. The cache then asynchronously writes back to the DB.
   - *Pros*: Extremely fast writes; batching writes reduces DB load.
   - *Cons*: Risk of data loss if the cache node crashes before writing to the DB.

### Cache Eviction Policies
When the cache is full, how do we free up space?
- **LRU (Least Recently Used)**: Discards the least recently accessed items first.
- **LFU (Least Frequently Used)**: Discards items that are accessed least frequently.
- **FIFO (First In, First Out)**: Discards the oldest cached items first.`,
    keyPoints: [
      "Cache-Aside is the most popular strategy for read-heavy workloads.",
      "Write-Back is ideal for write-heavy workloads (e.g., counting metrics, gaming leaderboards) but risks data loss.",
      "Time-To-Live (TTL) is crucial to avoid infinite stale data in Cache-Aside.",
      "LRU is the industry-standard eviction policy, typically implemented using a Doubly Linked List and a Hash Map."
    ],
    tradeoffs: [
      {
        optionA: "Cache-Aside",
        optionB: "Write-Through",
        comparison: "Cache-Aside is read-optimized and doesn't preload unused data. Write-Through is consistency-optimized, ensuring the cache is always fresh at the expense of write latency."
      }
    ],
    visualAid: "A flowchart diagram where client reads/writes pass through Application, checking Cache, showing Cache Miss (red) vs Cache Hit (green) flows."
  },
  {
    id: "databases",
    title: "SQL vs. NoSQL, CAP & PACELC",
    category: "Database",
    summary: "Relational vs. Non-Relational data modeling, and the mathematical trade-offs of distributed state systems.",
    description: `Choosing the right database is crucial. Relational (SQL) and Non-Relational (NoSQL) databases handle data differently.

### SQL Databases
- **Characteristics**: Structured tables, schema-enforced, ACID transactions, relational queries (JOINs).
- **Types**: MySQL, PostgreSQL, Oracle.
- **Best For**: Financial apps, user account profiles, systems requiring complex queries and strong transaction guarantees.

### NoSQL Databases
- **Characteristics**: Dynamic schemas, horizontal scaling, document/key-value/columnar/graph formats.
- **Types**: MongoDB (Document), Cassandra (Columnar), Redis (Key-Value), Neo4j (Graph).
- **Best For**: Big data, real-time analytics, rapid development, high-frequency writes/reads.

### CAP Theorem
In a distributed data store, you can only guarantee two out of these three properties:
- **Consistency**: Every read receives the most recent write or an error.
- **Availability**: Every non-failing node returns a response (without guarantee that it contains the most recent write).
- **Partition Tolerance**: The system continues to operate despite network partition (dropped/delayed messages between nodes).
*Note: In the real world, network partitions are inevitable. Thus, systems must choose between Consistency (CP) and Availability (AP) during a partition.*

### PACELC Theorem
An extension of CAP: If there is a **P**artition, trade off **A**vailability vs. **C**onsistency; **E**lse, trade off **L**atency vs. **C**onsistency.`,
    keyPoints: [
      "SQL scales vertically by default; NoSQL is built to scale horizontally.",
      "ACID transactions guarantee Atomicity, Consistency, Isolation, and Durability.",
      "BASE properties of NoSQL: Basically Available, Soft state, Eventual consistency.",
      "PACELC highlights that even under normal operations (no partitions), we must trade off speed (latency) for data accuracy (consistency)."
    ],
    tradeoffs: [
      {
        optionA: "SQL (CP/ACID)",
        optionB: "NoSQL (AP/BASE)",
        comparison: "Choose SQL for transaction safety (money transfers, orders). Choose NoSQL for scalability, high write throughput, and flexible schemas (feeds, activity logs)."
      }
    ],
    visualAid: "A Venn Diagram of CAP Theorem (Consistency, Availability, Partition Tolerance) mapping databases like PostgreSQL (RDBMS) to CA/CP and DynamoDB/Cassandra to AP."
  },
  {
    id: "message-queues",
    title: "Message Queues vs. Event Streaming",
    category: "Architecture",
    summary: "Decouple microservices, enable asynchronous processing, and handle high-throughput pipelines using Pub/Sub architectures.",
    description: `Decoupling services is critical in microservices. Message brokers allow services to communicate asynchronously.

### Message Queues (e.g., RabbitMQ)
- **Model**: Direct queueing. Messages are pushed to a queue, processed by one consumer, and then deleted.
- **Characteristics**: Smart broker, dumb consumer. Tracks message delivery states.
- **Best For**: Asynchronous task processing (e.g., sending an email, generating a PDF after checkout).

### Event Streaming (e.g., Apache Kafka)
- **Model**: Log-based pub/sub. Messages (events) are appended to a write-ahead log. Multiple consumer groups can read the log independently. Events are retained even after consumption.
- **Characteristics**: Dumb broker, smart consumer. Consumers track their own offsets (read position).
- **Best For**: High-throughput event sourcing, real-time stream processing, auditing, activity tracking.`,
    keyPoints: [
      "Message queues delete messages after acknowledgement; event streams retain events for replayability.",
      "Kafka achieves massive scale by partitioning the log across brokers, enabling parallel reads and sequential writes.",
      "RabbitMQ provides rich routing keys, exchanges, and complex delivery guarantees but scales harder.",
      "Zero-Copy optimization allows event streams like Kafka to bypass user-space memory, writing directly from disk to network socket."
    ],
    tradeoffs: [
      {
        optionA: "Message Queue (RabbitMQ)",
        optionB: "Event Streaming (Kafka)",
        comparison: "Use Message Queues for transactional task delegation where order is flexible but status tracking is critical. Use Event Streaming for raw log ingestion, auditing, real-time streaming, and replaying events."
      }
    ],
    visualAid: "Animated diagram: Publisher -> Exchange -> Queues -> Consumers vs. Publisher -> Partitioned Append-Only Log -> Consumer offsets."
  },
  {
    id: "cdn-edge",
    title: "CDN & Edge Computing",
    category: "Performance",
    summary: "Geographically distributed group of servers that work together to provide fast delivery of Internet content.",
    description: `A Content Delivery Network (CDN) stores cached static assets (HTML, JS, CSS, images, videos) at edge servers closer to users, reducing latency and database load.

### How it works:
1. Client requests 'https://example.com/logo.png'.
2. DNS routes the client to the nearest CDN Edge server (Point of Presence or PoP) using Anycast routing.
3. If the asset is cached (Cache Hit), the Edge server returns it instantly.
4. If not (Cache Miss), the CDN fetches it from the Origin Server, caches it locally, and serves it to the user.

### Edge Computing
Modern CDNs (Cloudflare Workers, Fastly Compute) allow executing lightweight Javascript/WebAssembly code directly at the Edge.
- **Use Cases**: Geolocation-based content personalization, A/B testing, header modification, token verification, simple HTML rewriting.`,
    keyPoints: [
      "CDNs reduce latency by bringing static assets physically closer to the user.",
      "Anycast routing allows multiple servers to share the same IP address, directing users to the closest node.",
      "CDN invalidation (clearing cache) is expensive and slow; leveraging content hashing (e.g., main.a8f9c.js) is preferred.",
      "Edge computing reduces backend roundtrips by handling simple application logic at the network border."
    ],
    tradeoffs: [
      {
        optionA: "Origin Serving",
        optionB: "CDN Edge Serving",
        comparison: "Origin serving requires high server capacity to handle global traffic spikes. CDN edge serving handles 95%+ of static traffic automatically, safeguarding the origin but adding caching invalidation delays."
      }
    ],
    visualAid: "A global map visualization showing clients in USA, Europe, and Asia requesting data, showing long paths to Origin vs short paths to localized Edge servers."
  },
  {
    id: "consistent-hashing",
    title: "Consistent Hashing",
    category: "Algorithms",
    summary: "Distribute data across a dynamic cluster of database sharding nodes or cache nodes without resetting the entire hash ring during membership changes.",
    description: `In traditional sharding, we use \`hash(key) % N\` to determine which server gets a record. If we add or remove a server (N changes), almost all keys will map to different servers, resulting in a catastrophic cache storm or massive DB migration.

### Consistent Hashing Solution
Consistent Hashing maps both keys and servers to a circular 360-degree space (a Hash Ring).
1. We hash the servers' IP addresses/names to find their positions on the ring.
2. To place/look up a key, we hash the key and find its position on the ring.
3. We traverse clockwise from the key's position until we encounter the first server. That server owns the key.

### Virtual Nodes (Vnodes)
To prevent hot spots (uneven distribution of keys), we map each physical server to multiple virtual positions (Vnodes) across the ring. This ensures a balanced workload.`,
    keyPoints: [
      "Consistent hashing minimizes keys shifted when servers are added or removed (only 1/N keys are remapped).",
      "Vnodes prevent 'hot spotting' by distributing server representations evenly across the hash ring.",
      "Widely used in DynamoDB, Apache Cassandra, Memcached routing, and load balancers (e.g., HAProxy)."
    ],
    tradeoffs: [
      {
        optionA: "Modulo-N Sharding",
        optionB: "Consistent Hashing",
        comparison: "Modulo-N is extremely simple to implement but terrible for dynamic scaling. Consistent Hashing requires complex ring structures and vnode metadata management but makes horizontal scaling seamless."
      }
    ],
    visualAid: "A 3D-styled circle (Ring) containing Nodes (A, B, C) and Keys (K1, K2) mapping clockwise. Hovering a node shows it disappearing, with only its keys shifting to the next clockwise node."
  },

  // ─── NEW CONCEPTS ────────────────────────────────────────────────────────────

  {
    id: "api-gateway",
    title: "API Gateway & BFF Pattern",
    category: "Architecture",
    summary: "A single entry-point that handles auth, routing, rate limiting, and request aggregation for all backend services.",
    description: `An **API Gateway** sits between clients and your backend services, acting as a reverse proxy that routes requests, enforces policies, and aggregates responses.

### What an API Gateway Does
- **Authentication & Authorization** — Validates JWT tokens or API keys before requests reach services
- **Rate Limiting** — Enforces per-client request quotas (e.g., 1000 req/min)
- **Request Routing** — Routes /users → User Service, /orders → Order Service
- **Response Aggregation** — Combines multiple service calls into one response (e.g., product page = product + inventory + reviews)
- **SSL Termination** — Decrypts HTTPS at the gateway so internal services communicate over plain HTTP

### Backend for Frontend (BFF)
A variant where each client type (mobile, web, TV) gets its own gateway optimized for its data needs. A mobile BFF returns minimal payloads; a web BFF can return richer data.

### Real-World Examples
- **AWS API Gateway** — Manages millions of API calls per second
- **Netflix Zuul** — Routes all 1000+ microservice calls with A/B test traffic splitting
- **Kong** — Open-source gateway used at LinkedIn, Nasdaq
- **Instagram GraphQL BFF** — GraphQL layer returns only fields each mobile screen needs`,
    keyPoints: [
      "Centralizes cross-cutting concerns (auth, rate limiting, logging) so each service doesn't implement them independently.",
      "A single API Gateway can become a bottleneck and SPOF — must be deployed as a horizontally scaled cluster.",
      "BFF pattern prevents mobile clients from making 10 separate service calls — gateway aggregates into 1 response.",
      "GraphQL is increasingly used as an API Gateway layer because it lets clients declare exactly what data they need."
    ],
    tradeoffs: [
      {
        optionA: "Single API Gateway",
        optionB: "BFF per Client Type",
        comparison: "A single gateway is simpler to maintain but returns one-size-fits-all responses. BFF adds operational overhead (3 gateways = 3 codebases) but lets each client get perfectly tailored responses with minimal over-fetching."
      },
      {
        optionA: "REST API Gateway",
        optionB: "GraphQL Gateway",
        comparison: "REST gateways are simple and cacheable. GraphQL gateways enable client-driven queries (no over-fetching) but server-side query complexity can be unbounded without depth/cost limits."
      }
    ],
    visualAid: "Three clients (Mobile, Web, Smart TV) each arrow into their own BFF gateway box, which then fans out into 4 microservices (User, Product, Inventory, Review). The mobile BFF returns 3 fields; the web BFF returns 12."
  },

  {
    id: "message-queues",
    title: "Message Queues & Event Streaming",
    category: "Distributed Systems",
    summary: "Async communication between services via durable, ordered message brokers — enabling decoupling, backpressure, and event-driven architectures.",
    description: `Message queues decouple producers (senders) from consumers (receivers) — the sender doesn't wait for the receiver to process the message.

### Message Queue vs Event Stream

| | Message Queue | Event Stream |
|---|---|---|
| Example | RabbitMQ, SQS | Kafka, Kinesis |
| Delivery | Each message to ONE consumer | Each event to ALL subscriber groups |
| Retention | Deleted after consumption | Retained for days/weeks (replayable) |
| Ordering | Per-queue FIFO | Per-partition ordering |
| Use Case | Task queues, job dispatch | Event sourcing, audit logs, analytics |

### Kafka Deep Dive
Kafka stores messages in **topics**, partitioned for parallelism. Each partition is an append-only log. Consumers track their position (**offset**) — if a consumer crashes and restarts, it resumes from its saved offset. This makes Kafka inherently fault-tolerant.

### Patterns
- **Fan-out**: One producer event consumed by 5 different consumer groups (analytics, email, search indexer, fraud detection, push notifications)
- **Dead Letter Queue (DLQ)**: Messages that fail processing are routed to a DLQ for human review instead of being silently dropped
- **Competing Consumers**: Multiple instances of the same service consume from one queue — auto-scales throughput`,
    keyPoints: [
      "Queues absorb traffic spikes — if email service goes down, emails queue up and are processed when it recovers (no data loss).",
      "Kafka's partitioned log model enables 1M+ messages/second with parallel consumers per partition.",
      "Message ordering is guaranteed within a partition but not across partitions — design partition keys accordingly.",
      "At-least-once delivery means consumers must be idempotent — processing the same message twice shouldn't corrupt state."
    ],
    tradeoffs: [
      {
        optionA: "RabbitMQ (AMQP)",
        optionB: "Apache Kafka",
        comparison: "RabbitMQ is simpler, better for task queues where each message is consumed once and deleted. Kafka is a distributed log optimized for high-throughput event streaming, event sourcing, and replay — but adds significant operational complexity."
      },
      {
        optionA: "Synchronous API Calls",
        optionB: "Async Message Queue",
        comparison: "Sync calls are simple but create tight coupling and cascading failures. Async queues decouple services and absorb traffic spikes but introduce eventual consistency and debugging complexity."
      }
    ],
    visualAid: "Producer service publishes an OrderPlaced event to a Kafka topic with 3 partitions. Four consumer groups (Email, Analytics, Search, Fraud) each read from all partitions at their own pace. DLQ shown for failed fraud messages."
  },

  {
    id: "cap-theorem",
    title: "CAP Theorem & PACELC",
    category: "Distributed Systems",
    summary: "In a distributed system, you can only guarantee two of three properties: Consistency, Availability, and Partition Tolerance.",
    description: `**CAP Theorem** (Brewer, 2000): A distributed system can only guarantee 2 of these 3 properties simultaneously:

- **C — Consistency**: Every read returns the most recent write (or an error). All nodes see the same data at the same time.
- **A — Availability**: Every request receives a (non-error) response, but it might not contain the most recent write.
- **P — Partition Tolerance**: The system continues operating even when network partitions cause some nodes to be unreachable.

### The Real Insight
In practice, **network partitions are inevitable** in any distributed system. Therefore, the real choice is: when a partition happens, do you prioritize **CP** (consistency over availability) or **AP** (availability over consistency)?

### CP Systems (Consistency > Availability)
When a partition occurs, the system refuses requests (returns errors) rather than return stale data. Examples: **HBase, Zookeeper, etcd, Consul**. Use when: financial transactions, inventory management, seat booking.

### AP Systems (Availability > Consistency)
When a partition occurs, the system returns its best-guess data (might be stale) rather than refuse requests. Examples: **Cassandra, DynamoDB, CouchDB**. Use when: social feeds, product catalogs, shopping carts.

### PACELC Extension
PACELC extends CAP to cover normal (non-partition) operation: even without a partition, there's a **Latency vs Consistency** tradeoff. Strongly consistent systems require coordination rounds (slow). Eventually consistent systems don't coordinate (fast but stale).`,
    keyPoints: [
      "P (Partition Tolerance) is always required in real distributed systems — you can't opt out of network partitions happening.",
      "CP databases return errors during partitions to protect consistency. AP databases return stale data to stay available.",
      "Most modern systems are tunable: Cassandra lets you set QUORUM (consistency) or ONE (availability) per query.",
      "PACELC adds the latency-consistency tradeoff for the normal (no-partition) case — often more relevant day-to-day."
    ],
    tradeoffs: [
      {
        optionA: "Strong Consistency (CP)",
        optionB: "Eventual Consistency (AP)",
        comparison: "Strong consistency guarantees you always read the latest write but requires distributed coordination (2PC or Paxos), adding latency. Eventual consistency is fast but requires handling stale reads and conflict resolution in your application."
      },
      {
        optionA: "HBase / Zookeeper (CP)",
        optionB: "Cassandra / DynamoDB (AP)",
        comparison: "CP systems are right for financial data, leader election, config management. AP systems are right for user profiles, activity feeds, shopping carts — where momentary staleness is acceptable and latency is critical."
      }
    ],
    visualAid: "Venn diagram of C, A, P with real databases placed in each intersection. CA = impossible (requires no partitions). CP = HBase, MongoDB. AP = Cassandra, CouchDB. A partition event diagram showing CP refusing vs AP returning stale data."
  },

  {
    id: "microservices",
    title: "Microservices vs Monolith",
    category: "Architecture",
    summary: "The decision between deploying one large cohesive application versus many small independently-deployable services — arguably the most consequential architectural choice.",
    description: `### The Monolith
A monolith is a single deployable unit containing all functionality. It's not inherently bad — many highly successful companies ran at massive scale on a monolith (Shopify on Rails, Stack Overflow on .NET).

**When monolith wins:**
- Team size < 20 engineers
- Early-stage product (still finding product-market fit)
- Low operational complexity budget
- Simple domain with minimal independent scaling needs

### Microservices
Microservices decompose the monolith into small, independently-deployable services, each owning its own data store.

**Benefits:**
- Independent scaling: Scale only the image service when uploads spike
- Independent deployment: Deploy checkout without deploying the entire platform
- Technology flexibility: Service A in Go, Service B in Python
- Fault isolation: Image service crash doesn't take down checkout

**Hidden costs:**
- Network calls replace in-process calls: latency increases, timeouts, retries
- Distributed tracing needed to debug a request spanning 8 services
- Eventual consistency across service boundaries
- Operational overhead multiplies by number of services

### The Strangler Fig Pattern
The safest migration from monolith → microservices: build new features as services, gradually route old monolith functionality to services until the monolith can be safely retired.`,
    keyPoints: [
      "Start with a well-structured monolith. Decompose into services only when concrete scaling or deployment bottlenecks appear.",
      "The biggest microservices cost is distributed systems complexity — network failures, partial failures, distributed tracing.",
      "Each microservice should own its data store — no shared databases, as shared DB is the monolith smell in microservices clothing.",
      "Conway's Law: your system architecture mirrors your team communication structure. Microservices work when you have independent team ownership."
    ],
    tradeoffs: [
      {
        optionA: "Monolith",
        optionB: "Microservices",
        comparison: "Monolith is faster to develop, easier to test end-to-end, and operationally simple. Microservices offer independent scaling and deployment but require distributed systems expertise, service discovery, distributed tracing, and API versioning."
      },
      {
        optionA: "Shared Database",
        optionB: "Database per Service",
        comparison: "Shared DB is simpler for cross-service queries (simple JOINs) but creates tight coupling — any DB schema change can break multiple services. DB-per-service enforces loose coupling but requires saga patterns or 2PC for cross-service transactions."
      }
    ],
    visualAid: "Left side: monolith box with User, Order, Payment, Notification all inside one process. Right side: same functions as separate services, each with own DB, communicating via REST/events. Arrow showing Strangler Fig pattern gradually replacing left with right."
  },

  {
    id: "event-driven",
    title: "Event-Driven Architecture",
    category: "Architecture",
    summary: "Systems where services communicate by emitting and reacting to events rather than direct API calls — enabling loose coupling, auditability, and temporal decoupling.",
    description: `In event-driven architecture (EDA), services don't call each other directly. Instead, when something happens, the service emits an **event** to an event bus. Other services subscribe and react asynchronously.

### Core Concepts

**Event**: An immutable fact about something that happened. "OrderPlaced with orderId=123, userId=456, total=$89.99". Events are past-tense and immutable.

**Event Broker**: The infrastructure that receives and distributes events (Kafka, EventBridge, Pub/Sub).

**Producer**: The service that emits events (Order Service emits OrderPlaced).

**Consumer**: The service that reacts to events (Email Service, Inventory Service, Analytics Service — all react to OrderPlaced).

### Event Sourcing
Instead of storing current state in a DB, store the sequence of events that led to that state. Current state = replay of all events. This gives you:
- Complete audit log
- Time-travel debugging (replay events to see what state was at any point)
- Easy integration with new consumers (replay entire history)

### CQRS (Command Query Responsibility Segregation)
Separate write models (commands) from read models (queries). Commands go through event sourcing. Queries read from pre-built projections optimized for specific queries. Useful when read and write access patterns are very different.

### When to Use EDA
✓ Audit trail required (financial, healthcare)
✓ Multiple services need to react to the same trigger
✓ Temporal decoupling needed (producer shouldn't wait for consumer)
✗ Simple CRUD apps with no async requirements
✗ Strong consistency required across actions`,
    keyPoints: [
      "Events are immutable facts about the past — they should never be updated, only appended.",
      "EDA naturally enables audit logs, event replay, and temporal decoupling between services.",
      "The main challenge is eventual consistency — downstream services may be milliseconds to seconds behind.",
      "CQRS + Event Sourcing is powerful but significantly increases system complexity — use only when genuinely needed."
    ],
    tradeoffs: [
      {
        optionA: "Direct API Calls (Request-Response)",
        optionB: "Event-Driven (Async)",
        comparison: "API calls are synchronous (easy to reason about, easy to test) but create temporal coupling — both services must be up simultaneously. Events decouple services in time but require dealing with eventual consistency and event ordering."
      },
      {
        optionA: "Traditional CRUD Database",
        optionB: "Event Sourcing",
        comparison: "CRUD is simple: current state stored directly. Event Sourcing stores the history of events — gives complete audit trail and time-travel debugging, but querying current state requires event replay and storage grows unbounded unless snapshotted."
      }
    ],
    visualAid: "Order Service emits OrderPlaced event into Kafka. Five consumer services (Email, Inventory, Analytics, Fraud, Shipping) each consume independently. Arrow showing that if Fraud service is down for 1hr, it processes the backlog when it recovers — no data lost."
  },

  {
    id: "database-indexing",
    title: "Database Indexing & Query Optimization",
    category: "Databases",
    summary: "Indexes are the most impactful single performance optimization in database systems — a missing index on a hot query can be the difference between 2ms and 20 seconds.",
    description: `An index is a separate data structure that the database maintains alongside your table data to accelerate lookups, at the cost of storage and write overhead.

### B-Tree Index (Default)
The standard index type in PostgreSQL, MySQL, and most relational DBs. Balanced binary search tree allowing O(log N) point lookups and O(log N + K) range scans. Excellent for: equality queries, range queries, ORDER BY, JOIN columns.

### How B-Tree Works
Data sorted in a tree structure. A query for user_id=12345 walks the tree in ~log2(N) steps instead of a full table scan. For 1M rows, that's 20 comparisons vs 1,000,000.

### LSM-Tree Index (Write-Optimized)
Used in Cassandra, LevelDB, RocksDB. Writes go to an in-memory buffer (MemTable), periodically flushed to sorted files on disk (SSTables). Reads merge across levels. Excellent for write-heavy workloads. Used in: Cassandra, HBase, ScyllaDB.

### Composite Indexes
An index on (user_id, created_at) can serve queries filtering on user_id alone OR user_id + created_at — but NOT created_at alone. Rule: leftmost prefix must match.

### Covering Index
An index that contains all columns needed by a query — no table lookup needed. The query is entirely satisfied from the index.

### When to Add an Index
✓ Columns in WHERE, JOIN ON, ORDER BY clauses with high cardinality
✓ Foreign keys (often forgotten — causes full scans on JOINs)
✗ Columns with low cardinality (boolean, gender — query optimizer skips the index)
✗ Tables with very high write:read ratio (index maintenance overhead)`,
    keyPoints: [
      "A full table scan on a 100M row table with no index can take 20+ seconds; the same query with a B-tree index runs in milliseconds.",
      "Every index you add speeds up reads but slows writes (index must be maintained on INSERT/UPDATE/DELETE).",
      "Composite index column order matters: leftmost prefix rule — index (A,B,C) helps queries on A, A+B, A+B+C but not B alone.",
      "EXPLAIN ANALYZE (PostgreSQL) or EXPLAIN (MySQL) shows the query plan — use it to find missing indexes and full table scans."
    ],
    tradeoffs: [
      {
        optionA: "B-Tree Index",
        optionB: "LSM-Tree Index",
        comparison: "B-Tree is read-optimized — excellent for range queries and point lookups. LSM-Tree is write-optimized — sequential writes to MemTable, then compaction. Use B-Tree for OLTP read-heavy workloads; LSM for write-heavy time-series and log data."
      },
      {
        optionA: "More Indexes (Fewer Scans)",
        optionB: "Fewer Indexes (Faster Writes)",
        comparison: "Adding indexes accelerates reads but every index adds overhead to every write operation (INSERT/UPDATE/DELETE must update all indexes). High-write tables should have only essential indexes; read-heavy tables can afford more."
      }
    ],
    visualAid: "Side-by-side visualization: left shows full table scan across 1M rows for user_id=500K (orange highlight crawling through all rows). Right shows B-tree index — 3 node comparisons, immediately jumping to row 500K (green path). Write overhead diagram showing index update on INSERT."
  },

  {
    id: "cdn",
    title: "Content Delivery Networks (CDN)",
    category: "Networking",
    summary: "Distributed networks of edge servers that cache static and dynamic content close to users — reducing latency from hundreds of milliseconds to single digits.",
    description: `A CDN is a geographically distributed network of servers (**Points of Presence / PoPs**) that cache copies of your content close to users.

### How CDN Works
1. User in Tokyo requests image.example.com/photo.jpg
2. DNS resolves to nearest CDN PoP (Singapore, 30ms away vs 180ms to US origin)
3. CDN PoP serves cached image in 15ms
4. On cache miss: CDN fetches from origin, caches it, serves to user

### What to Cache
✓ Static assets: images, CSS, JS, fonts (long TTL — days/weeks)
✓ API responses that change slowly (product catalog, prices — 60s TTL)
✓ Video segments (YouTube, Netflix — 95% served from CDN)
✗ User-specific data (cart, account info)
✗ Frequently-changing data (real-time prices, live scores)

### Cache Invalidation
When origin content changes, CDN must be told to evict old version. Strategies:
- **TTL-based**: Wait for TTL to expire (simple but content is stale until then)
- **Purge API**: Explicitly tell CDN to delete a URL from cache (fast but requires CDN API calls on publish)
- **Versioned URLs**: image-v2.jpg is a new URL, so CDN never serves stale (forever cache headers)

### CDN for Dynamic Content
Modern CDNs (Cloudflare, Fastly) can cache personalized responses at edge using edge computing (Cloudflare Workers, Lambda@Edge) — running compute 5ms from users.

### Netflix Open Connect
Netflix embeds their own CDN appliances inside ISP data centers. Result: 95%+ of traffic served without touching Netflix's AWS infrastructure, saving ~$100M+/year in egress costs.`,
    keyPoints: [
      "CDNs reduce latency by serving from PoPs 5–50ms from users vs 100–300ms to origin data centers.",
      "Cache-Control headers (max-age, s-maxage, stale-while-revalidate) are the primary mechanism to control CDN caching behavior.",
      "CDN reduces origin server load — during traffic spikes, 95%+ of requests are served from cache without hitting your servers.",
      "Versioned asset URLs (bundle.abc123.js) allow infinite browser and CDN cache TTLs — new deploys get new hash, not cached version."
    ],
    tradeoffs: [
      {
        optionA: "Long CDN Cache TTL",
        optionB: "Short CDN Cache TTL",
        comparison: "Long TTL means high cache hit rate (low origin load, low latency) but stale content is served after updates until TTL expires. Short TTL ensures freshness but more origin requests, defeating the CDN purpose. Solution: versioned URLs for static assets + explicit purge for dynamic content."
      },
      {
        optionA: "Third-Party CDN (Cloudflare, Fastly)",
        optionB: "Own CDN (Netflix Open Connect)",
        comparison: "Third-party CDNs are fast to set up, globally distributed, and managed. Own CDN makes sense only at Netflix/Google scale where egress costs dwarf the engineering investment to build it."
      }
    ],
    visualAid: "World map with PoP nodes in 8 cities. User in Tokyo has 15ms path to Singapore PoP vs 180ms to US origin. On cache miss, a dotted line shows the PoP fetching from origin (one time) and caching for subsequent requests (solid green line)."
  },

  {
    id: "rate-limiting-design",
    title: "Rate Limiting Algorithms",
    category: "Distributed Systems",
    summary: "Mechanisms to control how frequently clients can call an API — protecting services from abuse, DDoS, and accidental thundering herd problems.",
    description: `Rate limiting ensures a single client can't overwhelm your service by limiting how many requests they can make in a time window.

### Fixed Window Counter
Count requests per user per time window (e.g., 100 requests per minute). Reset counter at window boundary.

**Problem**: A user can make 100 requests at 00:59 and 100 more at 01:00, bursting 200 requests in 2 seconds.

### Sliding Window Log
Store timestamp of every request in a sorted set. On new request: remove entries older than window, count remaining entries. If count < limit, allow.

**Cost**: O(1) per request but O(N) memory per user (stores all timestamps in window).

### Sliding Window Counter (Hybrid)
Combine fixed windows with a weighted count from the previous window.
Formula: \`current_window_count + previous_window_count × (1 - elapsed_pct)\`

**Best of both**: Low memory (2 counters per user) + smooths boundary bursts.

### Token Bucket
User has a "bucket" of tokens. Each request consumes one token. Tokens refill at a constant rate (10/second). Allows bursting up to bucket capacity then throttles.
Used by: AWS API Gateway, Stripe.

### Leaky Bucket
Queue requests at a fixed processing rate regardless of burst. Smooths out traffic spikes completely.
Used by: Network traffic shaping, some API gateways.

### Distributed Rate Limiting
With multiple API servers, per-server counters let users exceed limits across servers. Solutions:
- **Redis atomic INCR**: Central Redis counter, atomic increment per request
- **Sticky sessions**: Route each user to same server (not fault-tolerant)
- **Approximate with local + global sync**: Local counters sync to Redis every 100ms (eventual consistency, acceptable for rate limiting)`,
    keyPoints: [
      "Token bucket allows controlled bursting — ideal for APIs where users occasionally need brief spikes (batch uploads).",
      "Sliding window prevents boundary attacks that fixed window allows.",
      "Distributed rate limiting requires a shared counter store (Redis) — atomic INCR + EXPIRE is the standard pattern.",
      "Rate limit by user ID for authenticated APIs; by IP for unauthenticated — but beware shared IPs (corporate NAT, Cloudflare)."
    ],
    tradeoffs: [
      {
        optionA: "Token Bucket",
        optionB: "Sliding Window Counter",
        comparison: "Token bucket allows controlled bursting (good for upload APIs) but doesn't smooth traffic completely. Sliding window prevents boundary bursting with low memory cost but doesn't allow intentional bursting."
      },
      {
        optionA: "Per-Server Local Counter",
        optionB: "Centralized Redis Counter",
        comparison: "Local counters are fast (no network hop) but inaccurate with multiple servers — users can exceed limits. Redis centralized counter is accurate but adds ~1ms latency per request and creates a dependency on Redis availability."
      }
    ],
    visualAid: "Token bucket diagram: bucket fills at 10 tokens/second (constant drip), requests consume tokens, bucket size = 100 (max burst). Timeline showing burst of 80 requests handled instantly, then throttling kicks in. Contrast with leaky bucket showing smooth output regardless of bursty input."
  },
];
