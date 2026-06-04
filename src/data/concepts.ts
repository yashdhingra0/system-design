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
  }
];
