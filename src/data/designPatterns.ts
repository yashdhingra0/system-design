export interface DesignPattern {
  id: string;
  name: string;
  category: 'Architectural' | 'Creational' | 'Structural' | 'Behavioral'
           | 'Scaling' | 'Caching' | 'Messaging' | 'Reliability' | 'Microservices';
  emoji: string;
  pickItWhen?: string;   // One-line cheatsheet trigger
  mainTradeoff?: string; // One-line cheatsheet tradeoff
  intent: string;
  problem: string;
  solution: string;
  whenToUse: string[];
  pros: string[];
  cons: string[];
  realWorldExamples: string[];
  codeExample: string;
  relatedPatterns: string[];
}

export const designPatterns: DesignPattern[] = [
  // ===== ARCHITECTURAL (HLD) =====
  {
    id: "circuit-breaker",
    name: "Circuit Breaker",
    category: "Reliability",
    emoji: "⚡",
    pickItWhen: "Dependency failures cascade",
    mainTradeoff: "Recovery tuning required",
    intent: "Prevent cascading failures by short-circuiting calls to a failing downstream service.",
    problem: "Service A calls Service B. If B is slow or down, A's threads pile up waiting, eventually crashing A too — a cascading failure that takes down the entire call chain.",
    solution: "Wrap the call in a state machine with three states: CLOSED (normal), OPEN (failing fast, reject immediately), HALF-OPEN (probe with one test request). Track consecutive failures; open the circuit when a threshold is exceeded. Auto-retry after a cool-down window.",
    whenToUse: [
      "Microservice architectures with synchronous inter-service calls",
      "Any integration with a third-party API that may degrade",
      "Services calling slow or unreliable databases/caches",
      "When you need to fail fast rather than queue indefinitely"
    ],
    pros: [
      "Prevents cascading failure chains across services",
      "Gives failing services time to recover without constant bombardment",
      "Enables fast-fail with graceful degradation",
      "Self-healing: HALF-OPEN state probes recovery automatically"
    ],
    cons: [
      "Adds latency tracking and state management overhead",
      "Threshold tuning is tricky — too sensitive causes false opens",
      "Requires a fallback strategy (cached data, default response)",
      "Distributed circuit state needs shared store (Redis) across instances"
    ],
    realWorldExamples: [
      "Netflix Hystrix / Resilience4j — Java libraries wrapping downstream calls",
      "AWS SDK has built-in retry + circuit breaking for AWS service calls",
      "Istio service mesh provides circuit breaking at the network proxy layer",
      "Envoy proxy implements circuit breaking via outlier detection"
    ],
    codeExample: `enum State { CLOSED, OPEN, HALF_OPEN }

class CircuitBreaker {
  private state = State.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(
    private readonly threshold = 5,
    private readonly cooldownMs = 30_000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === State.OPEN) {
      if (Date.now() - this.lastFailureTime > this.cooldownMs) {
        this.state = State.HALF_OPEN; // Probe
      } else {
        throw new Error('Circuit OPEN — failing fast');
      }
    }
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = State.CLOSED;
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold || this.state === State.HALF_OPEN) {
      this.state = State.OPEN;
    }
  }
}`,
    relatedPatterns: ["bulkhead", "retry-pattern", "saga"]
  },

  {
    id: "saga",
    name: "Saga Pattern",
    category: "Microservices",
    emoji: "🔗",
    pickItWhen: "Distributed business workflows",
    mainTradeoff: "Eventual consistency",
    intent: "Manage distributed transactions across multiple microservices without a global two-phase commit (2PC).",
    problem: "A single business operation (e.g., place order) spans multiple services (Order, Payment, Inventory). If Payment fails after Order is created, you need a rollback — but you can't do 2PC across independent databases without tight coupling.",
    solution: "Break the transaction into a sequence of local transactions, each publishing an event/message. If any step fails, compensating transactions undo prior steps. Two styles: Choreography (event-driven, no central orchestrator) and Orchestration (saga orchestrator drives the flow).",
    whenToUse: [
      "Distributed transactions spanning multiple services or databases",
      "E-commerce order flows (order → payment → inventory → shipping)",
      "Anywhere 2PC is too slow or couples services too tightly",
      "Long-running business processes with well-defined compensation logic"
    ],
    pros: [
      "No distributed lock — each service owns its own database",
      "Services remain loosely coupled",
      "High availability — no global coordinator that can SPOF",
      "Works naturally with event-driven / async architectures"
    ],
    cons: [
      "Eventual consistency — transient intermediate states are visible",
      "Compensating transactions are complex to write and test",
      "Orchestration sagas add a new service (orchestrator) that can SPOF",
      "Debugging distributed failures requires good tracing (correlation IDs)"
    ],
    realWorldExamples: [
      "Uber's trip lifecycle (request → dispatch → payment) is a saga",
      "Amazon order fulfillment pipeline across Order/Payment/Warehouse services",
      "Stripe Radar: fraud check → charge → ledger update sequence",
      "Temporal.io, AWS Step Functions — popular saga orchestration frameworks"
    ],
    codeExample: `// Orchestration Saga for Order Placement
class OrderSagaOrchestrator {
  async execute(order: Order): Promise<void> {
    const steps = [
      { execute: () => this.createOrder(order),       compensate: () => this.cancelOrder(order.id) },
      { execute: () => this.chargePayment(order),     compensate: () => this.refundPayment(order.id) },
      { execute: () => this.reserveInventory(order),  compensate: () => this.releaseInventory(order.id) },
      { execute: () => this.scheduleShipping(order),  compensate: () => this.cancelShipping(order.id) },
    ];

    const completed: number[] = [];
    for (let i = 0; i < steps.length; i++) {
      try {
        await steps[i].execute();
        completed.push(i);
      } catch (err) {
        // Compensate in reverse order
        for (const j of completed.reverse()) {
          await steps[j].compensate().catch(console.error);
        }
        throw new Error(\`Saga failed at step \${i}: \${err}\`);
      }
    }
  }
}`,
    relatedPatterns: ["circuit-breaker", "event-sourcing", "cqrs"]
  },

  {
    id: "cqrs",
    name: "CQRS",
    category: "Microservices",
    emoji: "📊",
    pickItWhen: "Read and write workloads differ",
    mainTradeoff: "More components to maintain",
    intent: "Separate the read (Query) model from the write (Command) model to scale and optimize them independently.",
    problem: "A single data model forces you to optimize for both heavy writes and complex reads simultaneously. Read queries with many joins conflict with write-optimized schemas. Both sides contend for the same database resources.",
    solution: "Split into Command side (handles writes, emits events, uses a normalized write store) and Query side (handles reads, uses a denormalized read store optimized for specific query patterns). The query store is updated asynchronously from command events.",
    whenToUse: [
      "Read/write ratio is very asymmetric (e.g., 100:1 reads)",
      "Query requirements differ drastically from write schema (complex joins)",
      "Reporting and analytics queries slow down transactional writes",
      "Often paired with Event Sourcing to rebuild read models"
    ],
    pros: [
      "Read and write sides scale independently",
      "Read models can be denormalized per query shape for maximum speed",
      "Multiple read projections from the same event stream",
      "Simpler query side — no complex joins, just pre-computed views"
    ],
    cons: [
      "Eventual consistency between write and read stores",
      "Significantly increases system complexity",
      "Synchronization bugs between write events and read projections",
      "Overkill for simple CRUD applications"
    ],
    realWorldExamples: [
      "LinkedIn: separate write DB (MySQL) and read search index (Elasticsearch)",
      "Twitter: write tweets to Cassandra, project timelines to Redis read cache",
      "e-commerce dashboards: separate order DB from analytics read store",
      "Event-sourced systems like Axon Framework naturally implement CQRS"
    ],
    codeExample: `// Command side — write model
class CreateOrderCommand {
  constructor(public readonly orderId: string, public readonly items: Item[]) {}
}

class OrderCommandHandler {
  async handle(cmd: CreateOrderCommand): Promise<void> {
    const order = Order.create(cmd.orderId, cmd.items);
    await this.orderRepo.save(order);
    await this.eventBus.publish(new OrderCreatedEvent(order)); // feeds read side
  }
}

// Query side — denormalized read model
interface OrderSummaryView {
  orderId: string;
  customerName: string;
  totalAmount: number;
  itemCount: number;
  status: string;
}

class OrderQueryHandler {
  async getOrderSummary(orderId: string): Promise<OrderSummaryView> {
    // Direct lookup on pre-computed view table — no joins
    return this.readDb.findOrderSummary(orderId);
  }
}`,
    relatedPatterns: ["event-sourcing", "saga"]
  },

  {
    id: "event-sourcing",
    name: "Event Sourcing",
    category: "Microservices",
    emoji: "📜",
    pickItWhen: "Need complete audit/history",
    mainTradeoff: "Complex event replay",
    intent: "Store state as an immutable append-only log of events rather than the current state snapshot.",
    problem: "Traditional databases store only the current state. You lose the history of how you got there. Auditing, debugging, and replaying past states become impossible. Concurrent updates cause lost updates.",
    solution: "Every change to application state is stored as an immutable event (OrderPlaced, PaymentReceived, ItemShipped). Current state is derived by replaying events from the beginning (or from a snapshot). The event log is the source of truth.",
    whenToUse: [
      "Audit log is a business requirement (finance, healthcare, compliance)",
      "Time-travel debugging — reproduce exact state at any point in time",
      "Paired with CQRS to project multiple read models from events",
      "Systems requiring event-driven integrations (other services consume events)"
    ],
    pros: [
      "Complete audit trail with no extra effort — the log IS the database",
      "Temporal queries: replay to any point in time",
      "Easy event-driven integrations — publish events to other systems",
      "No lost updates — all changes are recorded, not overwritten"
    ],
    cons: [
      "Querying current state requires replaying events (use snapshots to optimize)",
      "Event schema evolution is hard — old events must remain parseable",
      "Large event stores grow indefinitely (compaction/snapshotting needed)",
      "Steep learning curve; unfamiliar to most developers"
    ],
    realWorldExamples: [
      "Apache Kafka as an event log — core infrastructure at LinkedIn, Uber",
      "AWS EventBridge sourcing all infrastructure change events",
      "Bank ledgers have always been event-sourced (each transaction is an event)",
      "Git is event-sourced — commits are immutable events, state is derived"
    ],
    codeExample: `interface DomainEvent { type: string; occurredAt: Date; }

class OrderPlacedEvent implements DomainEvent {
  type = 'ORDER_PLACED';
  occurredAt = new Date();
  constructor(public orderId: string, public items: Item[], public total: number) {}
}

class OrderAggregate {
  private events: DomainEvent[] = [];
  status: string = 'PENDING';
  total: number = 0;

  // Rehydrate from stored events
  static rehydrate(events: DomainEvent[]): OrderAggregate {
    const agg = new OrderAggregate();
    events.forEach(e => agg.apply(e));
    return agg;
  }

  placeOrder(items: Item[], total: number): void {
    this.apply(new OrderPlacedEvent(this.id, items, total));
  }

  private apply(event: DomainEvent): void {
    this.events.push(event); // append to uncommitted log
    if (event.type === 'ORDER_PLACED') {
      this.status = 'PLACED';
      this.total = (event as OrderPlacedEvent).total;
    }
    // ... handle other event types
  }
}`,
    relatedPatterns: ["cqrs", "saga"]
  },

  {
    id: "strangler-fig",
    name: "Strangler Fig",
    category: "Architectural",
    emoji: "🌿",
    intent: "Incrementally migrate a legacy monolith to microservices by routing new traffic to new services while the old system still runs.",
    problem: "Big-bang rewrites of monoliths are high-risk and rarely succeed. You can't take the entire system offline. But you need to modernize without disrupting live traffic.",
    solution: "Place a façade/proxy in front of the monolith. Gradually extract features into new microservices. Route requests for migrated features to the new service; everything else goes to the monolith. The monolith shrinks (is 'strangled') over time until it can be retired.",
    whenToUse: [
      "Migrating a legacy monolith to microservices incrementally",
      "Rewriting a legacy system while keeping it live and serving traffic",
      "Adding new capabilities alongside a system you can't easily modify",
      "Any situation where you need to replace something without a big-bang cutover"
    ],
    pros: [
      "Zero-downtime migration — production never stops serving",
      "Incrementally deliverable — each extracted service provides immediate value",
      "Reduces risk dramatically compared to big-bang rewrite",
      "Rollback is easy — just re-route traffic to monolith if new service fails"
    ],
    cons: [
      "Temporary increase in operational complexity (running two systems)",
      "Facade/proxy must be maintained throughout migration",
      "Data duplication during transition period",
      "Migration can drag on for years if not disciplined"
    ],
    realWorldExamples: [
      "Amazon decomposed their bookstore monolith into microservices over many years",
      "Netflix migration from data-center Java monolith to AWS microservices",
      "Shopify gradually extracted billing and storefront services from their Rails monolith",
      "Martin Fowler coined the pattern, observing how strangler fig trees grow"
    ],
    codeExample: `// API Gateway / Proxy routing to old monolith vs new services
class StranglerFigProxy {
  private readonly migratedRoutes = new Map<string, string>([
    ['/api/payments',   'http://new-payment-service/'],
    ['/api/inventory',  'http://new-inventory-service/'],
    // Everything else still routes to the legacy monolith
  ]);

  async route(req: Request): Promise<Response> {
    for (const [prefix, target] of this.migratedRoutes) {
      if (req.path.startsWith(prefix)) {
        console.log(\`Routing \${req.path} to new service: \${target}\`);
        return this.forwardTo(target, req);
      }
    }
    // Fallback to monolith
    console.log(\`Routing \${req.path} to legacy monolith\`);
    return this.forwardTo('http://legacy-monolith/', req);
  }
}`,
    relatedPatterns: ["circuit-breaker", "api-gateway"]
  },

  {
    id: "bulkhead",
    name: "Bulkhead",
    category: "Reliability",
    emoji: "🚢",
    pickItWhen: "Isolate failures between services",
    mainTradeoff: "Resource fragmentation",
    intent: "Isolate critical resources into separate pools so that a failure in one pool cannot exhaust resources needed by others.",
    problem: "A thread pool is shared across all downstream calls. One slow service exhausts all threads, blocking every other service in the system — a noisy-neighbor problem.",
    solution: "Named after bulkhead compartments in ship hulls (which contain flooding to one section). Assign separate, limited resource pools (threads, connections, semaphores) to different downstream calls. A saturated pool rejects excess requests early rather than sharing the damage.",
    whenToUse: [
      "High-risk integration with an unreliable third-party service",
      "Preventing a non-critical feature (recommendations) from taking down core flows (checkout)",
      "Multi-tenant SaaS: isolate tenant resource pools so one tenant can't starve others",
      "Protecting critical internal services from traffic caused by lower-priority services"
    ],
    pros: [
      "Blast radius of failures is limited to one pool",
      "Critical services remain operational even when non-critical ones are degraded",
      "Natural queueing model: overloaded pool rejects, other pools unaffected"
    ],
    cons: [
      "Harder to tune — must size each pool correctly",
      "May lead to resource under-utilization (idle threads in one pool can't help another)",
      "More complex configuration than a single shared pool"
    ],
    realWorldExamples: [
      "Netflix Hystrix uses thread pool bulkheads per downstream service",
      "AWS Lambda function concurrency limits are a bulkhead per function",
      "Database connection pools per microservice act as bulkheads",
      "Istio/Envoy destination rule connection pool limits implement bulkheads"
    ],
    codeExample: `class BulkheadExecutor {
  private readonly pools = new Map<string, Semaphore>();

  constructor(private config: Record<string, number>) {
    for (const [service, limit] of Object.entries(config)) {
      this.pools.set(service, new Semaphore(limit));
    }
  }

  async execute<T>(serviceId: string, fn: () => Promise<T>): Promise<T> {
    const semaphore = this.pools.get(serviceId);
    if (!semaphore) throw new Error(\`Unknown service: \${serviceId}\`);

    if (!semaphore.tryAcquire()) {
      throw new Error(\`Bulkhead full for \${serviceId} — request rejected\`);
    }
    try {
      return await fn();
    } finally {
      semaphore.release();
    }
  }
}

// Usage: isolate payment service from recommendations service
const executor = new BulkheadExecutor({
  'payment-service':         10,  // critical — 10 concurrent max
  'recommendation-service':   3,  // non-critical — only 3 concurrent
});`,
    relatedPatterns: ["circuit-breaker"]
  },

  {
    id: "sidecar",
    name: "Sidecar",
    category: "Microservices",
    emoji: "🏍️",
    pickItWhen: "Shared service functionality across polyglot services",
    mainTradeoff: "Extra resource usage per pod",
    intent: "Deploy a helper container alongside a primary service container to provide cross-cutting capabilities without changing the service.",
    problem: "Every microservice needs logging, metrics, distributed tracing, mTLS, and service discovery. Implementing these in each service creates duplicated code in potentially different languages and makes upgrades painful.",
    solution: "Deploy a secondary 'sidecar' container in the same pod/VM as the primary service. The sidecar intercepts network traffic or reads local files to provide cross-cutting concerns transparently. The service code has zero knowledge of these capabilities.",
    whenToUse: [
      "Service mesh implementations (Istio, Linkerd — both use sidecar proxies)",
      "Adding observability (logs, metrics, traces) to legacy services you can't modify",
      "Handling TLS termination and certificate rotation without touching application code",
      "Providing consistent retry, circuit-breaking, and rate-limiting across polyglot services"
    ],
    pros: [
      "Decoupled from the primary service — update the sidecar independently",
      "Language-agnostic: works alongside Node.js, Python, Go, Java equally",
      "Centralizes operational concerns (no per-service implementation)"
    ],
    cons: [
      "Additional memory/CPU overhead per pod",
      "Increases deployment complexity (multi-container pods)",
      "Not suitable for serverless (no persistent container to attach to)"
    ],
    realWorldExamples: [
      "Istio service mesh: Envoy proxy injected as sidecar into every Kubernetes pod",
      "AWS App Mesh: Envoy sidecar for all ECS/EKS workloads",
      "Datadog Agent deployed as sidecar to collect container metrics",
      "Vault Agent Sidecar Injector for automatic secret injection"
    ],
    codeExample: `# Kubernetes pod spec — primary app + sidecar in the same pod
apiVersion: v1
kind: Pod
metadata:
  name: my-service
  annotations:
    sidecar.istio.io/inject: "true"  # auto-inject Envoy sidecar
spec:
  containers:
  - name: my-app              # Primary service container
    image: my-service:1.0
    ports:
    - containerPort: 8080
  - name: log-shipper          # Sidecar: tail logs → Elasticsearch
    image: fluent/fluentd:v1.16
    volumeMounts:
    - name: app-logs
      mountPath: /var/log/app
  - name: metrics-exporter     # Sidecar: expose Prometheus metrics
    image: prom/node-exporter:latest
    ports:
    - containerPort: 9100`,
    relatedPatterns: ["strangler-fig", "bulkhead"]
  },

  // ===== CREATIONAL =====
  {
    id: "singleton",
    name: "Singleton",
    category: "Creational",
    emoji: "🔒",
    intent: "Ensure a class has only one instance and provide a global access point to it.",
    problem: "Multiple parts of a system need access to a shared resource (DB connection pool, logger, config) but creating multiple instances wastes resources or causes inconsistency.",
    solution: "Make the constructor private. Provide a static getInstance() method that creates the instance on first call and returns the same instance on subsequent calls. Use double-checked locking for thread safety.",
    whenToUse: [
      "Connection pools (database, HTTP clients) — expensive to create",
      "Configuration manager that reads config file once",
      "Logger instances shared across the entire application",
      "In-memory caches or registries (service locators)"
    ],
    pros: [
      "Controlled access to a single shared resource",
      "Lazy initialization — created only when first needed",
      "Single point to manage the shared resource's lifecycle"
    ],
    cons: [
      "Global state makes testing hard — singleton bleeds state across tests",
      "Violates Single Responsibility Principle (manages both logic and lifecycle)",
      "In multi-threaded systems, requires careful locking or thread-local patterns",
      "Can mask poor dependency injection design"
    ],
    realWorldExamples: [
      "Node.js module cache — require() returns the same object every time",
      "Java's Runtime.getRuntime() — one JVM runtime instance",
      "Redux store — single source of truth for React app state",
      "Database connection pools in ORMs (Sequelize, TypeORM)"
    ],
    codeExample: `class DatabasePool {
  private static instance: DatabasePool | null = null;
  private connections: Connection[] = [];

  private constructor(private maxConnections = 10) {
    // private — prevents external instantiation
    this.initialize();
  }

  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  private initialize() {
    for (let i = 0; i < this.maxConnections; i++) {
      this.connections.push(new Connection());
    }
  }

  acquire(): Connection { return this.connections.pop()!; }
  release(conn: Connection) { this.connections.push(conn); }
}

// Usage
const pool1 = DatabasePool.getInstance();
const pool2 = DatabasePool.getInstance();
console.log(pool1 === pool2); // true — same instance`,
    relatedPatterns: ["factory", "proxy"]
  },

  {
    id: "factory",
    name: "Factory Method",
    category: "Creational",
    emoji: "🏭",
    intent: "Define an interface for creating objects, but let subclasses (or a config value) decide which class to instantiate.",
    problem: "Code that creates objects directly (new PayPalPayment(), new StripePayment()) is tightly coupled to concrete classes, making it impossible to switch implementations without changing the calling code.",
    solution: "Replace direct constructors with a factory method. Callers ask the factory for an object by type/config; the factory decides which concrete class to instantiate. New types can be added without touching client code.",
    whenToUse: [
      "The exact type of object to create is determined at runtime (e.g., from config)",
      "You want to encapsulate object creation logic in one place",
      "Plugin or strategy selection: pick a payment provider, storage backend, or logger by name",
      "When subclasses should control which objects their parent creates"
    ],
    pros: [
      "Decouples creation from usage — client code depends on abstractions",
      "Open/Closed Principle: add new types without modifying factory callers",
      "Centralizes object creation, making it easy to swap implementations"
    ],
    cons: [
      "Can lead to large factory classes if many types are supported",
      "Requires a parallel hierarchy of creator classes in some implementations",
      "Adds abstraction overhead for simple cases"
    ],
    realWorldExamples: [
      "JDBC's DriverManager.getConnection() — returns different DB drivers",
      "React's createElement() — factory for different component types",
      "Logger frameworks: LoggerFactory.getLogger() returns the configured impl",
      "Cloud SDK clients: S3ClientFactory, DynamoDBClientFactory"
    ],
    codeExample: `// Abstract product
interface PaymentProcessor {
  charge(amount: number, currency: string): Promise<Receipt>;
}

// Concrete products
class StripeProcessor implements PaymentProcessor {
  async charge(amount: number, currency: string) { /* Stripe API */ }
}
class PayPalProcessor implements PaymentProcessor {
  async charge(amount: number, currency: string) { /* PayPal API */ }
}
class CryptoProcessor implements PaymentProcessor {
  async charge(amount: number, currency: string) { /* Crypto API */ }
}

// Factory
class PaymentProcessorFactory {
  static create(provider: string): PaymentProcessor {
    switch (provider) {
      case 'stripe':  return new StripeProcessor();
      case 'paypal':  return new PayPalProcessor();
      case 'crypto':  return new CryptoProcessor();
      default: throw new Error(\`Unknown provider: \${provider}\`);
    }
  }
}

// Client code — never mentions concrete classes
const processor = PaymentProcessorFactory.create(config.paymentProvider);
await processor.charge(99.99, 'USD');`,
    relatedPatterns: ["singleton", "strategy"]
  },

  {
    id: "builder",
    name: "Builder",
    category: "Creational",
    emoji: "🔨",
    intent: "Construct a complex object step-by-step, allowing different representations of the same construction process.",
    problem: "A class has many optional parameters. A constructor with 15 parameters is unreadable; overloading creates combinatorial explosion. You need readable, safe construction of objects with many optional parts.",
    solution: "Create a separate Builder class with fluent setter methods for each field. Call .build() at the end to produce the final immutable object. Optional fields have defaults; required fields are validated in .build().",
    whenToUse: [
      "Objects with many optional parameters (avoid telescoping constructor anti-pattern)",
      "Building complex query objects (SQL queries, HTTP requests, test fixtures)",
      "When you need different representations of the same construction (e.g., HouseBuilder → WoodenHouse, ConcreteHouse)",
      "Constructing immutable objects with validation before creation"
    ],
    pros: [
      "Readable, self-documenting construction code (fluent API)",
      "Separate construction from representation",
      "Easy to add new optional fields without breaking existing callers",
      "Can enforce invariants in .build() before the object exists"
    ],
    cons: [
      "More code than direct construction for simple objects",
      "Builder must be kept in sync with the product class",
      "Some languages (Kotlin, Python) make this less necessary with named parameters"
    ],
    realWorldExamples: [
      "Java's StringBuilder, Stream.Builder, ProcessBuilder",
      "Retrofit (Android) — OkHttpClient.Builder for HTTP client config",
      "AWS SDK v2 — S3Client.builder().region().credentialsProvider().build()",
      "TypeORM QueryBuilder — .select().from().where().orderBy().getMany()"
    ],
    codeExample: `class HttpRequest {
  private constructor(
    public readonly url: string,
    public readonly method: string,
    public readonly headers: Record<string, string>,
    public readonly body: string | null,
    public readonly timeoutMs: number,
    public readonly retries: number,
  ) {}

  static builder(url: string) { return new HttpRequestBuilder(url); }
}

class HttpRequestBuilder {
  private method = 'GET';
  private headers: Record<string, string> = {};
  private body: string | null = null;
  private timeoutMs = 5000;
  private retries = 0;

  constructor(private readonly url: string) {}

  withMethod(m: string)            { this.method = m; return this; }
  withHeader(k: string, v: string) { this.headers[k] = v; return this; }
  withBody(b: string)              { this.body = b; return this; }
  withTimeout(ms: number)          { this.timeoutMs = ms; return this; }
  withRetries(n: number)           { this.retries = n; return this; }

  build(): HttpRequest {
    if (!this.url) throw new Error('URL is required');
    return new (HttpRequest as any)(this.url, this.method, this.headers, this.body, this.timeoutMs, this.retries);
  }
}

// Clean, readable usage:
const req = HttpRequest.builder('https://api.example.com/users')
  .withMethod('POST')
  .withHeader('Authorization', 'Bearer token123')
  .withBody(JSON.stringify({ name: 'Alice' }))
  .withTimeout(3000)
  .withRetries(2)
  .build();`,
    relatedPatterns: ["factory", "singleton"]
  },

  // ===== STRUCTURAL =====
  {
    id: "decorator",
    name: "Decorator",
    category: "Structural",
    emoji: "🎀",
    intent: "Attach additional responsibilities to an object dynamically by wrapping it, without modifying its class.",
    problem: "You need to add features (logging, caching, compression, authentication) to an object at runtime. Subclassing creates a class explosion: CachedLoggingCompressedService, LoggingService, CachedService, etc.",
    solution: "Create decorator classes that implement the same interface as the component they wrap. Each decorator delegates to the wrapped component and adds behavior before/after. Stack decorators freely at runtime.",
    whenToUse: [
      "Adding cross-cutting concerns (logging, caching, retry) to objects without subclassing",
      "When inheritance would create too many subclasses for all combinations",
      "Middleware/pipeline patterns (HTTP middleware stacks, Express.js)",
      "Adding optional features that can be turned on/off per instance"
    ],
    pros: [
      "Extend behavior without modifying existing code (Open/Closed Principle)",
      "Combine multiple decorators flexibly at runtime",
      "Each decorator has a single responsibility (SRP)"
    ],
    cons: [
      "Many small objects — can be confusing to debug deeply nested decorators",
      "Order of decoration matters and is not enforced by the type system",
      "Harder to trace which decorator is responsible for a given behavior"
    ],
    realWorldExamples: [
      "Java I/O streams: BufferedReader(new FileReader()) — stacked decorators",
      "Express.js / Koa middleware: each middleware wraps next()",
      "Python @functools.wraps decorators for caching, timing, retry",
      "React Higher-Order Components (HOCs) wrap components with extra behavior"
    ],
    codeExample: `interface DataSource {
  write(data: string): void;
  read(): string;
}

// Base component
class FileDataSource implements DataSource {
  write(data: string) { /* write to file */ }
  read(): string { return ''; /* read from file */ }
}

// Base decorator
class DataSourceDecorator implements DataSource {
  constructor(protected wrapped: DataSource) {}
  write(data: string) { this.wrapped.write(data); }
  read(): string { return this.wrapped.read(); }
}

// Concrete decorators
class EncryptionDecorator extends DataSourceDecorator {
  write(data: string) { super.write(this.encrypt(data)); }
  read(): string { return this.decrypt(super.read()); }
  private encrypt(s: string) { return btoa(s); }
  private decrypt(s: string) { return atob(s); }
}

class CompressionDecorator extends DataSourceDecorator {
  write(data: string) { super.write(this.compress(data)); }
  read(): string { return this.decompress(super.read()); }
  private compress(s: string) { return s; /* gzip */ }
  private decompress(s: string) { return s; }
}

// Stack freely at runtime
const source = new CompressionDecorator(
  new EncryptionDecorator(
    new FileDataSource()
  )
);
source.write('sensitive data'); // compressed → encrypted → written to file`,
    relatedPatterns: ["proxy", "factory"]
  },

  {
    id: "proxy",
    name: "Proxy",
    category: "Structural",
    emoji: "🔁",
    intent: "Provide a surrogate object that controls access to another object, adding behavior like caching, access control, or lazy initialization.",
    problem: "An object is expensive to create, needs access control, or requires lazy initialization. Clients shouldn't need to know about these concerns — they just want to call methods.",
    solution: "Create a proxy class with the same interface as the real subject. The proxy intercepts calls and can add caching, logging, authentication, or deferred loading before delegating to the real subject.",
    whenToUse: [
      "Virtual Proxy: lazy initialization of expensive objects (load images on demand)",
      "Protection Proxy: access control checks before delegating",
      "Caching Proxy: cache results of expensive operations",
      "Remote Proxy: represent a remote object locally (RPC stubs)"
    ],
    pros: [
      "Open/Closed: add behavior without changing the real subject",
      "Lazy initialization — real object created only when actually needed",
      "Transparent to clients — same interface as real subject"
    ],
    cons: [
      "Adds a layer of indirection — response may be slower",
      "Proxy must stay synchronized with the real subject interface",
      "Can obscure what's actually happening (hidden caching bugs)"
    ],
    realWorldExamples: [
      "Service workers — proxy HTTP requests for offline caching",
      "Java's java.lang.reflect.Proxy — dynamic proxy for AOP",
      "ORM lazy loading: accessing relation.posts triggers a DB query",
      "Apollo Client cache — proxies GraphQL queries against a local cache"
    ],
    codeExample: `interface UserService {
  getUser(id: string): Promise<User>;
}

class RealUserService implements UserService {
  async getUser(id: string): Promise<User> {
    return db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}

// Caching Proxy
class CachedUserService implements UserService {
  private cache = new Map<string, { user: User; expiresAt: number }>();

  constructor(private real: UserService, private ttlMs = 60_000) {}

  async getUser(id: string): Promise<User> {
    const cached = this.cache.get(id);
    if (cached && Date.now() < cached.expiresAt) {
      console.log(\`Cache hit for user \${id}\`);
      return cached.user;
    }
    const user = await this.real.getUser(id);
    this.cache.set(id, { user, expiresAt: Date.now() + this.ttlMs });
    return user;
  }
}

const userService = new CachedUserService(new RealUserService());`,
    relatedPatterns: ["decorator", "singleton"]
  },

  // ===== BEHAVIORAL =====
  {
    id: "observer",
    name: "Observer",
    category: "Behavioral",
    emoji: "👁️",
    intent: "Define a one-to-many dependency so that when one object (subject) changes state, all its dependents (observers) are notified automatically.",
    problem: "Multiple parts of a system need to react to events without tight coupling. Hardcoding callbacks creates spaghetti code and violates Open/Closed — adding a new reaction means modifying the event source.",
    solution: "Objects register themselves as observers on a subject. The subject maintains a list of observers and calls notify() on all of them when its state changes. Observers handle the event independently.",
    whenToUse: [
      "Event handling systems (UI events, DOM events, Node.js EventEmitter)",
      "Pub/Sub messaging patterns (Kafka consumers, Redis Pub/Sub)",
      "Model-View synchronization in MVC — view observes model changes",
      "Reactive programming (RxJS Observables, React state updates)"
    ],
    pros: [
      "Loose coupling — subject doesn't know concrete observer types",
      "Dynamic subscription — observers register/unregister at runtime",
      "Broadcast communication to many observers with a single event"
    ],
    cons: [
      "Unexpected updates — observers may not know the order of notification",
      "Memory leaks if observers aren't properly unsubscribed",
      "Can lead to complex update chains (cascade of notifications)"
    ],
    realWorldExamples: [
      "Node.js EventEmitter — core Observer implementation in Node",
      "Redux store.subscribe() — Observer for state changes",
      "RxJS Observable — extended Observer with operators",
      "DOM addEventListener — observer pattern for browser events"
    ],
    codeExample: `interface Observer<T> {
  update(event: T): void;
}

class EventBus<T> {
  private observers = new Map<string, Set<Observer<T>>>();

  subscribe(event: string, observer: Observer<T>): () => void {
    if (!this.observers.has(event)) this.observers.set(event, new Set());
    this.observers.get(event)!.add(observer);
    // Return unsubscribe function
    return () => this.observers.get(event)?.delete(observer);
  }

  publish(event: string, data: T): void {
    this.observers.get(event)?.forEach(o => o.update(data));
  }
}

// Usage
const bus = new EventBus<{ userId: string; amount: number }>();

const emailObserver = { update: (e) => sendEmail(e.userId, \`Order $\${e.amount} placed\`) };
const analyticsObserver = { update: (e) => trackEvent('purchase', e) };
const inventoryObserver = { update: (e) => reserveStock(e) };

bus.subscribe('order.placed', emailObserver);
bus.subscribe('order.placed', analyticsObserver);
bus.subscribe('order.placed', inventoryObserver);

// Publish once — all observers react independently
bus.publish('order.placed', { userId: 'u1', amount: 99.99 });`,
    relatedPatterns: ["strategy", "decorator"]
  },

  {
    id: "strategy",
    name: "Strategy",
    category: "Behavioral",
    emoji: "🎯",
    intent: "Define a family of algorithms, encapsulate each one, and make them interchangeable at runtime.",
    problem: "A class has multiple behaviors that change based on context (e.g., different sort algorithms, payment methods, routing strategies). Putting all variants into one class with if/else creates a bloated, hard-to-test class.",
    solution: "Extract each algorithm into its own class implementing a common interface. The context holds a reference to the current strategy and delegates the algorithmic behavior to it. Swap strategies at runtime.",
    whenToUse: [
      "Multiple variants of an algorithm that need to be interchangeable",
      "Replacing conditional logic with polymorphism (eliminate switch/if-else chains)",
      "Payment processing: select between Stripe, PayPal, Crypto at runtime",
      "Sorting, compression, encryption strategies configurable per use case"
    ],
    pros: [
      "Open/Closed: add new strategies without touching the context",
      "Eliminates conditional logic — each strategy is a separate class",
      "Easy to test each strategy in isolation"
    ],
    cons: [
      "Clients must be aware of the different strategies to choose one",
      "Overkill for simple cases with only 2-3 variants",
      "Context and strategies must agree on how data is passed"
    ],
    realWorldExamples: [
      "Array.prototype.sort(compareFn) — compareFn is a Strategy",
      "Passport.js authentication — Strategy pattern for auth providers",
      "Compression libraries: choose gzip, brotli, zstd by strategy",
      "Load balancer routing algorithms: round-robin, least-connections, IP-hash"
    ],
    codeExample: `interface CompressionStrategy {
  compress(data: Buffer): Buffer;
  decompress(data: Buffer): Buffer;
  readonly name: string;
}

class GzipStrategy implements CompressionStrategy {
  name = 'gzip';
  compress(data: Buffer)   { /* zlib.gzip */ return data; }
  decompress(data: Buffer) { /* zlib.gunzip */ return data; }
}

class BrotliStrategy implements CompressionStrategy {
  name = 'brotli';
  compress(data: Buffer)   { /* zlib.brotliCompress */ return data; }
  decompress(data: Buffer) { /* zlib.brotliDecompress */ return data; }
}

class StorageService {
  constructor(private strategy: CompressionStrategy) {}

  setStrategy(strategy: CompressionStrategy) {
    this.strategy = strategy;  // swap at runtime
  }

  store(key: string, data: Buffer): Buffer {
    const compressed = this.strategy.compress(data);
    console.log(\`Stored with \${this.strategy.name}: \${data.length} → \${compressed.length} bytes\`);
    return compressed;
  }
}

const storage = new StorageService(new GzipStrategy());
storage.store('file.bin', Buffer.from('large data'));

// Swap to Brotli for better compression on text
storage.setStrategy(new BrotliStrategy());`,
    relatedPatterns: ["factory", "decorator", "observer"]
  },

  {
    id: "state",
    name: "State",
    category: "Behavioral",
    emoji: "🔄",
    intent: "Allow an object to change its behavior when its internal state changes, as if the object changed its class.",
    problem: "An object's behavior varies significantly by state (e.g., a vending machine that behaves differently when idle, coin inserted, or dispensing). Encoding this with if/else or switch on a state enum creates an unmaintainable ball of mud.",
    solution: "Represent each state as a separate class implementing a common interface. The context delegates behavior to the current state object. State transitions update the context's current state reference.",
    whenToUse: [
      "Objects whose behavior changes dramatically based on internal state",
      "State machine implementations (order lifecycle, network connection, vending machine)",
      "Replacing large switch/if-else blocks that check a state variable",
      "Traffic lights, elevator controllers, TCP connection states"
    ],
    pros: [
      "Single Responsibility: each state class handles one state's behavior",
      "Open/Closed: add new states without touching existing state classes",
      "Makes state transitions explicit and easy to trace"
    ],
    cons: [
      "Can create many small state classes for complex state machines",
      "State transitions may be scattered across state classes (use orchestrator)",
      "Overkill for objects with only 2-3 simple states"
    ],
    realWorldExamples: [
      "TCP connection states: LISTEN, SYN_SENT, ESTABLISHED, CLOSE_WAIT",
      "Order lifecycle: PENDING → CONFIRMED → SHIPPED → DELIVERED → CANCELLED",
      "Circuit Breaker is a State pattern: CLOSED, OPEN, HALF_OPEN",
      "Traffic light controller, elevator dispatch system"
    ],
    codeExample: `interface VendingState {
  insertCoin(machine: VendingMachine, amount: number): void;
  selectProduct(machine: VendingMachine, productId: string): void;
  dispense(machine: VendingMachine): void;
}

class IdleState implements VendingState {
  insertCoin(m: VendingMachine, amount: number) {
    m.credit += amount;
    console.log(\`Coin inserted. Credit: $\${m.credit}\`);
    m.setState(new HasCreditState());
  }
  selectProduct(m: VendingMachine) { console.log('Insert coin first'); }
  dispense(m: VendingMachine) { console.log('No credit'); }
}

class HasCreditState implements VendingState {
  insertCoin(m: VendingMachine, amount: number) { m.credit += amount; }
  selectProduct(m: VendingMachine, id: string) {
    const product = m.inventory.get(id);
    if (product && m.credit >= product.price) {
      m.selectedProduct = product;
      m.setState(new DispensingState());
    } else {
      console.log('Insufficient credit or out of stock');
    }
  }
  dispense(m: VendingMachine) { console.log('Select a product first'); }
}

class DispensingState implements VendingState {
  insertCoin(m: VendingMachine) { console.log('Dispensing in progress'); }
  selectProduct(m: VendingMachine) { console.log('Already dispensing'); }
  dispense(m: VendingMachine) {
    m.credit -= m.selectedProduct!.price;
    console.log(\`Dispensing \${m.selectedProduct!.name}. Change: $\${m.credit}\`);
    m.selectedProduct = null;
    m.setState(m.credit > 0 ? new HasCreditState() : new IdleState());
  }
}`,
    relatedPatterns: ["strategy", "singleton"]
  },

  // ===== SCALING =====
  {
    id: "load-balancing",
    name: "Load Balancing",
    category: "Scaling",
    emoji: "⚖️",
    pickItWhen: "Single server is a bottleneck or SPOF",
    mainTradeoff: "Session affinity complexity",
    intent: "Distribute incoming network traffic across multiple backend servers so no single server bears all the load.",
    problem: "A single server handling all traffic becomes a bottleneck and single point of failure. As traffic grows, vertical scaling (bigger server) hits a ceiling in both cost and physics.",
    solution: "A load balancer sits in front of a server pool and routes each request to the least-loaded (or next-in-rotation) server using algorithms like Round Robin, Least Connections, IP Hash, or Weighted Round Robin. Unhealthy servers are removed from rotation via health checks.",
    whenToUse: [
      "Horizontally scaled web/API servers behind a single entry point",
      "Any system where you need to eliminate a single point of failure",
      "Handling traffic spikes by dynamically adding/removing servers",
      "Geographic load distribution (DNS-based or Anycast load balancing)"
    ],
    pros: [
      "Horizontal scalability — add servers to increase capacity linearly",
      "High availability — dead servers are removed without downtime",
      "SSL termination and request routing centralized at one point"
    ],
    cons: [
      "Stateful sessions need sticky sessions or externalized session store",
      "Load balancer itself can become a bottleneck (mitigated by HA pairs)",
      "Health check tuning critical — too aggressive causes flapping"
    ],
    realWorldExamples: [
      "AWS ALB/NLB distributing traffic across EC2 Auto Scaling groups",
      "NGINX and HAProxy as software load balancers",
      "Cloudflare's Anycast network distributing DNS and HTTP globally",
      "Kubernetes Service with kube-proxy distributing pods"
    ],
    codeExample: `// Round-robin load balancer (simplified)
class LoadBalancer {
  private servers: string[];
  private current = 0;
  private healthyServers: Set<string>;

  constructor(servers: string[]) {
    this.servers = servers;
    this.healthyServers = new Set(servers);
    this.startHealthChecks();
  }

  getServer(): string {
    const healthy = this.servers.filter(s => this.healthyServers.has(s));
    if (healthy.length === 0) throw new Error("No healthy servers available");
    const server = healthy[this.current % healthy.length];
    this.current++;
    return server;
  }

  private async checkHealth(server: string): Promise<void> {
    try {
      const res = await fetch(\`\${server}/health\`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) this.healthyServers.add(server);
      else this.healthyServers.delete(server);
    } catch {
      this.healthyServers.delete(server);
      console.warn(\`\${server} removed from rotation\`);
    }
  }

  private startHealthChecks() {
    setInterval(() => this.servers.forEach(s => this.checkHealth(s)), 5000);
  }
}

const lb = new LoadBalancer([
  'http://server-1:3000',
  'http://server-2:3000',
  'http://server-3:3000',
]);`,
    relatedPatterns: ["horizontal-scaling", "consistent-hashing", "circuit-breaker"]
  },

  {
    id: "horizontal-scaling",
    name: "Horizontal Scaling",
    category: "Scaling",
    emoji: "📈",
    pickItWhen: "Vertical scaling ceiling reached or cost-prohibitive",
    mainTradeoff: "Stateless design required",
    intent: "Scale out by adding more machines to a pool rather than making a single machine larger.",
    problem: "Vertical scaling (more CPU/RAM on one machine) hits hard limits — both technical ceilings and exponential cost curves. A single powerful machine is also a single point of failure.",
    solution: "Design services to be stateless so any instance can handle any request. Store shared state externally (Redis, DB). Use a load balancer to distribute traffic. Scale with auto-scaling groups that spin up/down instances based on CPU, request rate, or queue depth.",
    whenToUse: [
      "Stateless web servers or API layers that can be replicated freely",
      "Workloads with variable or unpredictable traffic (e-commerce, streaming)",
      "When you need fault tolerance — N-1 instances can absorb failure of one",
      "Microservices that independently need different scaling profiles"
    ],
    pros: [
      "Theoretically unlimited scale — add more instances as needed",
      "Better fault tolerance than a single large machine",
      "Cost-effective: use commodity hardware, pay per instance"
    ],
    cons: [
      "Requires stateless architecture — session data must live in external store",
      "Data layer is often the hardest part to scale horizontally",
      "Distributed systems complexity: consistency, coordination, network partitions"
    ],
    realWorldExamples: [
      "AWS EC2 Auto Scaling Groups scaling web tiers",
      "Kubernetes HorizontalPodAutoscaler adjusting replica counts",
      "Twitter running thousands of stateless API servers",
      "Netflix's stateless microservices on AWS"
    ],
    codeExample: `// Stateless service design enabling horizontal scaling
// BAD: stateful — stores session in memory, breaks with multiple instances
class StatefulUserService {
  private sessions = new Map<string, User>(); // 💀 not shared across instances

  login(userId: string): string {
    const token = crypto.randomUUID();
    this.sessions.set(token, { id: userId }); // only lives on this machine
    return token;
  }
}

// GOOD: stateless — session in shared Redis, any instance can serve any request
import { createClient } from 'redis';

class StatelessUserService {
  constructor(private redis = createClient({ url: process.env.REDIS_URL })) {}

  async login(userId: string): Promise<string> {
    const token = crypto.randomUUID();
    await this.redis.setEx(\`session:\${token}\`, 3600, userId); // shared store
    return token;
  }

  async getUser(token: string): Promise<string | null> {
    return this.redis.get(\`session:\${token}\`); // works from any instance
  }
}`,
    relatedPatterns: ["load-balancing", "database-sharding", "read-replicas"]
  },

  {
    id: "database-sharding",
    name: "Database Sharding",
    category: "Scaling",
    emoji: "🗄️",
    pickItWhen: "Single DB can't handle read+write volume",
    mainTradeoff: "Cross-shard queries are expensive",
    intent: "Partition a large database into smaller, independent pieces (shards), each holding a subset of the data, served by separate DB instances.",
    problem: "A single database server eventually hits limits — disk IOPS, RAM, CPU, or replication lag. Even with read replicas, writes all go to one primary and become the bottleneck.",
    solution: "Choose a shard key (e.g., userId, tenantId, geographic region). Use a routing layer (shard map) to direct each query to the correct shard. Each shard is a fully independent database holding its slice of the data. Consistent hashing is commonly used to map keys to shards.",
    whenToUse: [
      "Write throughput exceeds what a single DB primary can handle",
      "Dataset is too large for one machine's disk even with compression",
      "Multi-tenant SaaS — shard by tenantId for data isolation",
      "Geographic data locality requirements (EU data in EU shards)"
    ],
    pros: [
      "Horizontal write scalability — adds N times write capacity",
      "Data locality — hot data co-located with the users who access it",
      "Failure isolation — one shard failure doesn't take down all data"
    ],
    cons: [
      "Cross-shard JOINs and transactions are extremely expensive or impossible",
      "Hotspot risk — uneven shard key distribution causes hot shards",
      "Re-sharding (splitting shards) is operationally painful"
    ],
    realWorldExamples: [
      "Instagram shards user data by user ID using a modified Cassandra ring",
      "Vitess (YouTube) provides MySQL sharding transparently",
      "MongoDB Atlas sharded clusters with hashed shard keys",
      "Discord shards message storage by channel/guild ID"
    ],
    codeExample: `class ShardRouter {
  private shardCount: number;
  private shards: Map<number, DatabaseConnection>;

  constructor(shardCount: number) {
    this.shardCount = shardCount;
    this.shards = new Map();
    for (let i = 0; i < shardCount; i++) {
      this.shards.set(i, new DatabaseConnection(\`shard-\${i}.db.internal\`));
    }
  }

  // Shard key: userId — ensures same user always hits same shard
  private getShardId(userId: string): number {
    // FNV-1a hash for uniform distribution
    let hash = 2166136261;
    for (const char of userId) {
      hash ^= char.charCodeAt(0);
      hash = (hash * 16777619) >>> 0;
    }
    return hash % this.shardCount;
  }

  getShard(userId: string): DatabaseConnection {
    const shardId = this.getShardId(userId);
    return this.shards.get(shardId)!;
  }

  async getUser(userId: string): Promise<User> {
    const shard = this.getShard(userId);
    return shard.query('SELECT * FROM users WHERE id = ?', [userId]);
  }
}

const router = new ShardRouter(8); // 8 shards = 8x write capacity`,
    relatedPatterns: ["consistent-hashing", "data-partitioning", "read-replicas"]
  },

  {
    id: "read-replicas",
    name: "Read Replicas",
    category: "Scaling",
    emoji: "📖",
    pickItWhen: "Read:write ratio is 5:1 or higher",
    mainTradeoff: "Replication lag causes stale reads",
    intent: "Offload read traffic from the primary database to one or more read-only replicas that asynchronously mirror the primary's data.",
    problem: "Most applications are read-heavy (80-95% reads). Sending all queries to a single primary exhausts its CPU and I/O, slowing writes and degrading the entire system.",
    solution: "The primary handles all writes. Changes are streamed asynchronously to replicas via WAL (Write-Ahead Log) replication. Read traffic is distributed across replicas. Application code directs reads to the replica pool and writes to the primary.",
    whenToUse: [
      "Reporting and analytics queries that would slow the primary",
      "Search and list endpoints that can tolerate slightly stale data",
      "Geographic replicas to serve reads from the nearest region",
      "Creating a replica for backup or migration without touching primary"
    ],
    pros: [
      "Dramatically reduces primary load — each replica absorbs a share of reads",
      "Easy to implement — most managed DBs (RDS, Cloud SQL) offer one-click replicas",
      "Replicas can serve as hot standbys for failover"
    ],
    cons: [
      "Replication lag — replicas may be milliseconds to seconds behind primary",
      "Read-your-writes consistency tricky: user just wrote, reads from replica, sees old data",
      "Replicas add cost and operational complexity"
    ],
    realWorldExamples: [
      "MySQL/PostgreSQL streaming replication — standard in almost every scaled web app",
      "AWS RDS Read Replicas — up to 15 replicas per instance",
      "GitHub uses MySQL read replicas to serve millions of repository reads",
      "Shopify routes reporting queries to dedicated analytics replicas"
    ],
    codeExample: `class DatabasePool {
  private primary: DatabaseConnection;
  private replicas: DatabaseConnection[];
  private replicaIndex = 0;

  constructor(primaryUrl: string, replicaUrls: string[]) {
    this.primary = new DatabaseConnection(primaryUrl);
    this.replicas = replicaUrls.map(url => new DatabaseConnection(url));
  }

  // Writes always go to primary
  async write(query: string, params: unknown[]): Promise<void> {
    await this.primary.execute(query, params);
  }

  // Reads round-robin across replicas
  async read<T>(query: string, params: unknown[]): Promise<T> {
    if (this.replicas.length === 0) {
      return this.primary.query<T>(query, params);
    }
    const replica = this.replicas[this.replicaIndex % this.replicas.length];
    this.replicaIndex++;
    return replica.query<T>(query, params);
  }

  // Read-your-writes: force primary read right after a write
  async readAfterWrite<T>(query: string, params: unknown[]): Promise<T> {
    return this.primary.query<T>(query, params);
  }
}`,
    relatedPatterns: ["database-sharding", "cache-aside", "cqrs"]
  },

  {
    id: "consistent-hashing",
    name: "Consistent Hashing",
    category: "Scaling",
    emoji: "🔄",
    pickItWhen: "Nodes added/removed frequently from a distributed cache/DB ring",
    mainTradeoff: "Hotspots without virtual nodes",
    intent: "Map both data keys and servers onto the same hash ring so that adding or removing a server remaps only K/N keys (not all keys).",
    problem: "Simple modular hashing (key % N) remaps nearly all keys when N changes (server added/removed), causing a massive cache miss storm and thundering herd on the database.",
    solution: "Place both servers and keys on a 0–2^32 circular ring using the same hash function. Each key is owned by the first server clockwise from it on the ring. When a server is added/removed, only keys between it and its predecessor move — O(K/N) remapping. Virtual nodes (vnodes) add multiple points per server for uniform distribution.",
    whenToUse: [
      "Distributed caches (Memcached, Redis Cluster) — minimize cache invalidation on scale events",
      "Distributed databases that need consistent data routing (Cassandra, DynamoDB)",
      "Content delivery and load balancing in peer-to-peer networks",
      "Partitioning work across a dynamic pool of workers"
    ],
    pros: [
      "Only 1/N keys remapped when adding/removing a node (vs ~100% with mod hashing)",
      "Virtual nodes give uniform load distribution without hardware uniformity",
      "Enables seamless horizontal scaling without full data reshuffling"
    ],
    cons: [
      "More complex to implement and reason about than simple mod hashing",
      "Virtual nodes add memory overhead to maintain the ring",
      "Hotspot still possible if vnode count is too low"
    ],
    realWorldExamples: [
      "Amazon Dynamo and DynamoDB use consistent hashing for partition routing",
      "Apache Cassandra uses a token ring (consistent hashing variant) for data placement",
      "Memcached client libraries use consistent hashing to route to cache nodes",
      "Akamai CDN uses consistent hashing to map URLs to edge servers"
    ],
    codeExample: `class ConsistentHashRing {
  private ring = new Map<number, string>(); // position -> serverName
  private sortedKeys: number[] = [];
  private readonly VNODES = 150; // virtual nodes per server

  addServer(server: string): void {
    for (let i = 0; i < this.VNODES; i++) {
      const pos = this.hash(\`\${server}:vnode:\${i}\`);
      this.ring.set(pos, server);
    }
    this.sortedKeys = [...this.ring.keys()].sort((a, b) => a - b);
  }

  removeServer(server: string): void {
    for (let i = 0; i < this.VNODES; i++) {
      const pos = this.hash(\`\${server}:vnode:\${i}\`);
      this.ring.delete(pos);
    }
    this.sortedKeys = [...this.ring.keys()].sort((a, b) => a - b);
  }

  getServer(key: string): string {
    if (this.ring.size === 0) throw new Error("No servers in ring");
    const pos = this.hash(key);
    // Find first server clockwise from key's position
    const idx = this.sortedKeys.findIndex(k => k >= pos);
    const serverPos = idx === -1 ? this.sortedKeys[0] : this.sortedKeys[idx];
    return this.ring.get(serverPos)!;
  }

  private hash(key: string): number {
    let h = 2166136261;
    for (const c of key) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0; // keep in 0..2^32
  }
}`,
    relatedPatterns: ["database-sharding", "load-balancing", "data-partitioning"]
  },

  {
    id: "data-partitioning",
    name: "Data Partitioning",
    category: "Scaling",
    emoji: "📦",
    pickItWhen: "Dataset too large or queries too broad for one node",
    mainTradeoff: "Partition key choice is irreversible",
    intent: "Divide a large dataset into smaller, manageable partitions based on a partition key, enabling parallel queries and targeted data placement.",
    problem: "Full-table scans on billion-row tables are slow regardless of indexing. A single partition handles too much data, and queries that span all data are unavoidably slow.",
    solution: "Choose a partition key that aligns with your most common query patterns (e.g., date for time-series, tenantId for multi-tenant, region for geographic). Horizontal partitioning (range, hash, list) splits rows across partitions. Vertical partitioning splits columns into separate tables.",
    whenToUse: [
      "Time-series data: partition by date/month — queries almost always have a time window",
      "Multi-tenant systems: partition by tenantId for data isolation and parallel queries",
      "Large event or log tables where old partitions can be archived/dropped cheaply",
      "Geographic systems: partition by region for data locality"
    ],
    pros: [
      "Query pruning — optimizer only scans relevant partitions",
      "Maintenance operations (VACUUM, backup) per partition, not whole table",
      "Old partitions can be dropped instantly instead of slow DELETEs"
    ],
    cons: [
      "Wrong partition key causes full-scan across all partitions (partition key must match query predicates)",
      "Cross-partition transactions lose atomicity guarantees",
      "Partition management overhead (adding new date partitions, rebalancing)"
    ],
    realWorldExamples: [
      "PostgreSQL declarative partitioning for time-series tables by month",
      "BigQuery automatic date partitioning on timestamp columns",
      "Snowflake micro-partitioning for automatic clustering",
      "Kafka topic partitions distributing log streams across brokers"
    ],
    codeExample: `-- PostgreSQL range partitioning by date (time-series logs)

-- Parent table declaration
CREATE TABLE events (
  id         BIGSERIAL,
  user_id    UUID        NOT NULL,
  event_type TEXT        NOT NULL,
  payload    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE events_2024_01 PARTITION OF events
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE events_2024_02 PARTITION OF events
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Query only touches relevant partition — partition pruning
EXPLAIN SELECT * FROM events
WHERE created_at BETWEEN '2024-01-15' AND '2024-01-31'
  AND user_id = 'abc-123';
-- Filter: (created_at >= '2024-01-15') -- scans events_2024_01 only

-- Old partitions can be detached and archived instantly (no DELETE scan)
ALTER TABLE events DETACH PARTITION events_2024_01;`,
    relatedPatterns: ["database-sharding", "consistent-hashing", "read-replicas"]
  },

  // ===== CACHING =====
  {
    id: "cache-aside",
    name: "Cache-Aside",
    category: "Caching",
    emoji: "💾",
    pickItWhen: "Read-heavy workload with tolerable cache-miss latency",
    mainTradeoff: "Cache stampede on cold start",
    intent: "Application code manages the cache explicitly: read from cache first, fall back to DB on miss, populate cache on miss.",
    problem: "Every read hitting the database is slow and expensive. But blindly caching everything causes stale data. You need a controlled, lazy caching strategy.",
    solution: "On read: check cache first. If hit, return. If miss, query database, write result to cache with a TTL, return. On write: write to database, then invalidate (or update) the cache entry. The application is fully in control of what goes in the cache.",
    whenToUse: [
      "Read-heavy workloads where data changes infrequently (product catalog, user profiles)",
      "When you want selective caching — only cache what gets requested",
      "When cache and DB can tolerate being briefly out of sync (eventual consistency)",
      "As the default caching strategy for most web applications"
    ],
    pros: [
      "Cache only gets populated with actually-requested data (no cold data wasting memory)",
      "Cache failures are non-fatal — fallback to DB always available",
      "Simple to implement and reason about"
    ],
    cons: [
      "Cache miss penalty: first request after eviction hits DB (cold start, cache stampede risk)",
      "Write invalidation is complex — easy to forget to invalidate on every write path",
      "Stale data window between write and invalidation"
    ],
    realWorldExamples: [
      "Redis + PostgreSQL pattern used by virtually every scaled web app",
      "Django's cache framework with cache_page and cache.get/set",
      "Rails low-level caching with Rails.cache.fetch",
      "AWS ElastiCache used as cache-aside layer in front of RDS"
    ],
    codeExample: `class UserService {
  constructor(
    private readonly cache: RedisClient,
    private readonly db: PostgresClient,
    private readonly TTL = 3600 // 1 hour
  ) {}

  async getUser(userId: string): Promise<User> {
    const cacheKey = \`user:\${userId}\`;

    // 1. Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as User;
    }

    // 2. Cache miss — fetch from DB
    const user = await this.db.query<User>(
      'SELECT * FROM users WHERE id = $1', [userId]
    );

    if (!user) throw new Error('User not found');

    // 3. Populate cache for next time
    await this.cache.setEx(cacheKey, this.TTL, JSON.stringify(user));

    return user;
  }

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    await this.db.execute('UPDATE users SET ... WHERE id = $1', [userId]);
    // Invalidate cache — next read will repopulate with fresh data
    await this.cache.del(\`user:\${userId}\`);
  }
}`,
    relatedPatterns: ["write-through", "write-behind", "cdn", "read-replicas"]
  },

  {
    id: "write-through",
    name: "Write-Through Cache",
    category: "Caching",
    emoji: "✏️",
    pickItWhen: "Reads must always be fresh after a write",
    mainTradeoff: "Write latency doubles (cache + DB synchronously)",
    intent: "Write data to the cache and the database simultaneously on every write, keeping them always in sync.",
    problem: "Cache-aside has a stale window between write and cache invalidation. Applications that can't tolerate stale reads (user preferences, inventory counts) need stronger consistency.",
    solution: "Every write goes through the cache layer. The cache writes to both itself and the database synchronously before returning success. Reads always hit the cache, which is guaranteed to be consistent with the DB. The cache handles the dual-write atomically.",
    whenToUse: [
      "Data that is written and read frequently (shopping cart, user settings)",
      "When you can't tolerate reading stale data after a write",
      "Financial counters or inventory numbers where accuracy matters",
      "Combined with read-through for a fully cache-managed data access layer"
    ],
    pros: [
      "Cache is always consistent with DB — no stale reads",
      "No explicit cache invalidation logic needed in application code",
      "Read latency is always fast (cache always warm after first write)"
    ],
    cons: [
      "Write latency = cache write + DB write (sequential or parallel)",
      "Cache fills with data that may never be read (write-heavy, read-rarely data wastes cache memory)",
      "Cache failure blocks writes if both writes are required to succeed"
    ],
    realWorldExamples: [
      "Memcached write-through configurations in e-commerce platforms",
      "Redis WAIT command ensuring replica acknowledgment before returning",
      "Hibernate second-level cache in write-through mode",
      "CDN origin-shield write-through for edge consistency"
    ],
    codeExample: `class WriteThroughCache<T> {
  private cache = new Map<string, T>();

  constructor(
    private readonly db: DatabaseClient,
    private readonly tableName: string
  ) {}

  async write(key: string, value: T): Promise<void> {
    // Write to DB first (source of truth)
    await this.db.upsert(this.tableName, { id: key, data: value });

    // Then update cache — both complete before returning
    this.cache.set(key, value);
    // With Redis: await redis.setEx(key, TTL, JSON.stringify(value));
  }

  async read(key: string): Promise<T | null> {
    // Cache is always consistent — no fallback needed
    if (this.cache.has(key)) return this.cache.get(key)!;

    // First-ever read (before any write) — warm from DB
    const row = await this.db.findById(this.tableName, key);
    if (row) this.cache.set(key, row.data as T);
    return row ? (row.data as T) : null;
  }
}`,
    relatedPatterns: ["cache-aside", "write-behind", "read-replicas"]
  },

  {
    id: "write-behind",
    name: "Write-Behind Cache",
    category: "Caching",
    emoji: "⏱️",
    pickItWhen: "Write throughput is the bottleneck and eventual persistence is fine",
    mainTradeoff: "Data loss risk if cache crashes before flush",
    intent: "Write to cache immediately and acknowledge success to the client; flush to the database asynchronously in the background.",
    problem: "High-frequency writes (view counts, like counts, location pings) overwhelm the database if every write hits it synchronously. Write-through doubles write latency.",
    solution: "Writes land in the cache (Redis) instantly. The application gets a fast response. A background worker or the cache itself batches and flushes dirty entries to the database asynchronously — either on a timer, on eviction, or when the dirty set reaches a threshold.",
    whenToUse: [
      "High-frequency low-value writes (page views, like counts, location updates)",
      "Gaming leaderboards, analytics counters where brief inconsistency is fine",
      "IoT sensor data that can be batched before persisting",
      "Any write-heavy workload where eventual durability is acceptable"
    ],
    pros: [
      "Write latency is minimal — only cache write is synchronous",
      "Batching reduces DB write IOPS by 10-100x",
      "Database is protected from write spikes"
    ],
    cons: [
      "Data loss risk: if cache crashes before flushing, recent writes are lost",
      "Reads may return cache-only data not yet in DB — inconsistency window",
      "Flush failures need dead-letter handling to avoid silently losing data"
    ],
    realWorldExamples: [
      "Redis AOF (Append-Only File) with everysec fsync is a write-behind pattern",
      "Twitter like/retweet counts batched in Redis then flushed to MySQL",
      "Game progress auto-save: save to Redis instantly, persist to DB every 30s",
      "LinkedIn profile view counters aggregated in memory before DB write"
    ],
    codeExample: `class WriteBehindCache {
  private dirtyQueue: Map<string, { value: unknown; timestamp: number }> = new Map();
  private flushInterval: ReturnType<typeof setInterval>;

  constructor(
    private readonly cache: RedisClient,
    private readonly db: DatabaseClient,
    flushIntervalMs = 5000
  ) {
    // Flush dirty entries to DB every 5 seconds
    this.flushInterval = setInterval(() => this.flush(), flushIntervalMs);
  }

  async write(key: string, value: unknown): Promise<void> {
    // Fast: only write to cache, return immediately
    await this.cache.set(key, JSON.stringify(value));
    this.dirtyQueue.set(key, { value, timestamp: Date.now() });
    // No DB write — return fast!
  }

  private async flush(): Promise<void> {
    if (this.dirtyQueue.size === 0) return;
    const batch = [...this.dirtyQueue.entries()];
    this.dirtyQueue.clear();

    try {
      // Batch upsert all dirty entries in one DB round trip
      await this.db.batchUpsert(batch.map(([key, { value }]) => ({ key, value })));
      console.log(\`Flushed \${batch.length} dirty entries to DB\`);
    } catch (err) {
      // Re-queue failed entries for next flush attempt
      batch.forEach(([key, meta]) => this.dirtyQueue.set(key, meta));
      console.error('Flush failed, re-queued:', err);
    }
  }
}`,
    relatedPatterns: ["cache-aside", "write-through", "message-queue"]
  },

  {
    id: "cdn",
    name: "CDN (Content Delivery Network)",
    category: "Caching",
    emoji: "🌐",
    pickItWhen: "Static or cacheable content served globally",
    mainTradeoff: "Cache invalidation propagation delay",
    intent: "Serve static and cacheable content from geographically distributed edge servers close to end users, reducing latency and origin load.",
    problem: "A user in Tokyo fetching assets from a server in Virginia experiences 200ms+ RTT for every byte. Origin servers also serve every user globally, which doesn't scale.",
    solution: "A CDN has Points of Presence (PoPs) in dozens of cities globally. Static assets (JS, CSS, images, videos) are cached at the nearest PoP. User requests resolve to the nearest edge, which serves the cached content or fetches it from origin once, then caches it for subsequent requests.",
    whenToUse: [
      "Static assets (JS, CSS, fonts, images) that change infrequently",
      "Video streaming — CDN is essentially mandatory for any video platform",
      "API responses that are the same for all users (public data, catalogs)",
      "DDoS protection — CDN absorbs attack traffic before it reaches origin"
    ],
    pros: [
      "Dramatic latency reduction for geographically distributed users (200ms → 10ms)",
      "Origin offload — CDN serves 80-99% of traffic without hitting your server",
      "Built-in DDoS mitigation and bot protection at edge"
    ],
    cons: [
      "Cache invalidation is slow to propagate globally (minutes)",
      "Personalized or user-specific content can't be CDN-cached",
      "Cost increases linearly with bandwidth at scale"
    ],
    realWorldExamples: [
      "Cloudflare, Akamai, Fastly — used by virtually every major website",
      "Netflix Open Connect appliances in ISP data centers",
      "AWS CloudFront serving S3 static assets with global PoPs",
      "YouTube serving video chunks from edge nodes, not central servers"
    ],
    codeExample: `// Cache-Control headers — the key to effective CDN usage

// Express.js example: set appropriate caching headers per route

// Static assets — cache aggressively, use content hash in filename
app.use('/static', express.static('dist', {
  maxAge: '1y',        // Cache for 1 year at CDN and browser
  immutable: true,     // Content won't change (versioned filenames)
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Vary', 'Accept-Encoding');
  }
}));

// Public API data — CDN cache for 60s, stale-while-revalidate for smoothness
app.get('/api/products', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json(products);
});

// Personalized data — never CDN cache (private)
app.get('/api/user/cart', authenticate, (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  res.json(req.user.cart);
});

// Explicit CDN purge via Cloudflare API after content update
async function purgeFromCDN(urls: string[]): Promise<void> {
  await fetch('https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache', {
    method: 'POST',
    headers: { Authorization: \`Bearer \${CF_TOKEN}\`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: urls }),
  });
}`,
    relatedPatterns: ["cache-aside", "horizontal-scaling", "load-balancing"]
  },

  {
    id: "materialized-views",
    name: "Materialized Views",
    category: "Caching",
    emoji: "📊",
    pickItWhen: "Complex aggregation query runs too slow at request time",
    mainTradeoff: "Stale data between refreshes",
    intent: "Pre-compute and store the results of expensive queries as a physical table that can be queried instantly.",
    problem: "Aggregation queries (SUM, COUNT, JOIN across millions of rows) are too slow to run at request time. Users see multi-second dashboards or timeouts.",
    solution: "Execute the expensive query once and store the results in a materialized view (a physical table). Queries read from this pre-computed table directly. The view is refreshed on a schedule, on data change, or on-demand. The tradeoff is freshness vs. query speed.",
    whenToUse: [
      "Dashboards and reports that aggregate large tables",
      "Leaderboards, rankings, or feed generation with complex scoring",
      "Cross-service reporting where joining live data is impossible",
      "Read API endpoints that query the same expensive data repeatedly"
    ],
    pros: [
      "Query latency drops from seconds to milliseconds",
      "Decouples read performance from write volume on base tables",
      "Simplifies application code — reads a plain table, no complex query"
    ],
    cons: [
      "Data is stale between refresh cycles",
      "Refresh can be expensive and lock the view",
      "Multiple materialized views of the same data must be kept in sync"
    ],
    realWorldExamples: [
      "PostgreSQL MATERIALIZED VIEW with pg_cron scheduled refresh",
      "Snowflake Dynamic Tables — auto-refreshing materialized views",
      "Redis sorted sets as materialized leaderboards updated on write",
      "Elasticsearch denormalized indexes as materialized read models (CQRS)"
    ],
    codeExample: `-- PostgreSQL materialized view for a dashboard leaderboard

-- Expensive base query (takes 3s live)
CREATE MATERIALIZED VIEW user_leaderboard AS
SELECT
  u.id,
  u.username,
  u.avatar_url,
  COUNT(DISTINCT p.id)        AS post_count,
  SUM(p.like_count)           AS total_likes,
  SUM(p.view_count)           AS total_views,
  MAX(p.created_at)           AS last_post_at,
  RANK() OVER (
    ORDER BY SUM(p.like_count) DESC
  )                           AS rank
FROM users u
JOIN posts p ON p.user_id = u.id
WHERE p.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.username, u.avatar_url
WITH DATA; -- populate immediately

CREATE UNIQUE INDEX ON user_leaderboard (id); -- needed for CONCURRENT refresh
CREATE INDEX ON user_leaderboard (rank);

-- Fast read — no aggregation at query time
SELECT * FROM user_leaderboard WHERE rank <= 100;

-- Refresh on a schedule (cron or pg_cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY user_leaderboard;
-- CONCURRENTLY = no lock, reads continue during refresh`,
    relatedPatterns: ["cache-aside", "cqrs", "read-replicas"]
  },

  // ===== MESSAGING =====
  {
    id: "message-queue",
    name: "Message Queue",
    category: "Messaging",
    emoji: "📨",
    pickItWhen: "Producer is faster than consumer or work must survive crashes",
    mainTradeoff: "At-least-once delivery needs idempotent consumers",
    intent: "Decouple producers from consumers using a durable buffer that holds messages until they are processed.",
    problem: "Direct service-to-service calls create tight coupling and can't handle speed mismatches. If the consumer is slow or down, the producer backs up or fails. Long-running tasks block the request thread.",
    solution: "Producers publish messages to a queue. The queue durably stores them. Consumers pull and process messages at their own pace. Messages are acknowledged and removed only after successful processing — unacknowledged messages are redelivered. Dead-letter queues capture messages that repeatedly fail.",
    whenToUse: [
      "Async background jobs: emails, notifications, report generation, video encoding",
      "Traffic shaping: absorbing bursts so downstream services aren't overwhelmed",
      "Guaranteed delivery: tasks must not be lost even if consumer crashes",
      "Work distribution: multiple consumers compete for tasks from one queue (fan-out work)"
    ],
    pros: [
      "Producer and consumer fully decoupled — can scale, deploy, fail independently",
      "Durable — messages survive consumer restarts",
      "Natural backpressure — queue depth signals when to scale consumers"
    ],
    cons: [
      "At-least-once delivery means consumers must be idempotent",
      "Message ordering only guaranteed per-partition (not globally)",
      "Queue becomes a bottleneck if not scaled (partitioned queues mitigate this)"
    ],
    realWorldExamples: [
      "AWS SQS — the canonical managed message queue (billions of messages/day)",
      "RabbitMQ — popular for task queues in microservices (AMQP protocol)",
      "Celery + Redis/RabbitMQ — Python async task queue (Django standard)",
      "Sidekiq — Ruby background job processing with Redis"
    ],
    codeExample: `// AWS SQS producer + consumer with dead-letter queue
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({ region: 'us-east-1' });
const QUEUE_URL = process.env.SQS_QUEUE_URL!;

// Producer: enqueue a job
async function enqueueEmailJob(job: EmailJob): Promise<void> {
  await sqs.send(new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(job),
    MessageGroupId: job.userId, // FIFO: group by user for ordering
    MessageDeduplicationId: job.idempotencyKey, // exactly-once within 5 min
  }));
}

// Consumer: process messages with at-least-once semantics
async function startWorker(): Promise<void> {
  while (true) {
    const { Messages = [] } = await sqs.send(new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20, // long polling — reduces empty receives
    }));

    await Promise.all(Messages.map(async (msg) => {
      const job = JSON.parse(msg.Body!) as EmailJob;
      try {
        await sendEmail(job); // idempotent: same email twice is OK
        await sqs.send(new DeleteMessageCommand({
          QueueUrl: QUEUE_URL,
          ReceiptHandle: msg.ReceiptHandle!,
        })); // ack: remove from queue
      } catch (err) {
        console.error('Job failed, will retry:', err);
        // Don't delete — SQS will redeliver after visibility timeout
        // After maxReceiveCount, moves to DLQ automatically
      }
    }));
  }
}`,
    relatedPatterns: ["pub-sub", "event-driven", "retry-pattern"]
  },

  {
    id: "pub-sub",
    name: "Publish-Subscribe",
    category: "Messaging",
    emoji: "📡",
    pickItWhen: "One event must trigger multiple independent consumers",
    mainTradeoff: "No guarantee on consumer processing order or completion",
    intent: "Publishers broadcast events to a topic without knowing who will receive them; subscribers independently consume from topics they care about.",
    problem: "Point-to-point messaging creates N×M coupling — every producer knows every consumer. Adding a new consumer requires changing producers. One event triggering multiple actions requires coordinating a fan-out.",
    solution: "Publishers send messages to named topics/channels, not to specific consumers. Subscribers declare which topics they care about and receive copies of every matching message. The broker handles fan-out. Producers and consumers are completely decoupled.",
    whenToUse: [
      "One event must trigger multiple independent reactions (order placed → billing + fulfillment + notification)",
      "Event broadcasting to unknown number of consumers (real-time dashboards, live feeds)",
      "Cross-service communication in event-driven microservice architectures",
      "Fan-out notifications: one message → millions of mobile push notifications"
    ],
    pros: [
      "Complete decoupling — producers don't know or care who's subscribed",
      "Easy fan-out — add new consumers without changing producers",
      "Consumers can subscribe/unsubscribe dynamically at runtime"
    ],
    cons: [
      "No guaranteed delivery to all subscribers if one crashes (depends on broker)",
      "Message ordering across subscribers not guaranteed",
      "Debugging harder — hard to trace which consumers processed which events"
    ],
    realWorldExamples: [
      "Google Pub/Sub — global pub/sub for large-scale event distribution",
      "AWS SNS + SQS fan-out pattern: SNS topic fans out to multiple SQS queues",
      "Apache Kafka topics with consumer groups — each group gets all messages",
      "Redis Pub/Sub for real-time WebSocket event broadcasting"
    ],
    codeExample: `// Simple pub/sub with typed events using EventEmitter pattern
type EventMap = {
  'order.placed':   { orderId: string; userId: string; total: number };
  'user.registered': { userId: string; email: string };
  'payment.failed': { orderId: string; reason: string };
};

class TypedEventBus {
  private listeners = new Map<string, Array<(data: unknown) => Promise<void>>>();

  subscribe<K extends keyof EventMap>(
    event: K,
    handler: (data: EventMap[K]) => Promise<void>
  ): () => void {
    const handlers = this.listeners.get(event) ?? [];
    handlers.push(handler as (data: unknown) => Promise<void>);
    this.listeners.set(event, handlers);
    return () => { /* unsubscribe */ };
  }

  async publish<K extends keyof EventMap>(event: K, data: EventMap[K]): Promise<void> {
    const handlers = this.listeners.get(event) ?? [];
    // Fan-out: all subscribers get the same event concurrently
    await Promise.allSettled(handlers.map(h => h(data)));
  }
}

const bus = new TypedEventBus();

// Three independent consumers for the same event
bus.subscribe('order.placed', async ({ orderId }) => sendConfirmationEmail(orderId));
bus.subscribe('order.placed', async ({ orderId }) => startFulfillment(orderId));
bus.subscribe('order.placed', async ({ total })   => updateRevenueMetrics(total));

// Producer doesn't know about any of them
await bus.publish('order.placed', { orderId: 'ord_123', userId: 'u_456', total: 99.99 });`,
    relatedPatterns: ["message-queue", "event-driven", "event-sourcing"]
  },

  {
    id: "event-driven",
    name: "Event-Driven Architecture",
    category: "Messaging",
    emoji: "⚡",
    pickItWhen: "Services need to react to changes without polling or tight coupling",
    mainTradeoff: "Hard to trace request flow across async hops",
    intent: "Design system components to communicate exclusively through events — immutable records of things that happened — rather than direct calls or shared databases.",
    problem: "Direct service calls create cascading failures and tight temporal coupling. Service A must be up for Service B to work. Adding new behavior means modifying existing services. Long synchronous chains block threads.",
    solution: "Services emit events when their state changes. Other services subscribe and react. No service knows about others directly. Services are independently deployable. The event log becomes the communication backbone. Combine with event sourcing for full auditability.",
    whenToUse: [
      "Complex business workflows spanning multiple services (e-commerce order lifecycle)",
      "Real-time pipelines: user action → enrichment → ML inference → notification",
      "When services must evolve independently without coordinating deploys",
      "Audit trails: every state change is captured as an immutable event"
    ],
    pros: [
      "Maximum decoupling — services don't know each other exist",
      "Natural scalability — consumers scale independently of producers",
      "Complete audit trail — event log captures full history"
    ],
    cons: [
      "Distributed tracing required to follow a request across event hops",
      "Eventual consistency — services see state at different times",
      "Schema evolution of events is a contract that must be managed carefully"
    ],
    realWorldExamples: [
      "Uber's real-time dispatch: every driver/rider event flows through Kafka topics",
      "LinkedIn's data pipeline processes billions of member activity events daily",
      "AWS EventBridge routing events between hundreds of AWS services",
      "Shopify's order lifecycle: placed → payment → fulfillment all via events"
    ],
    codeExample: `// Event-driven order lifecycle with typed events and Kafka

interface DomainEvent<T = unknown> {
  eventId:   string;
  eventType: string;
  aggregateId: string;
  occurredAt: Date;
  payload:   T;
}

// Each service handles its own domain events and emits new ones
class FulfillmentService {
  constructor(
    private readonly kafka: KafkaClient,
    private readonly warehouseClient: WarehouseClient
  ) {
    // Subscribe to payment events
    kafka.subscribe('payments.completed', this.handlePaymentCompleted.bind(this));
  }

  private async handlePaymentCompleted(
    event: DomainEvent<{ orderId: string; amount: number }>
  ): Promise<void> {
    const { orderId } = event.payload;

    // Do fulfillment work
    const shipment = await this.warehouseClient.createShipment(orderId);

    // Emit new event — no direct call to notification service
    await this.kafka.publish<DomainEvent>('fulfillment.shipment-created', {
      eventId:     crypto.randomUUID(),
      eventType:   'fulfillment.shipment-created',
      aggregateId: orderId,
      occurredAt:  new Date(),
      payload:     { orderId, trackingNumber: shipment.tracking },
    });
  }
}

// NotificationService subscribes to fulfillment.shipment-created independently
// No coupling between FulfillmentService and NotificationService`,
    relatedPatterns: ["pub-sub", "event-sourcing", "message-queue", "saga"]
  },

  {
    id: "stream-processing",
    name: "Stream Processing",
    category: "Messaging",
    emoji: "🌊",
    pickItWhen: "Continuous real-time data must be transformed or aggregated",
    mainTradeoff: "Exactly-once processing is complex",
    intent: "Process continuous, unbounded streams of data records in real-time or near-real-time as they arrive, rather than batching them.",
    problem: "Batch jobs process data hours after it arrives — fraud must be detected in milliseconds, not the next morning. Storing raw events and processing them later creates unbounded storage growth.",
    solution: "Events flow into stream processors continuously. Processing topologies apply transformations (filter, map, aggregate, join) in a DAG of operators. Windowing groups events by time (tumbling, sliding, session windows). State stores hold running aggregates. Output goes to sinks (DB, dashboard, another stream).",
    whenToUse: [
      "Fraud detection: score each transaction within 50ms of it occurring",
      "Real-time analytics: live user dashboards updating every second",
      "IoT telemetry: process sensor readings and trigger alerts immediately",
      "Log aggregation: tail logs from thousands of servers, alert on patterns"
    ],
    pros: [
      "Low latency — seconds or milliseconds vs. hours for batch",
      "Continuous output — dashboards and alerts update in real time",
      "Backpressure mechanisms prevent overwhelming downstream systems"
    ],
    cons: [
      "Exactly-once semantics require careful checkpoint design",
      "Out-of-order events require watermarks and late-arrival handling",
      "Stateful streaming (aggregations) requires distributed state management"
    ],
    realWorldExamples: [
      "Apache Flink: LinkedIn, Netflix, Uber for real-time stream processing",
      "Apache Kafka Streams: stateful stream processing embedded in services",
      "AWS Kinesis Data Analytics for real-time SQL on event streams",
      "Spark Structured Streaming for micro-batch stream processing"
    ],
    codeExample: `// Kafka Streams: real-time fraud scoring pipeline (Java-style pseudocode in TS)

class FraudDetectionPipeline {
  run(): void {
    const builder = new StreamsBuilder();

    // Source: raw transaction events
    const transactions = builder.stream<string, Transaction>('raw-transactions');

    // 1. Enrich with user profile
    const enriched = transactions.mapValues(async (tx) => ({
      ...tx,
      userProfile: await userService.getProfile(tx.userId),
    }));

    // 2. Aggregate: count transactions per user in last 5 minutes (tumbling window)
    const txCountPerUser = enriched
      .groupByKey()
      .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(5)))
      .count() // running count per user per window
      .toStream();

    // 3. Join count with original tx to get context
    const scored = enriched.join(
      txCountPerUser,
      (tx, count) => ({ ...tx, recentCount: count }),
      JoinWindows.ofTimeDifferenceWithNoGrace(Duration.ofMinutes(5))
    );

    // 4. Filter suspicious: >10 transactions in 5 min
    const flagged = scored.filter((_, tx) => tx.recentCount > 10);

    // 5. Sink: alerts topic
    flagged.to('fraud-alerts');

    const streams = new KafkaStreams(builder.build(), config);
    streams.start();
  }
}`,
    relatedPatterns: ["message-queue", "pub-sub", "event-driven"]
  },

  {
    id: "webhook",
    name: "Webhook Pattern",
    category: "Messaging",
    emoji: "🪝",
    pickItWhen: "Third-party events must trigger your system without polling",
    mainTradeoff: "Your endpoint must be publicly reachable and reliable",
    intent: "Allow external systems to push event notifications to your application via HTTP POST, eliminating the need for polling.",
    problem: "Polling a third-party API for updates (\"did payment succeed yet?\") is inefficient, adds latency, and burns rate-limit quota. Most APIs can't push data to you unless you expose an endpoint.",
    solution: "You register a publicly accessible HTTPS endpoint (the webhook) with the third-party service. When an event occurs (payment completed, PR merged, file uploaded), the service sends an HTTP POST to your endpoint with event data. You respond with 200 OK quickly and process asynchronously.",
    whenToUse: [
      "Payment providers (Stripe, PayPal) notifying your app of payment events",
      "GitHub/GitLab webhooks triggering CI/CD pipelines on push/PR events",
      "SaaS integrations: Slack, Twilio, Shopify all use webhooks",
      "Any scenario where polling a third-party API is costly or too slow"
    ],
    pros: [
      "Real-time push — events arrive instantly without polling overhead",
      "Reduces API rate limit usage (no polling requests)",
      "Simple integration — just expose an HTTP endpoint"
    ],
    cons: [
      "Requires public endpoint (complicates local development — use ngrok/tunnel)",
      "Must respond quickly (≤5s usually) or the sender times out and retries",
      "Need to verify webhook signatures to prevent spoofing"
    ],
    realWorldExamples: [
      "Stripe webhooks for payment.succeeded, charge.failed events",
      "GitHub webhooks triggering GitHub Actions or Jenkins CI",
      "Twilio webhooks for SMS delivery receipts and inbound messages",
      "Shopify order.created webhook triggering fulfillment workflows"
    ],
    codeExample: `import { createHmac, timingSafeEqual } from 'crypto';
import express from 'express';

const app = express();
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// Raw body needed for signature verification — must come before json()
app.post('/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    // 1. Verify signature — prevents spoofed requests
    const signature = req.headers['stripe-signature'] as string;
    const expectedSig = createHmac('sha256', WEBHOOK_SECRET)
      .update(req.body)
      .digest('hex');

    const receivedSig = signature.split(',')
      .find(s => s.startsWith('v1='))?.slice(3) ?? '';

    if (!timingSafeEqual(Buffer.from(expectedSig), Buffer.from(receivedSig))) {
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(req.body.toString());

    // 2. Respond immediately — never block webhook handler on business logic
    res.json({ received: true });

    // 3. Process asynchronously via queue (webhook retries if queue enqueue fails)
    await jobQueue.enqueue('process-stripe-event', {
      eventId:   event.id,
      eventType: event.type,
      payload:   event.data.object,
    });
  }
);`,
    relatedPatterns: ["message-queue", "pub-sub", "retry-pattern"]
  },

  // ===== RELIABILITY =====
  {
    id: "retry-pattern",
    name: "Retry Pattern",
    category: "Reliability",
    emoji: "🔁",
    pickItWhen: "Transient network/service errors are expected",
    mainTradeoff: "Amplifies load during outages without backoff + jitter",
    intent: "Automatically retry failed operations with a backoff strategy to recover from transient faults without burdening the caller.",
    problem: "Distributed systems experience transient failures — network blips, brief service overloads, DNS timeouts. Immediately failing on the first error leads to poor user experience for recoverable situations.",
    solution: "Wrap operations in a retry loop. On failure, wait (exponential backoff: 100ms, 200ms, 400ms…) and retry up to N times. Add random jitter to the wait to prevent thundering herd (all retries hitting at the same time). Only retry on retryable errors (5xx, timeouts) — never on 4xx (client errors).",
    whenToUse: [
      "External API calls (payment processors, email services) with occasional timeouts",
      "Database connections during brief network partitions",
      "Blob storage uploads that may fail on large files",
      "Any I/O operation where transient failure is expected at scale"
    ],
    pros: [
      "Handles transient faults transparently without burdening callers",
      "Improves perceived reliability — most transient errors resolve within 1-2 retries",
      "Simple to implement with exponential backoff + jitter"
    ],
    cons: [
      "Without backoff, retry storms amplify failing services",
      "Can mask deeper issues — underlying problem should still be alerted on",
      "Must distinguish retryable (503) from non-retryable (404) errors"
    ],
    realWorldExamples: [
      "AWS SDK automatic retry with exponential backoff on throttled calls",
      "Kubernetes pod restart policy (Always/OnFailure) is a retry pattern",
      "Browser XHR/fetch libraries with retry middleware (axios-retry)",
      "Database connection pool reconnect on lost connection"
    ],
    codeExample: `interface RetryOptions {
  maxAttempts:  number;
  baseDelayMs:  number;
  maxDelayMs:   number;
  retryOn?:     (err: unknown) => boolean;
}

async function withRetry<T>(
  operation: () => Promise<T>,
  opts: RetryOptions
): Promise<T> {
  const { maxAttempts, baseDelayMs, maxDelayMs } = opts;
  const isRetryable = opts.retryOn ?? (() => true);

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;

      if (attempt === maxAttempts || !isRetryable(err)) throw err;

      // Exponential backoff with full jitter — prevents thundering herd
      const exponential = baseDelayMs * Math.pow(2, attempt - 1);
      const capped       = Math.min(exponential, maxDelayMs);
      const jittered     = Math.random() * capped; // full jitter

      console.warn(\`Attempt \${attempt}/\${maxAttempts} failed, retrying in \${Math.round(jittered)}ms\`, err);
      await new Promise(r => setTimeout(r, jittered));
    }
  }
  throw lastError;
}

// Usage: only retry on server errors, not client errors
const user = await withRetry(
  () => fetch('/api/users/123').then(r => r.json()),
  {
    maxAttempts: 4,
    baseDelayMs: 100,
    maxDelayMs:  5000,
    retryOn: (err) => err instanceof NetworkError || (err as any).status >= 500,
  }
);`,
    relatedPatterns: ["circuit-breaker", "bulkhead", "rate-limiting"]
  },

  {
    id: "rate-limiting",
    name: "Rate Limiting",
    category: "Reliability",
    emoji: "🚦",
    pickItWhen: "Protect services from abusive or runaway clients",
    mainTradeoff: "Legitimate traffic may be throttled during bursts",
    intent: "Restrict how many requests a client can make in a time window to protect services from overload and abuse.",
    problem: "Without limits, a single buggy client, a DoS attack, or a traffic spike can exhaust server resources and cause complete outages for all users. Costly downstream APIs get overcharged.",
    solution: "Track request counts per client (by IP, API key, or userId) in a time window. Common algorithms: Token Bucket (steady rate + burst), Leaky Bucket (strict rate), Sliding Window (smooth counting), Fixed Window (simpler but allows boundary spikes). Reject excess requests with HTTP 429 + Retry-After header.",
    whenToUse: [
      "Public APIs to prevent abuse and ensure fair usage",
      "Login endpoints to prevent brute-force attacks",
      "Third-party API clients to stay within provider rate limits",
      "Protecting expensive operations (ML inference, PDF generation)"
    ],
    pros: [
      "Protects services from overload regardless of traffic source",
      "Fair usage enforcement across tenants in multi-tenant systems",
      "Defense layer against DoS/brute-force attacks"
    ],
    cons: [
      "Legitimate burst traffic gets throttled (mitigated by token bucket)",
      "Distributed rate limiting across multiple servers requires shared state (Redis)",
      "Choosing the right limits requires traffic analysis"
    ],
    realWorldExamples: [
      "GitHub API: 5000 requests/hour per authenticated user",
      "Stripe API: 100 req/s per key, with per-endpoint limits",
      "Nginx limit_req_zone module for request-rate limiting at the edge",
      "Cloudflare Rate Limiting rules at DNS/CDN level"
    ],
    codeExample: `// Token Bucket rate limiter using Redis (distributed, works across instances)
class TokenBucketRateLimiter {
  constructor(
    private readonly redis: RedisClient,
    private readonly capacity: number,     // max tokens (burst size)
    private readonly refillRate: number,   // tokens added per second
  ) {}

  async isAllowed(clientId: string): Promise<{ allowed: boolean; remaining: number }> {
    const key = \`ratelimit:\${clientId}\`;
    const now = Date.now() / 1000; // seconds

    // Atomic Lua script — prevents race conditions in distributed env
    const script = \`
      local tokens    = tonumber(redis.call('HGET', KEYS[1], 'tokens') or ARGV[1])
      local lastRefill = tonumber(redis.call('HGET', KEYS[1], 'ts')     or ARGV[2])
      local capacity  = tonumber(ARGV[1])
      local rate      = tonumber(ARGV[3])
      local now       = tonumber(ARGV[2])

      -- Refill tokens based on elapsed time
      local elapsed = math.max(0, now - lastRefill)
      tokens = math.min(capacity, tokens + elapsed * rate)

      local allowed = 0
      if tokens >= 1 then
        tokens   = tokens - 1
        allowed  = 1
      end

      redis.call('HSET',    KEYS[1], 'tokens', tokens, 'ts', now)
      redis.call('EXPIRE',  KEYS[1], 3600)
      return { allowed, math.floor(tokens) }
    \`;

    const [allowed, remaining] = await this.redis.eval(
      script, 1, key,
      String(this.capacity), String(now), String(this.refillRate)
    ) as [number, number];

    return { allowed: allowed === 1, remaining };
  }
}

// Express middleware
const limiter = new TokenBucketRateLimiter(redis, 100, 10); // 100 burst, 10/s

app.use(async (req, res, next) => {
  const { allowed, remaining } = await limiter.isAllowed(req.ip);
  res.set('X-RateLimit-Remaining', String(remaining));
  if (!allowed) return res.status(429).json({ error: 'Rate limit exceeded' });
  next();
});`,
    relatedPatterns: ["circuit-breaker", "retry-pattern", "bulkhead"]
  },

  {
    id: "failover",
    name: "Failover",
    category: "Reliability",
    emoji: "🔄",
    pickItWhen: "Zero-downtime is required when a primary server fails",
    mainTradeoff: "Split-brain risk in automatic failover",
    intent: "Automatically switch to a redundant standby system when the primary fails, maintaining service availability.",
    problem: "Hardware fails, processes crash, data centers lose power. Without a failover strategy, every infrastructure failure is user-visible downtime that can last hours until manual intervention.",
    solution: "Maintain one or more standby replicas in sync with the primary. A health monitor (or consensus group) detects primary failure via heartbeat timeout. Failover promotes a standby to primary and updates DNS/load-balancer config to route traffic to the new primary. Active-passive: one hot standby. Active-active: multiple active nodes share load.",
    whenToUse: [
      "Databases: PostgreSQL primary-replica with automatic promotion (Patroni, RDS Multi-AZ)",
      "Redis Sentinel for automatic Redis master failover",
      "Any stateful service with high availability SLA (99.9%+)",
      "Cross-region disaster recovery (primary region fails, DR region activates)"
    ],
    pros: [
      "Near-zero-downtime recovery from infrastructure failures (seconds to minutes)",
      "Automated — no on-call engineer intervention for common failure modes",
      "Active-active provides both HA and horizontal scaling"
    ],
    cons: [
      "Split-brain: both nodes think they're primary if network partitions (mitigated by fencing)",
      "Data loss window: async replication means some committed transactions may not be on standby",
      "Failover itself can cause brief disruption (DNS TTL, connection resets)"
    ],
    realWorldExamples: [
      "AWS RDS Multi-AZ: automatic failover to standby in <60s on primary failure",
      "Redis Sentinel: monitors master, elects new master when it goes down",
      "Patroni + etcd: distributed consensus for PostgreSQL HA",
      "AWS Route 53 health checks + failover routing for DNS-based failover"
    ],
    codeExample: `// Application-level failover for database connections
class HighAvailabilityDB {
  private primaryUrl: string;
  private replicaUrls: string[];
  private activeConnection: DatabaseConnection;
  private isPrimary = true;

  constructor(primaryUrl: string, replicaUrls: string[]) {
    this.primaryUrl  = primaryUrl;
    this.replicaUrls = replicaUrls;
    this.activeConnection = new DatabaseConnection(primaryUrl);
    this.startHealthMonitor();
  }

  async write(query: string, params: unknown[]): Promise<void> {
    if (!this.isPrimary) throw new Error('Currently in read-only failover mode');
    return this.activeConnection.execute(query, params);
  }

  async read<T>(query: string, params: unknown[]): Promise<T> {
    return this.activeConnection.query<T>(query, params);
  }

  private startHealthMonitor(): void {
    setInterval(async () => {
      try {
        await this.activeConnection.ping();
      } catch {
        console.error('Primary failed — initiating failover');
        await this.failover();
      }
    }, 5000);
  }

  private async failover(): Promise<void> {
    for (const replicaUrl of this.replicaUrls) {
      try {
        this.activeConnection = new DatabaseConnection(replicaUrl);
        await this.activeConnection.ping();
        this.isPrimary = false; // Read-only until proper promotion
        console.log(\`Failover succeeded: now using \${replicaUrl}\`);
        // In production: trigger PagerDuty alert + promotion script
        return;
      } catch { continue; }
    }
    throw new Error('All replicas unreachable — complete outage');
  }
}`,
    relatedPatterns: ["circuit-breaker", "leader-election", "retry-pattern"]
  },

  {
    id: "leader-election",
    name: "Leader Election",
    category: "Reliability",
    emoji: "👑",
    pickItWhen: "Exactly one node must perform a task in a cluster",
    mainTradeoff: "Consensus protocol adds latency and complexity",
    intent: "Ensure exactly one node in a distributed cluster acts as the leader for coordinating tasks, while others stand by to take over if the leader fails.",
    problem: "In a cluster of N nodes, certain tasks must run exactly once (cron jobs, partition assignment, write coordination). Without coordination, multiple nodes do the same work (duplicate processing) or none do (nothing runs when one dies).",
    solution: "Nodes compete for a distributed lock (in Redis, ZooKeeper, etcd, or a DB). The winner becomes the leader. The leader periodically renews its lease. If renewal fails (leader crashed or network partition), the lock expires and another node wins the next election. Raft and Paxos are consensus algorithms that formalize this process.",
    whenToUse: [
      "Distributed cron: ensure only one node runs a scheduled job",
      "Kafka partition leader election for partition ownership",
      "Database write coordination (Patroni, etcd for PostgreSQL HA)",
      "Singleton jobs that must not run concurrently (cleanup tasks, index rebuilds)"
    ],
    pros: [
      "Prevents split-brain work duplication without manual coordination",
      "Automatic failover when leader dies — follower wins election in seconds",
      "Works across any number of nodes without configuration changes"
    ],
    cons: [
      "Consensus adds round-trip latency to leader changes",
      "Leader can become a bottleneck if too much work is funneled through it",
      "Network partitions can cause false failovers (GC pause looks like crash)"
    ],
    realWorldExamples: [
      "Apache ZooKeeper: original distributed coordination service for Hadoop/Kafka",
      "etcd with Raft consensus: used by Kubernetes for all cluster state",
      "Redis SETNX + EXPIRE: simple distributed lock for leader election",
      "Kafka controller election: broker leader election via ZooKeeper/KRaft"
    ],
    codeExample: `// Redis-based leader election with lease renewal
class LeaderElection {
  private readonly leaderKey: string;
  private readonly nodeId: string;
  private isLeader = false;
  private renewalTimer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly redis: RedisClient,
    private readonly jobName: string,
    private readonly leaseTtlMs = 15_000,  // 15s lease
    private readonly renewIntervalMs = 5_000 // renew every 5s
  ) {
    this.leaderKey = \`leader:\${jobName}\`;
    this.nodeId = \`node:\${process.env.POD_NAME ?? crypto.randomUUID()}\`;
  }

  async tryBecomeLeader(): Promise<boolean> {
    // SET key value NX PX ttl — atomic: set only if not exists
    const result = await this.redis.set(
      this.leaderKey, this.nodeId,
      { NX: true, PX: this.leaseTtlMs }
    );

    if (result === 'OK') {
      this.isLeader = true;
      this.startRenewal();
      console.log(\`[\${this.nodeId}] Elected as leader for \${this.jobName}\`);
    }
    return this.isLeader;
  }

  private startRenewal(): void {
    this.renewalTimer = setInterval(async () => {
      const current = await this.redis.get(this.leaderKey);
      if (current !== this.nodeId) {
        // Lost leadership (e.g., lease expired during GC pause)
        this.isLeader = false;
        clearInterval(this.renewalTimer);
        return;
      }
      await this.redis.pExpire(this.leaderKey, this.leaseTtlMs);
    }, this.renewIntervalMs);
  }

  async runIfLeader(task: () => Promise<void>): Promise<void> {
    if (await this.tryBecomeLeader()) {
      await task();
    }
  }
}

// Usage: distributed cron — only one instance runs the job
const election = new LeaderElection(redis, 'daily-cleanup');
setInterval(() => election.runIfLeader(runDailyCleanup), 60_000);`,
    relatedPatterns: ["failover", "circuit-breaker", "saga"]
  },

  // ===== MICROSERVICES =====
  {
    id: "distributed-transactions",
    name: "Distributed Transactions",
    category: "Microservices",
    emoji: "💱",
    pickItWhen: "Data consistency required across multiple services/DBs",
    mainTradeoff: "2PC blocks; Saga trades ACID for availability",
    intent: "Coordinate a transaction that spans multiple databases or services so that either all operations succeed or all are rolled back.",
    problem: "Microservices have separate databases. A business operation (place order: debit wallet + create order + reserve inventory) spans three services. If step 2 fails, step 1's debit must be reversed. You can't use a single DB transaction.",
    solution: "Two main approaches: Two-Phase Commit (2PC) — a coordinator locks all participants, then commits (strongly consistent but slow, blocks on failure). Saga pattern — the preferred microservices approach: chain of local transactions, each publishing an event; compensating transactions roll back on failure (eventually consistent, highly available).",
    whenToUse: [
      "Financial operations spanning wallet + order + inventory services",
      "Multi-step booking: flight + hotel + car simultaneously",
      "Any business operation where partial completion is worse than no operation",
      "Microservice decomposition of a previously monolithic ACID transaction"
    ],
    pros: [
      "Enables data consistency across service boundaries",
      "Saga avoids distributed locks — each service commits locally",
      "Compensating transactions make rollback explicit and auditable"
    ],
    cons: [
      "2PC creates distributed locks and is vulnerable to coordinator failure",
      "Sagas only achieve eventual consistency — not immediate ACID consistency",
      "Compensating transactions are hard to write correctly for all failure modes"
    ],
    realWorldExamples: [
      "Stripe: multi-step payment involves charge + transfer + payout — saga-like",
      "Amazon's original 'eventually consistent' order system vs. monolith ACID",
      "Temporal.io workflow engine implements saga compensation automatically",
      "Spring Cloud Sleuth + Saga orchestration for Java microservices"
    ],
    codeExample: `// Saga orchestration pattern for order placement
// Each step has a compensating transaction

interface SagaStep<T> {
  execute:    () => Promise<T>;
  compensate: (result: T) => Promise<void>; // undo if later step fails
}

class SagaOrchestrator {
  private completed: Array<{ compensate: () => Promise<void> }> = [];

  async run(steps: SagaStep<unknown>[]): Promise<void> {
    for (const step of steps) {
      try {
        const result = await step.execute();
        // Register compensation for this step in case a later step fails
        this.completed.push({ compensate: () => step.compensate(result) });
      } catch (err) {
        console.error('Step failed, running compensating transactions:', err);
        await this.rollback();
        throw err;
      }
    }
  }

  private async rollback(): Promise<void> {
    // Compensate in reverse order
    for (const step of [...this.completed].reverse()) {
      try { await step.compensate(); }
      catch (e) { console.error('Compensation failed — needs manual intervention:', e); }
    }
  }
}

// Usage: place order saga
const saga = new SagaOrchestrator();
await saga.run([
  {
    execute:    () => walletService.debit(userId, amount),
    compensate: () => walletService.credit(userId, amount),     // refund
  },
  {
    execute:    () => orderService.create(userId, items),
    compensate: (orderId) => orderService.cancel(orderId as string),
  },
  {
    execute:    () => inventoryService.reserve(items),
    compensate: () => inventoryService.release(items),          // unreserve
  },
]);`,
    relatedPatterns: ["saga", "event-sourcing", "event-driven"]
  },

  {
    id: "service-discovery",
    name: "Service Discovery",
    category: "Microservices",
    emoji: "🔍",
    pickItWhen: "Service instances scale dynamically and IPs change",
    mainTradeoff: "Registry becomes a critical dependency",
    intent: "Allow services to find each other's network locations dynamically without hardcoded configuration.",
    problem: "In a microservice cluster, service instances start/stop constantly (auto-scaling, deployments, crashes). Hardcoded IPs break immediately. DNS TTLs are too slow for second-by-second changes.",
    solution: "Client-side discovery: each service registers itself with a service registry (Consul, Eureka) on startup and deregisters on shutdown. Callers query the registry to get live instance lists, then load-balance among them. Server-side discovery: a load balancer queries the registry and routes; services don't need registry clients.",
    whenToUse: [
      "Container orchestration (Kubernetes) — pods get new IPs on every restart",
      "Auto-scaling groups where instance count changes constantly",
      "Multi-region deployments where service topology differs by region",
      "Any microservice architecture with more than ~5 services"
    ],
    pros: [
      "Services find each other without configuration changes or deployments",
      "Dead instances are automatically removed (via TTL or health checks)",
      "Enables advanced routing (canary, blue-green) via registry metadata"
    ],
    cons: [
      "Service registry is a new critical infrastructure component to operate",
      "Client-side discovery requires a registry client library in every language",
      "Brief inconsistency window between instance failure and registry update"
    ],
    realWorldExamples: [
      "Kubernetes CoreDNS: service discovery via DNS (service-name.namespace.svc.cluster.local)",
      "HashiCorp Consul: service registry + health checks + KV store",
      "Netflix Eureka: Java-based service registry for Spring Cloud",
      "AWS Cloud Map: managed service registry integrated with ECS/EKS"
    ],
    codeExample: `// Service registry + client-side discovery
class ServiceRegistry {
  private registry = new Map<string, Set<string>>(); // serviceName -> {url}
  private heartbeats = new Map<string, number>();

  register(serviceName: string, instanceUrl: string): () => void {
    if (!this.registry.has(serviceName)) this.registry.set(serviceName, new Set());
    this.registry.get(serviceName)!.add(instanceUrl);
    this.heartbeats.set(instanceUrl, Date.now());

    console.log(\`Registered \${instanceUrl} for \${serviceName}\`);

    // Return deregister function for graceful shutdown
    return () => this.deregister(serviceName, instanceUrl);
  }

  deregister(serviceName: string, instanceUrl: string): void {
    this.registry.get(serviceName)?.delete(instanceUrl);
    this.heartbeats.delete(instanceUrl);
  }

  getInstances(serviceName: string): string[] {
    const now = Date.now();
    const ttl = 30_000; // 30s TTL — stale instances removed
    return [...(this.registry.get(serviceName) ?? [])]
      .filter(url => (now - (this.heartbeats.get(url) ?? 0)) < ttl);
  }
}

class DiscoveryClient {
  private roundRobinIndex = 0;

  constructor(private readonly registry: ServiceRegistry) {}

  resolve(serviceName: string): string {
    const instances = this.registry.getInstances(serviceName);
    if (instances.length === 0) throw new Error(\`No instances of \${serviceName}\`);
    const url = instances[this.roundRobinIndex % instances.length];
    this.roundRobinIndex++;
    return url;
  }

  async call<T>(serviceName: string, path: string): Promise<T> {
    const baseUrl = this.resolve(serviceName);
    const res = await fetch(\`\${baseUrl}\${path}\`);
    return res.json();
  }
}`,
    relatedPatterns: ["api-gateway", "service-mesh", "load-balancing"]
  },

  {
    id: "api-gateway",
    name: "API Gateway",
    category: "Microservices",
    emoji: "🚪",
    pickItWhen: "Single entry point needed for multiple backend services",
    mainTradeoff: "Gateway becomes a critical bottleneck and SPOF",
    intent: "Provide a single entry point for clients that routes requests to the appropriate microservice, handling cross-cutting concerns at the edge.",
    problem: "With dozens of microservices, clients must know every service's URL and implement auth, rate limiting, and SSL termination themselves. Any refactoring of the internal service topology breaks all clients.",
    solution: "An API Gateway sits in front of all services. It handles routing (path-based or header-based), authentication/authorization, SSL termination, rate limiting, request/response transformation, and fan-out (BFF aggregation). Clients talk only to the gateway. The internal topology is hidden.",
    whenToUse: [
      "Microservice architecture where clients shouldn't know about internal topology",
      "Mobile/web BFF (Backend for Frontend): aggregate multiple service calls into one",
      "Centralizing cross-cutting concerns: auth, logging, rate limiting, A/B testing",
      "API versioning and gradual migration (route v1 → old service, v2 → new service)"
    ],
    pros: [
      "Single entry point simplifies client-side code significantly",
      "Cross-cutting concerns implemented once, not in every service",
      "Internal service topology can change without affecting external clients"
    ],
    cons: [
      "Single point of failure — must be highly available",
      "Can become a bottleneck — all traffic funnels through it",
      "Latency added for every request (another network hop)"
    ],
    realWorldExamples: [
      "AWS API Gateway: managed gateway for Lambda and HTTP backend routes",
      "Kong Gateway: open-source gateway with plugin ecosystem",
      "Netflix Zuul/Falcor: Netflix's internal API gateway for BFF pattern",
      "GraphQL as an API gateway: single endpoint, multiple resolvers"
    ],
    codeExample: `// Minimal API gateway: routing + auth + rate limiting
import express, { Request, Response, NextFunction } from 'express';
import httpProxy from 'http-proxy-middleware';

const app = express();

// Service route map
const ROUTES: Record<string, string> = {
  '/api/users':    'http://user-service:3001',
  '/api/orders':   'http://order-service:3002',
  '/api/products': 'http://product-service:3003',
};

// 1. Auth middleware — runs before all routes
app.use(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    (req as any).user = await verifyJWT(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// 2. Rate limiting middleware (token bucket per user)
app.use(rateLimitMiddleware);

// 3. Request logging / distributed tracing
app.use((req, _res, next) => {
  req.headers['x-request-id'] ??= crypto.randomUUID();
  req.headers['x-user-id'] = (req as any).user?.id;
  next();
});

// 4. Dynamic proxy routing based on path prefix
for (const [pathPrefix, target] of Object.entries(ROUTES)) {
  app.use(pathPrefix, httpProxy.createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      error: (_err, _req, res) => (res as Response).status(502).json({ error: 'Service unavailable' }),
    },
  }));
}

app.listen(3000, () => console.log('API Gateway listening on :3000'));`,
    relatedPatterns: ["service-discovery", "service-mesh", "rate-limiting", "load-balancing"]
  },

  {
    id: "service-mesh",
    name: "Service Mesh",
    category: "Microservices",
    emoji: "🕸️",
    pickItWhen: "Service-to-service reliability and observability at scale",
    mainTradeoff: "Significant operational complexity to deploy and maintain",
    intent: "Manage service-to-service communication in a microservice cluster via a dedicated infrastructure layer of sidecar proxies, providing observability, security, and reliability transparently.",
    problem: "In a large microservice cluster, every service pair needs mTLS, retries, circuit breaking, tracing, and load balancing. Implementing these in every service in every language is untenable and error-prone.",
    solution: "Deploy a sidecar proxy (Envoy) alongside every service. Proxies form the data plane — they intercept all inter-service traffic and apply policies. A control plane (Istio, Linkerd control plane) manages policy configuration centrally. Services communicate as if directly; all reliability and security policies are applied transparently by the mesh.",
    whenToUse: [
      "Large clusters (50+ services) where per-service reliability logic is unmanageable",
      "Zero-trust networking: enforce mTLS between all services without code changes",
      "Unified observability: automatic distributed tracing across all service calls",
      "Traffic management: canary releases, A/B testing, blue-green deployments at mesh level"
    ],
    pros: [
      "Uniform security (mTLS), observability, and reliability across all services — no per-service code",
      "Language-agnostic — works equally for Node.js, Python, Go, Java",
      "Fine-grained traffic control (canary %, header-based routing) without deploys"
    ],
    cons: [
      "Significant operational complexity — mesh control plane is another distributed system to manage",
      "Sidecar proxy overhead per pod (memory + CPU, typically 50-200MB/pod)",
      "Debugging mesh-layer issues requires expertise in the mesh's own tooling"
    ],
    realWorldExamples: [
      "Istio + Envoy: most widely deployed service mesh in Kubernetes",
      "Linkerd: lightweight, Rust-based service mesh focused on simplicity",
      "AWS App Mesh: managed service mesh for ECS/EKS",
      "Consul Connect: HashiCorp's service mesh based on Consul service discovery"
    ],
    codeExample: `# Istio traffic management — zero code changes in services

# VirtualService: canary release (10% traffic to new version)
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: product-service
spec:
  hosts:
  - product-service
  http:
  - route:
    - destination:
        host: product-service
        subset: v1
      weight: 90   # 90% to stable version
    - destination:
        host: product-service
        subset: v2
      weight: 10   # 10% canary

---
# DestinationRule: retry + circuit breaker + mTLS — no service code needed
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: product-service
spec:
  host: product-service
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL   # automatic mTLS between all pods
    connectionPool:
      http:
        http1MaxPendingRequests: 100
        http2MaxRequests: 1000
    outlierDetection:      # circuit breaker at mesh level
      consecutiveErrors: 5
      interval: 10s
      baseEjectionTime: 30s
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2`,
    relatedPatterns: ["sidecar", "api-gateway", "circuit-breaker", "service-discovery"]
  }
];
