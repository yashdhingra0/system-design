export interface RevisionCard {
  id: string;
  title: string;
  category: 'Checklist' | 'Scale Rules' | 'Tradeoffs' | 'Patterns';
  description: string;
  items: {
    title: string;
    content: string;
    details?: string;
  }[];
}

export const revisionNotes: RevisionCard[] = [
  {
    id: "pre-interview-checklist",
    title: "2-Hour Pre-Interview Checklist",
    category: "Checklist",
    description: "Crucial mental resets and frameworks to run through in the hours leading up to your interview.",
    items: [
      {
        title: "1. Clarify, Clarify, Clarify! (First 5 mins)",
        content: "Never jump to a database or diagram. Ask: Who are the users? What is the DAU? Are there write/read constraints? What features are out of scope?"
      },
      {
        title: "2. Draft a Checklist on the Board",
        content: "Write down the sections you will cover: Functional, Non-Functional, Estimations, API Design, Data Model, High Level Design, Scaling & Deep Dive."
      },
      {
        title: "3. Speak Out Loud Non-Stop",
        content: "If you stop talking, the interviewer cannot grade your thought process. Treat it as a pair programming/consultant review."
      },
      {
        title: "4. State Trade-offs Explicitly",
        content: "Don't just say 'I will use Kafka'. Say: 'I am choosing Kafka because we need append-only log replayability. A standard queue like RabbitMQ would discard messages after reading, preventing multi-consumer analytics.'"
      }
    ]
  },
  {
    id: "scale-rules",
    title: "Scale Rules of Thumb",
    category: "Scale Rules",
    description: "Standard calculations and performance limits of hardware and software components.",
    items: [
      {
        title: "Application Servers",
        content: "A single CPU-core app server can handle ~1,000 to 5,000 QPS depending on I/O. Scale horizontally behind a load balancer once traffic exceeds this."
      },
      {
        title: "Relational Databases (e.g. PostgreSQL)",
        content: "A standard single-node relational DB can comfortably handle ~1,000 writes/sec and ~10,000 reads/sec. Beyond this, look at read replicas, caching, and sharding."
      },
      {
        title: "Distributed Caches (e.g. Redis)",
        content: "A single Redis instance can easily process 100,000+ QPS of simple key-value lookups due to local RAM access and event-driven single-threaded execution."
      },
      {
        title: "Estimations Constants",
        content: "1 Million requests/day = ~12 QPS. 100 Million requests/day = ~1,160 QPS. 1 Billion requests/day = ~11,600 QPS. Always round QPS for quick mental math!"
      }
    ]
  },
  {
    id: "quick-tradeoffs",
    title: "Key Distributed Trade-offs",
    category: "Tradeoffs",
    description: "Quick-fire comparison grids for making architectural choices in interviews.",
    items: [
      {
        title: "SQL vs NoSQL",
        content: "Choose SQL for transaction safety (ACID), dynamic query filters, and relational mappings. Choose NoSQL (Cassandra, DynamoDB) for write-heavy key-value streams, horizontal write scaling, and flexible document schemas."
      },
      {
        title: "WebSockets vs Server-Sent Events (SSE)",
        content: "WebSockets provides full-duplex bi-directional communication (chat, gaming). SSE is uni-directional server-to-client stream over standard HTTP (news feeds, notification logs) and is much lighter."
      },
      {
        title: "Pull vs Push Queue Consumers",
        content: "Pull (Kafka) lets workers consume at their own pace, preventing overload but introducing slight polling latency. Push (RabbitMQ) pushes messages immediately to workers for low latency, but can crash slow workers if buffer flows."
      }
    ]
  },
  {
    id: "design-patterns",
    title: "High-Impact Design Patterns",
    category: "Patterns",
    description: "Standard architectural templates that solve classic distributed systems challenges.",
    items: [
      {
        title: "Circuit Breaker",
        content: "Prevents cascading failures. If an external service call fails repeatedly, the breaker trips open, instantly returning local fallback responses rather than holding network threads."
      },
      {
        title: "Write-Ahead Log (WAL)",
        content: "Sequence of modifications written sequentially to disk before updating db tables. Ensures state can be restored if database crashes before RAM flushing."
      },
      {
        title: "Consistent Hashing",
        content: "Maps servers and data keys to a circular ring space, ensuring that when nodes are added or removed, only 1/N keys shift clockwise, preventing cache stampedes."
      }
    ]
  }
];
