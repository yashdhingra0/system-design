export interface DesignPattern {
  id: string;
  name: string;
  category: 'Architectural' | 'Creational' | 'Structural' | 'Behavioral';
  emoji: string;
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
    category: "Architectural",
    emoji: "⚡",
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
    category: "Architectural",
    emoji: "🔗",
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
    category: "Architectural",
    emoji: "📊",
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
    category: "Architectural",
    emoji: "📜",
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
    category: "Architectural",
    emoji: "🚢",
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
    category: "Architectural",
    emoji: "🏍️",
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
  }
];
