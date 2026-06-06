export interface EvolutionStage {
  year: number;
  title: string;
  subtitle: string;
  scale: {
    users: string;
    requests: string;
    data: string;
  };
  stack: string[];
  architecture: string; // brief description
  keyDecisions: Array<{
    what: string;
    why: string;
    tradeoff: string;
  }>;
  painPoints: string[];
  color: string;
}

export interface SystemEvolution {
  id: string;
  company: string;
  emoji: string;
  tagline: string;
  lesson: string;
  stages: EvolutionStage[];
}

export const systemEvolutions: SystemEvolution[] = [
  {
    id: 'twitter',
    company: 'Twitter / X',
    emoji: '🐦',
    tagline: 'From a weekend project to the world\'s real-time public conversation layer',
    lesson: 'Scale forces you to break every assumption you started with. Fan-out on write works until it doesn\'t.',
    stages: [
      {
        year: 2006,
        title: 'The Weekend Hack',
        subtitle: 'Ruby on Rails monolith, single MySQL DB',
        scale: { users: '~1,000', requests: '<1K/day', data: 'MBs' },
        stack: ['Ruby on Rails', 'MySQL', 'Single server'],
        architecture: 'Everything in one Rails app. One MySQL database. Zero caching. Deployed on a single server. Jack Dorsey built the first prototype in two weeks.',
        keyDecisions: [
          {
            what: 'Rails monolith',
            why: 'Speed to market — needed to ship fast for TechCrunch 40',
            tradeoff: 'Zero scalability but 100% developer velocity',
          },
          {
            what: 'SMS-like 140 char limit',
            why: 'SMS had 160 chars, 140 left room for a username prefix',
            tradeoff: 'Constrained expression but created a unique product identity',
          },
        ],
        painPoints: ['No load balancing', 'No caching layer', 'Single point of failure on DB'],
        color: '#1da1f2',
      },
      {
        year: 2008,
        title: 'The Fail Whale Era',
        subtitle: 'Sharded MySQL, Memcache, multiple app servers',
        scale: { users: '1M+', requests: '~3M/day', data: 'GBs' },
        stack: ['Ruby on Rails', 'Sharded MySQL', 'Memcached', 'Nginx', 'Multiple app servers'],
        architecture: 'MySQL sharded by user_id. Memcache layer added in front. Multiple app servers behind Nginx load balancer. The infamous "Fail Whale" (site down page) becomes a cultural symbol of growing pains.',
        keyDecisions: [
          {
            what: 'Manual MySQL sharding',
            why: 'Single DB was overwhelmed during peak events (elections, sports)',
            tradeoff: 'Horizontal scale but complex cross-shard queries became impossible',
          },
          {
            what: 'Memcache for user timelines',
            why: 'Timeline reads (not writes) were 99% of traffic',
            tradeoff: 'Massive read speedup but cache invalidation logic was a mess',
          },
        ],
        painPoints: ['Fail Whale on high-traffic events', 'Rails GIL limited true concurrency', 'No real-time streaming — polling every 60s'],
        color: '#ef4444',
      },
      {
        year: 2010,
        title: 'The Real-Time Push',
        subtitle: 'Introduced Cassandra, fan-out service, Streaming API',
        scale: { users: '50M+', requests: '~50M/day', data: 'TBs' },
        stack: ['JVM services replacing Rails', 'Cassandra', 'Memcached', 'Custom fan-out service', 'Streaming API'],
        architecture: 'Big re-architecture begins. Tweet storage moved to Cassandra (immutable append-only writes are a perfect fit). Fan-out service introduced: on tweet creation, push tweet ID into every follower\'s Redis timeline cache. Streaming API (firehose) launched for third-party apps.',
        keyDecisions: [
          {
            what: 'Cassandra for tweet storage',
            why: 'MySQL shards couldn\'t handle write volume at scale; Cassandra\'s LSM tree excels at write-heavy workloads',
            tradeoff: 'Excellent write throughput, eventual consistency — you might see a tweet seconds late',
          },
          {
            what: 'Fan-out on write (push model)',
            why: 'Reading timeline at read-time required joining across all followees — too slow for large follow graphs',
            tradeoff: 'O(followers) write amplification — tweeting costs proportional to your follower count',
          },
        ],
        painPoints: ['Fan-out for celebrities (Lady Gaga, Katy Perry) caused massive write spikes', 'Cassandra operational complexity', 'Migration from MySQL while live'],
        color: '#f59e0b',
      },
      {
        year: 2013,
        title: 'The Hybrid Timeline',
        subtitle: 'Celebrity fan-out split, Redis everywhere, Snowflake IDs',
        scale: { users: '200M+', requests: '300M/day', data: '100s TBs' },
        stack: ['Redis Sorted Sets (timelines)', 'Cassandra (tweets)', 'Snowflake (ID generation)', 'Manhattan KV store', 'Hadoop (analytics)'],
        architecture: 'Solved the celebrity problem: users with >N followers (Lady Gaga, Obama) use fan-out on read — their tweets fetched and merged at read time. Regular users still get fan-out on write. Snowflake ID service generates unique 64-bit tweet IDs that sort chronologically.',
        keyDecisions: [
          {
            what: 'Hybrid fan-out (write for normal, read for celebs)',
            why: 'A single Katy Perry tweet was triggering writes to 30M Redis sorted sets — causing 30-second delays',
            tradeoff: 'Timeline read now requires a merge step for celebrity content, adding complexity',
          },
          {
            what: 'Snowflake ID generation service',
            why: 'Auto-increment IDs on MySQL don\'t work across shards; UUIDs are random (bad for range queries)',
            tradeoff: 'IDs are chronologically sortable and distributed — slight dependency on a central ID service',
          },
        ],
        painPoints: ['Search is still near-real-time but not true real-time', 'Analytics infrastructure (Hadoop) 24hr lag', 'Flash crowds still cause spikes'],
        color: '#10b981',
      },
      {
        year: 2017,
        title: 'The Microservices Era',
        subtitle: 'GraphQL, Finagle, Kafka event backbone',
        scale: { users: '330M+', requests: '500M tweets/day', data: 'Petabytes' },
        stack: ['Finagle (RPC)', 'Kafka (event bus)', 'HDFS (storage)', 'Earlybird (real-time search)', 'GraphQL API', 'Kubernetes (containers)'],
        architecture: 'Monolith fully decomposed into services over Finagle (Twitter\'s own Thrift-based RPC framework). Kafka becomes the central nervous system — every tweet, like, follow event flows through Kafka topics to downstream consumers. Earlybird cluster provides true real-time search (indexed within seconds).',
        keyDecisions: [
          {
            what: 'Kafka event backbone',
            why: 'Point-to-point service calls created a dependency spaghetti that brought the system down in cascades',
            tradeoff: 'Loose coupling via async events, but debugging distributed flows requires distributed tracing',
          },
          {
            what: 'Earlybird real-time search index',
            why: 'Users expected to search and find tweets posted seconds ago — Hadoop-based batch search was hours old',
            tradeoff: 'In-memory inverted index enables sub-second search but requires significant RAM per index shard',
          },
        ],
        painPoints: ['250+ microservices with complex dependency graph', 'Monorepo vs polyrepo debates', 'Latency tail at P99 due to service call chains'],
        color: '#8b5cf6',
      },
      {
        year: 2023,
        title: 'X — Post-Acquisition Scale-Down',
        subtitle: 'Aggressive infrastructure reduction, real-time AI features',
        scale: { users: '250M+ daily active', requests: '1B+/day', data: 'Exabytes' },
        stack: ['Reduced microservice count (staff reductions)', 'In-house recommendation ML', 'Open-sourced algorithm', 'AI-powered For You feed'],
        architecture: 'Post-Elon acquisition: 80% infrastructure cost reduction target. Many microservices consolidated. Open-sourced the recommendation algorithm (first major social platform to do so). For You feed powered by neural collaborative filtering — replaces chronological timeline as default.',
        keyDecisions: [
          {
            what: 'Aggressive service consolidation',
            why: 'Cost reduction — AWS bills were reported at $100M+/year',
            tradeoff: 'Operational simplicity but reduced team ownership — fewer engineers per service',
          },
          {
            what: 'Open-source recommendation algorithm',
            why: 'Transparency and developer trust; Twitter/X relies on third-party developer ecosystem',
            tradeoff: 'Transparency builds trust but reveals ranking signals that can be gamed',
          },
        ],
        painPoints: ['Reliability issues during staff reductions', 'Feature velocity slowdown', 'API access pricing controversy'],
        color: '#64748b',
      },
    ],
  },

  {
    id: 'instagram',
    company: 'Instagram',
    emoji: '📸',
    tagline: 'From 13 lines of Python to 2 billion users — the fastest consumer growth in history',
    lesson: 'Premature optimization is the root of all evil. Instagram launched with a simple stack, scaled it surgically, and only broke things apart when forced to.',
    stages: [
      {
        year: 2010,
        title: 'Launch Day',
        subtitle: 'Django + PostgreSQL + EC2',
        scale: { users: '25,000 (day 1)', requests: 'Unknown', data: 'GBs' },
        stack: ['Python/Django', 'PostgreSQL', 'Amazon EC2', 'Amazon S3 (photos)', 'Amazon CloudFront (CDN)'],
        architecture: '3 engineers built the initial product. Django app server. PostgreSQL for all data. S3 for photo storage with CloudFront CDN in front. No caching, no message queues. Launch went viral immediately — 25,000 users on day one.',
        keyDecisions: [
          {
            what: 'AWS from day 0',
            why: '3-person team needed to scale instantly without ops overhead; pre-cloud would have required hardware procurement',
            tradeoff: 'Higher cost than bare metal but infinite elastic scale on demand',
          },
          {
            what: 'S3 + CloudFront for all photos',
            why: 'Photos are write-once, read-many — perfect fit for object storage + CDN edge caching',
            tradeoff: 'S3 egress costs at scale but zero photo serving infrastructure to manage',
          },
        ],
        painPoints: ['Single DB instance', 'No horizontal scaling plan', 'No caching — every request hits DB'],
        color: '#e1306c',
      },
      {
        year: 2011,
        title: 'Scaling the Monolith',
        subtitle: 'PostgreSQL read replicas, Redis, pgBouncer',
        scale: { users: '7M', requests: 'Millions/day', data: '10s of GBs' },
        stack: ['Django', 'PostgreSQL (primary + read replicas)', 'Redis (caching)', 'pgBouncer (connection pooling)', 'Gearman (job queue)'],
        architecture: 'Added PostgreSQL read replicas — read traffic routed to replicas, writes to primary. Redis for hot-path caching (user feeds, counts). pgBouncer as a connection pooler to prevent PostgreSQL connection exhaustion. Gearman for async jobs (photo processing, notifications).',
        keyDecisions: [
          {
            what: 'Read replicas before any sharding',
            why: '~95% of Instagram traffic is reads (viewing photos, feeds) not writes',
            tradeoff: 'Simple horizontal read scale but replica lag means slightly stale feed data (ms)',
          },
          {
            what: 'Redis for feed caching',
            why: 'Feed generation from DB on every page view was killing the DB at even modest scale',
            tradeoff: 'Orders of magnitude faster reads, but cache invalidation when photos are deleted',
          },
        ],
        painPoints: ['Gearman job queue was unreliable — jobs could be lost', 'Single primary DB still a bottleneck for writes', 'Photo processing (resizing) was synchronous and blocking'],
        color: '#fd5949',
      },
      {
        year: 2012,
        title: 'The Facebook Acquisition',
        subtitle: 'Horizontal sharding, 1 billion photos served, 13 engineers',
        scale: { users: '30M (at acquisition)', requests: 'Millions/hour', data: '100s GBs' },
        stack: ['Django', 'Sharded PostgreSQL', 'Redis Cluster', 'Celery (async tasks)', 'HAProxy (load balancer)'],
        architecture: 'Facebook acquires Instagram for $1B with just 13 engineers. Before the acquisition, Instagram had already horizontally sharded PostgreSQL by user_id. Photo metadata sharded, photo files still on S3. HAProxy for load balancing. Celery replaced Gearman for reliable async task processing.',
        keyDecisions: [
          {
            what: 'Shard by user_id early',
            why: 'Single PostgreSQL primary couldn\'t handle write volume as uploads grew',
            tradeoff: 'Horizontal write scale but cross-shard queries (e.g. "photos by location") require scatter-gather',
          },
          {
            what: 'Stay on Django monolith post-acquisition',
            why: 'Moving to microservices requires engineering bandwidth; 13 engineers couldn\'t afford that cost',
            tradeoff: 'Velocity maintained but single codebase scaling limits approaching',
          },
        ],
        painPoints: ['13 engineers could barely keep up with growth', 'Sharding logic embedded in application code (no middleware)', 'PostgreSQL sharding was manual and error-prone'],
        color: '#f77737',
      },
      {
        year: 2015,
        title: 'Meta Infrastructure Migration',
        subtitle: 'TAO graph store, Cassandra, Thrift RPC, internal CDN',
        scale: { users: '400M', requests: 'Billions/day', data: 'Petabytes' },
        stack: ['Meta TAO (social graph)', 'Cassandra (activity feeds)', 'Meta internal CDN (replacing CloudFront)', 'Thrift RPC (internal)', 'HBase (analytics)'],
        architecture: 'Instagram migrated to Meta infrastructure. Social graph (follows, following) moved to TAO — Meta\'s distributed graph database built on MySQL. Activity feeds (likes, comments) moved to Cassandra for write throughput. Internal CDN replaced AWS CloudFront for cost and control at Meta\'s scale.',
        keyDecisions: [
          {
            what: 'TAO for social graph',
            why: 'Sharded PostgreSQL couldn\'t efficiently serve the bidirectional follow graph queries needed for feed assembly',
            tradeoff: 'TAO provides O(1) adjacency list lookups but requires maintaining a complex cache-on-top-of-MySQL architecture',
          },
          {
            what: 'Internal CDN at Facebook scale',
            why: 'AWS CloudFront egress costs at petabyte scale were enormous; Meta had enough traffic to justify owning CDN infrastructure',
            tradeoff: 'Massive cost savings but huge engineering investment to build and operate',
          },
        ],
        painPoints: ['Instagram culture vs Meta culture clash', 'Migration risk while maintaining 400M user service', 'Losing some AWS flexibility'],
        color: '#405de6',
      },
      {
        year: 2019,
        title: 'Explore & Recommendation Scale',
        subtitle: 'Two-tower ML, video infrastructure, IGTV',
        scale: { users: '1B', requests: '100M+ photos/videos uploaded daily', data: 'Exabytes' },
        stack: ['Two-tower neural networks (Explore)', 'Video transcoding pipeline', 'Distributed feature store (ML)', 'GraphQL API', 'React Native (mobile)'],
        architecture: 'Explore page powered by two-tower neural network: user embedding tower × content embedding tower, producing a relevance score. Billions of embeddings precomputed and stored. IGTV requires video transcoding pipeline similar to YouTube (multiple resolutions, adaptive streaming). GraphQL API for mobile client efficiency.',
        keyDecisions: [
          {
            what: 'Two-tower neural network for Explore',
            why: 'Collaborative filtering can\'t scale to 1B users × billions of posts — need approximate nearest neighbor search in embedding space',
            tradeoff: 'Incredible relevance but cold start problem for new users with no history; high inference cost',
          },
          {
            what: 'GraphQL for mobile API',
            why: 'REST API over-fetched data on mobile (slow networks, battery drain); single query fetches exactly what the UI needs',
            tradeoff: 'Reduced payload size and round trips but server-side query complexity and caching challenges',
          },
        ],
        painPoints: ['Creator equity — algorithm visibility biases toward accounts with existing large followings', 'Content moderation at billion-post scale', 'Reels competing with TikTok requires video-first re-architecture'],
        color: '#833ab4',
      },
    ],
  },

  {
    id: 'uber',
    company: 'Uber',
    emoji: '🚗',
    tagline: 'Real-time location tracking and matching at global scale — built under extreme delivery pressure',
    lesson: 'Starting with a monolith is fine. But location data is a unique beast — you need purpose-built geo-indexing from the beginning.',
    stages: [
      {
        year: 2010,
        title: 'UberCab Launch',
        subtitle: 'Python monolith, single MySQL, Google Maps',
        scale: { users: 'Hundreds', requests: 'Negligible', data: 'MBs' },
        stack: ['Python', 'MySQL', 'Google Maps API', 'Single EC2 instance'],
        architecture: 'Original "UberCab" was a Python monolith. Driver GPS positions updated in MySQL via polling (driver app hits API every 30s). No real geo-indexing — just lat/lng columns with naive distance queries. Garret Camp and Travis Kalanick\'s initial prototype.',
        keyDecisions: [
          {
            what: 'Start in San Francisco only',
            why: 'Single market minimizes operational complexity — learn one city before expanding',
            tradeoff: 'Limited initial revenue but allowed deep learning of the matching problem before scaling',
          },
          {
            what: 'MySQL for everything including GPS',
            why: 'Simple, familiar — engineers knew it',
            tradeoff: 'lat/lng queries on MySQL tables are not indexed efficiently — will collapse at scale',
          },
        ],
        painPoints: ['GPS data in MySQL is fundamentally wrong for geo queries', 'No real-time — polling every 30s means stale driver positions', 'Black car only model — small addressable market'],
        color: '#000000',
      },
      {
        year: 2012,
        title: 'UberX Explosion',
        subtitle: 'Node.js dispatch, Redis for real-time state, city sharding',
        scale: { users: '~100K', requests: 'Thousands/day', data: 'GBs' },
        stack: ['Node.js (dispatch service)', 'Redis (driver positions)', 'MySQL (trips, users)', 'Google Maps (routing)', 'City-based database sharding'],
        architecture: 'UberX launches — anyone with a car can drive. Traffic multiplies 10x overnight. Dispatch extracted from Python monolith into Node.js service. Driver GPS positions moved from MySQL to Redis sorted sets — GEORADIUS query type didn\'t exist yet, used custom geo-hash prefix queries. Database sharded per city.',
        keyDecisions: [
          {
            what: 'Redis for driver positions (not MySQL)',
            why: 'MySQL LIKE queries on geo-hash prefixes couldn\'t handle thousands of concurrent driver position updates per second',
            tradeoff: 'In-memory speed but Redis state is volatile — driver position lost on restart (acceptable since it\'s re-sent immediately)',
          },
          {
            what: 'City-level database sharding',
            why: 'Uber\'s data is naturally geo-partitioned — a trip in NY has zero relationship to a trip in LA',
            tradeoff: 'Natural partition with no cross-shard queries, but requires a global routing layer to know which shard handles each request',
          },
        ],
        painPoints: ['UberX surge pricing caused PR backlash', 'Driver GPS battery drain from continuous updates', 'No standard RPC framework — services calling each other ad-hoc'],
        color: '#1a1a1a',
      },
      {
        year: 2014,
        title: 'The Schemaless Era',
        subtitle: 'Built Schemaless (MySQL wrapper), Ringpop, TChannel',
        scale: { users: '~10M', requests: 'Millions/day', data: '100s GBs' },
        stack: ['Schemaless (custom MySQL layer)', 'Ringpop (distributed coordination)', 'TChannel (RPC protocol)', 'Go microservices beginning', 'Redis Cluster'],
        architecture: 'Uber builds Schemaless: a layer on top of MySQL providing consistent hashing, schema-less key-value semantics, and horizontal scalability. Designed for append-only workloads (trip records are never updated, only appended). Ringpop adds consistent hashing ring for service discovery. TChannel is Uber\'s own RPC protocol optimized for multiplexed low-latency calls.',
        keyDecisions: [
          {
            what: 'Build Schemaless (don\'t just use Cassandra)',
            why: 'Needed ACID guarantees for financial data (trip fares, driver pay) that Cassandra\'s eventual consistency couldn\'t provide',
            tradeoff: 'MySQL\'s reliability + custom horizontal scale layer, but massive engineering investment to build and maintain',
          },
          {
            what: 'Consistent hashing via Ringpop',
            why: 'Naive round-robin load balancing doesn\'t account for stateful services — e.g., all requests for city X should go to the same dispatch shard',
            tradeoff: 'Optimal routing but gossip protocol adds complexity to service discovery',
          },
        ],
        painPoints: ['100+ engineers but fragmented microservice ownership', 'TChannel non-standard — hard to integrate with OSS tools', 'Schemaless engineering cost was massive'],
        color: '#333333',
      },
      {
        year: 2016,
        title: 'H3 + Real-Time Everything',
        subtitle: 'H3 hexagonal grid, Kafka backbone, Cadence workflows',
        scale: { users: '40M+', requests: 'Billions/day', data: 'Petabytes' },
        stack: ['H3 (hexagonal geo grid)', 'Kafka (event backbone)', 'Cadence (workflow engine)', 'HDFS + Hive (analytics)', 'Peloton (job scheduler)'],
        architecture: 'Uber open-sources H3 — a hexagonal hierarchical geospatial index that partitions the globe into hexagonal cells at multiple resolution levels. Replaces geohash approach. Kafka becomes the event backbone: every trip lifecycle event, GPS ping, and payment flows through Kafka. Cadence workflow engine orchestrates multi-step async processes (driver onboarding, trip state machine).',
        keyDecisions: [
          {
            what: 'H3 hexagonal grid (over geohash)',
            why: 'Geohash rectangles have irregular neighbor relationships — distance queries across cell boundaries are complex. Hexagons have uniform neighbor distance',
            tradeoff: 'Better geo queries and surge pricing grid accuracy, but H3 requires new mental model and tooling for all geo operations',
          },
          {
            what: 'Cadence for workflow orchestration',
            why: 'Trip state machine (request → dispatch → pickup → trip → payment) was managed with ad-hoc queues and cron jobs — impossible to debug failures',
            tradeoff: 'Explicit workflow definitions are debuggable and retryable, but workflow engine is another system to operate',
          },
        ],
        painPoints: ['Kafka lag during surge events', 'H3 migration of existing geo data', 'Regulatory challenges in every new city'],
        color: '#444444',
      },
      {
        year: 2020,
        title: 'Hyperlocal + ML Matching',
        subtitle: 'ML dispatch, real-time features, multimodal (Eats, Freight)',
        scale: { users: '100M+ monthly active', requests: '28M trips/day', data: 'Exabytes' },
        stack: ['Real-time ML feature store', 'Michelangelo (ML platform)', 'Presto/Apache Spark (analytics)', 'Multi-tenant Kubernetes', 'Go + Python dominant languages'],
        architecture: 'Dispatch is now fully ML-driven: matching rider to driver uses a neural network trained on millions of historical trips, accounting for predicted ETAs, driver behavior patterns, traffic, and demand density. Michelangelo — Uber\'s internal ML platform — manages training, deployment, and serving of 10,000+ ML models. Real-time feature store enables sub-second feature retrieval for online inference.',
        keyDecisions: [
          {
            what: 'ML-driven dispatch',
            why: 'Heuristic matching (nearest driver) doesn\'t minimize total platform idle time — ML can optimize global supply-demand across the whole city',
            tradeoff: '15-20% improvement in match efficiency but black-box decisions are harder to debug when a driver complains about bad matches',
          },
          {
            what: 'Unified Michelangelo ML platform',
            why: 'Every team built their own ML pipeline — 50+ incompatible training and serving frameworks causing massive duplication',
            tradeoff: 'Standardized ML lifecycle and model sharing across teams, but platform becomes a critical dependency',
          },
        ],
        painPoints: ['COVID-19 crash: rides fell 80%, Eats grew 150% — platform had to rebalance instantly', 'Driver vs algorithmic pricing tension', 'Regulatory pressure on gig worker classification'],
        color: '#555555',
      },
    ],
  },

  {
    id: 'netflix',
    company: 'Netflix',
    emoji: '🎬',
    tagline: 'From DVD-by-mail to the engineering gold standard for cloud-native resilience',
    lesson: 'Netflix\'s greatest contribution wasn\'t streaming — it was proving that you can build reliable systems from unreliable components, and showing the world how with open source.',
    stages: [
      {
        year: 2007,
        title: 'Streaming Launch',
        subtitle: 'Monolithic data center app, Windows Media Player',
        scale: { users: '10M DVD subscribers, streaming minority', requests: 'Low streaming volume', data: '100s GBs' },
        stack: ['Java monolith', 'Oracle DB', 'Windows Media Player (DRM)', 'Custom CDN partnerships', 'Own data center'],
        architecture: 'Netflix adds streaming to its DVD business. Java monolith running in Netflix\'s own data center in San Jose. Streaming limited to Windows PCs via Windows Media Player (DRM requirement). Oracle database for all data. Custom CDN partnerships with Akamai and Limelight for content delivery.',
        keyDecisions: [
          {
            what: 'Own data center, not cloud',
            why: '2007 — AWS existed but was immature; established companies built their own infrastructure',
            tradeoff: 'Control and perceived security, but capital-intensive and slow to scale',
          },
          {
            what: 'Windows Media Player DRM',
            why: 'Studios required DRM as condition of licensing content; WMDRM was the dominant standard',
            tradeoff: 'Got studio licenses but alienated Mac users and made multi-platform expansion painful',
          },
        ],
        painPoints: ['Limited to Windows PCs', 'Own data center can\'t elastically scale for demand spikes', 'Content library small (limited streaming licenses)'],
        color: '#e50914',
      },
      {
        year: 2009,
        title: 'The Cloud Migration',
        subtitle: 'Move to AWS, begin microservices decomposition',
        scale: { users: '10M+', requests: 'Growing rapidly', data: 'TBs' },
        stack: ['AWS EC2', 'AWS S3', 'Java services beginning decomposition', 'MySQL on EC2', 'Custom streaming CDN'],
        architecture: 'A 2008 data center corruption incident that took Netflix offline for 3 days triggers the decision to move to AWS. Multi-year migration begins. Monolith starts being decomposed service by service. This is one of the first major enterprise cloud migrations — Netflix essentially becomes an AWS reference customer.',
        keyDecisions: [
          {
            what: 'Migrate to AWS (radical for 2009)',
            why: 'Single data center = single point of failure. 2008 outage proved it. AWS provides geographic redundancy',
            tradeoff: 'Loss of data center control and higher unit cost, but elastic scale and multi-region redundancy',
          },
          {
            what: 'Start microservices before it was a buzzword',
            why: 'Monolith deployments required 6-week release cycles — too slow for streaming product iteration',
            tradeoff: 'Independent deploys and fault isolation, but distributed systems complexity (network partitions, latency, partial failures)',
          },
        ],
        painPoints: ['7-year migration — can\'t stop the business to rewrite', 'Two systems running simultaneously (data center + cloud) for years', 'Streaming on AWS unfamiliar territory'],
        color: '#e50914',
      },
      {
        year: 2011,
        title: 'Chaos Engineering Born',
        subtitle: 'Cassandra, Chaos Monkey, multi-region active-active',
        scale: { users: '25M', requests: 'Billions/month', data: 'Petabytes' },
        stack: ['Cassandra (replacing Oracle)', 'Chaos Monkey', 'Hystrix (circuit breaker)', 'Eureka (service discovery)', 'Ribbon (client-side load balancing)'],
        architecture: 'Netflix migrates from Oracle to Cassandra — a massive schema migration across petabytes of data. Chaos Monkey is born: a tool that randomly kills EC2 instances in production during business hours to force engineers to build resilient services. Hystrix implements the circuit breaker pattern — if a service is failing, stop calling it and return a fallback instead of cascading the failure.',
        keyDecisions: [
          {
            what: 'Cassandra over Oracle',
            why: 'Oracle licensing costs were growing exponentially; Cassandra\'s multi-region active-active replication fits Netflix\'s global expansion',
            tradeoff: 'Massive cost savings and global scale, but eventual consistency requires rethinking data modeling',
          },
          {
            what: 'Chaos Monkey in production',
            why: 'Services were designed to tolerate instance failures on paper but had never been tested — "hoping for resilience" isn\'t engineering',
            tradeoff: 'Real resilience proven under fire, but requires engineering culture shift and may cause real user impact',
          },
        ],
        painPoints: ['Cassandra migration with zero downtime took years', 'Chaos Monkey required deep reliability investment before it could be safely run', 'Multi-region replication lag for user data'],
        color: '#e50914',
      },
      {
        year: 2015,
        title: 'Open Connect CDN',
        subtitle: 'Netflix-owned CDN, 1000+ microservices, Zuul gateway',
        scale: { users: '70M+', requests: '100M stream hours/day', data: 'Exabytes' },
        stack: ['Open Connect (Netflix CDN)', 'Zuul (API gateway)', 'Spinnaker (CD platform)', 'Atlas (time series metrics)', 'Iceberg (data lake tables)'],
        architecture: 'Netflix builds Open Connect: their own CDN by embedding physical appliances (servers) inside ISP data centers and exchange points globally. These appliances cache Netflix content and serve it directly to subscribers without Netflix paying AWS egress costs. Zuul API gateway handles auth, routing, and A/B test traffic splits across 1000+ microservices.',
        keyDecisions: [
          {
            what: 'Build own CDN (Open Connect)',
            why: 'At Netflix\'s scale, AWS egress + third-party CDN costs were $100M+/year and growing; owning the CDN pays for itself in 2 years',
            tradeoff: 'Enormous upfront investment, ISP relationship management, physical hardware ops — but 95% of traffic served from own CDN at marginal cost',
          },
          {
            what: 'Spinnaker for continuous delivery',
            why: '1000+ services being deployed by different teams — needed a unified, safe CD pipeline with automated canary analysis',
            tradeoff: 'Standardized deployments and safe rollouts, but Spinnaker itself becomes a critical platform that must be highly available',
          },
        ],
        painPoints: ['ISP negotiations for Open Connect appliance placement', 'Coordinating 1000+ microservice deployments', 'Cost of running own CDN hardware globally'],
        color: '#e50914',
      },
      {
        year: 2022,
        title: 'The Modern Platform',
        subtitle: 'Live streaming, AWS Graviton, cost optimization, ad tier',
        scale: { users: '260M subscribers', requests: '15% of global internet bandwidth', data: 'Zettabytes' },
        stack: ['AWS Graviton (ARM chips)', 'Maestro (workflow orchestration)', 'Hollow (in-memory data engine)', 'Mantis (real-time stream processing)', 'Ad-serving infrastructure (new)'],
        architecture: 'Netflix moves to AWS Graviton ARM chips — 40% better price/performance for Java workloads. Hollow provides in-memory compressed datasets (the entire Netflix catalog metadata can be served in memory per instance). Ad-supported tier launches — requires building an entirely new ad-serving infrastructure stack. Live streaming added (The Netflix Cup, wrestling events).',
        keyDecisions: [
          {
            what: 'Graviton ARM migration',
            why: 'Netflix has millions of CPU hours/day — 40% cost reduction on compute is massive at their scale',
            tradeoff: 'Native code and some JVM tuning needed for ARM, but payoff is immediate',
          },
          {
            what: 'Ad-supported tier',
            why: 'Subscriber growth plateau — ad tier opens new price-sensitive market segment',
            tradeoff: 'Revenue diversification but requires building ad infrastructure (bidding, creative serving, measurement) from scratch',
          },
        ],
        painPoints: ['Password sharing crackdown technical enforcement', 'Live streaming reliability (can\'t buffer like on-demand)', 'Ad tech is a new core competency to build'],
        color: '#e50914',
      },
    ],
  },

  {
    id: 'slack',
    company: 'Slack',
    emoji: '💼',
    tagline: 'A gaming company\'s pivot becomes the enterprise communication standard',
    lesson: 'Slack was built by a team that had already failed (Glitch, the game). They took all the internal tooling they built for their game and turned it into a product. Constraints breed creativity.',
    stages: [
      {
        year: 2013,
        title: 'Pivot from Glitch',
        subtitle: 'PHP monolith, IRC protocol roots, Freenode bot origins',
        scale: { users: '8,000 on launch day', requests: 'Thousands/day', data: 'GBs' },
        stack: ['PHP (Hack dialect)', 'MySQL', 'Apache', 'Memcache', 'WebSocket (custom)'],
        architecture: 'Slack is built from internal tooling Tiny Speck used for Glitch (their browser game). IRC-inspired architecture. PHP application serving real-time messages over persistent connections. MySQL for message storage. Launches to 8,000 users on day 1 — servers immediately struggle.',
        keyDecisions: [
          {
            what: 'WebSocket over polling',
            why: 'Real-time feel required push from server — polling every few seconds creates the "delayed message" problem that kills chat UX',
            tradeoff: 'True real-time UX but persistent connection management is complex and WebSocket support was patchy in 2013',
          },
          {
            what: 'Threads and channels as the core model',
            why: 'Email is async and disorganized; IRC has no history; Slack\'s channel-organized persistent history was the key differentiation',
            tradeoff: 'Distinct product but high learning curve for email-native enterprise users',
          },
        ],
        painPoints: ['Servers fell over on launch day', 'PHP performance issues at high connection counts', 'No mobile app at launch'],
        color: '#4a154b',
      },
      {
        year: 2015,
        title: 'Enterprise Breakout',
        subtitle: 'Channel sharding, Flannel (edge cache), Viper API',
        scale: { users: '1M daily active', requests: 'Billions/day', data: '100s GBs' },
        stack: ['PHP/Hack', 'Vitess (MySQL sharding)', 'Flannel (edge cache)', 'Consul (service discovery)', 'Apache Kafka'],
        architecture: 'Enterprise adoption explodes. Flannel is built: a channel data caching layer that serves the initial channel view without hitting the DB. Messages sharded by workspace (team) ID — each workspace\'s data lives on a shard. Kafka introduced for async event processing (notifications, search indexing, analytics).',
        keyDecisions: [
          {
            what: 'Workspace-level sharding',
            why: 'Messages within a workspace have high locality — a channel\'s messages always belong to one team, never cross teams',
            tradeoff: 'Excellent isolation and simple shard assignment, but hot workspaces (huge enterprises) can overload a single shard',
          },
          {
            what: 'Flannel edge cache',
            why: 'Opening a channel requires loading recent message history — hitting the DB for every channel open was killing latency',
            tradeoff: 'Sub-100ms channel loads, but cache invalidation for message edits/deletes is complex',
          },
        ],
        painPoints: ['Large enterprise customers (10K+ user workspaces) overwhelm single-workspace shards', 'Message search was slow (basic MySQL full-text search)', 'No granular permission model for enterprise'],
        color: '#4a154b',
      },
      {
        year: 2017,
        title: 'The Real-Time Scale Problem',
        subtitle: 'Slack\'s message fanout architecture, Kubernetes, Envoy proxy',
        scale: { users: '5M daily active', requests: 'Billions/day', data: 'Petabytes' },
        stack: ['Kubernetes', 'Envoy (service mesh)', 'Vitess (MySQL at scale)', 'Elasticsearch (search)', 'Astra (custom log storage)'],
        architecture: 'When a user sends a message, it must be delivered in real-time to all online members of that channel. For a channel with 50K members, that\'s 50K WebSocket pushes. Slack builds a distributed pub-sub system where each Slack client is subscribed to channels via persistent connections managed by a gateway tier. Elasticsearch replaces MySQL full-text search.',
        keyDecisions: [
          {
            what: 'Custom pub-sub for message fan-out',
            why: 'Off-the-shelf pub-sub systems (Redis pub/sub) couldn\'t handle the durability + scale requirements — dropped messages in large channels during load spikes',
            tradeoff: 'Reliable delivery guarantees but significant engineering investment in a non-core system',
          },
          {
            what: 'Elasticsearch for message search',
            why: 'MySQL FULLTEXT search can\'t handle cross-channel, cross-user search with relevance ranking at scale',
            tradeoff: 'Rich search features but Elasticsearch cluster management, index lag, and cost at Slack\'s message volume',
          },
        ],
        painPoints: ['Large channel performance (#general in Fortune 500 = 50K members)', 'WebSocket connection management across multiple data centers', 'Message delivery guarantees ("at least once" vs "exactly once")'],
        color: '#4a154b',
      },
      {
        year: 2021,
        title: 'Salesforce Era + Threads',
        subtitle: 'Salesforce acquisition, Slack Connect, Workflow Builder',
        scale: { users: '12M+ daily active', requests: '5B+ API calls/day', data: 'Exabytes' },
        stack: ['Multi-cloud (AWS + GCP)', 'Slack Connect (cross-org messaging)', 'Bolt SDK (platform apps)', 'Workflow Builder (no-code automation)'],
        architecture: 'Salesforce acquires Slack for $27.7B. Slack Connect enables messaging across organization boundaries — technically complex as messages must be delivered to workspaces on different database shards, potentially different cloud regions. Threads redesigned. Workflow Builder allows no-code automation without code.',
        keyDecisions: [
          {
            what: 'Slack Connect cross-org messaging',
            why: 'The dream is to replace email for B2B communication — you currently email vendors/clients; Connect lets you Slack them',
            tradeoff: 'Massive new use case but cross-shard message delivery breaks workspace isolation assumption the entire DB layer was built on',
          },
        ],
        painPoints: ['Integration with Salesforce CRM data without merging databases', 'Slack Connect security model (spam across orgs)', 'Maintaining Slack culture/independence post-acquisition'],
        color: '#4a154b',
      },
    ],
  },

  {
    id: 'airbnb',
    company: 'Airbnb',
    emoji: '🏠',
    tagline: 'From renting air mattresses to the world\'s largest accommodation platform without owning a single room',
    lesson: 'Trust is the product. Every technical decision Airbnb made — from secure payments to verified profiles to review systems — was about making strangers trust each other.',
    stages: [
      {
        year: 2008,
        title: 'Air Bed & Breakfast',
        subtitle: 'Ruby on Rails, single server, hardcoded everything',
        scale: { users: 'Dozens', requests: '<1K/day', data: 'MBs' },
        stack: ['Ruby on Rails', 'MySQL', 'Single AWS instance', 'PayPal (payments)'],
        architecture: 'Brian Chesky and Joe Gebbia bought air mattresses to rent their apartment during the 2008 DNC. Rails app, MySQL DB, one server. Payments via PayPal — no escrow, no host guarantee. No mobile app, no trust infrastructure.',
        keyDecisions: [
          {
            what: 'Launch during a conference (DNC 2008)',
            why: 'Hotels were fully booked — price-sensitive conference attendees were the perfect first users',
            tradeoff: 'Got early users but too niche to build sustainable growth initially',
          },
        ],
        painPoints: ['No payments escrow — guests paid, hosts could cancel', 'Zero trust infrastructure — strangers opening their homes to strangers', 'Failed to get Y Combinator first application'],
        color: '#ff5a5f',
      },
      {
        year: 2012,
        title: 'Marketplace Scale',
        subtitle: 'SOA beginning, Braintree payments, professional photography',
        scale: { users: '1M+ bookings', requests: 'Millions/day', data: 'GBs' },
        stack: ['Rails (beginning service extraction)', 'PostgreSQL', 'Redis', 'Braintree (payments)', 'AWS (multi-region)'],
        architecture: 'Y Combinator batch (W09) + Sequoia investment. Major insight: listings with professional photos got 2-3x more bookings. Airbnb builds professional photographer program. Engineering: monolith starts extracting payment service (Braintree integration) and search service (Elasticsearch added for geo+text search).',
        keyDecisions: [
          {
            what: 'Professional photography program',
            why: 'A/B test showed professional photos tripled bookings — first non-engineering intervention that drove growth',
            tradeoff: 'High operational cost but demonstrated that product quality (not just features) drives marketplace success',
          },
          {
            what: 'Extract payments as first service',
            why: 'Payment processing has specific compliance (PCI-DSS), reliability, and security requirements that shouldn\'t be in the general monolith',
            tradeoff: 'Isolation of compliance scope and higher reliability SLA for payments, but adds a network call in the booking hot path',
          },
        ],
        painPoints: ['2011 break-in incident: guest destroyed host\'s home → Airbnb builds $50K host guarantee', 'Trust infrastructure was reactive not proactive', 'European expansion requires multi-currency, multi-language'],
        color: '#ff5a5f',
      },
      {
        year: 2015,
        title: 'SOA + Data Science',
        subtitle: 'Microservices, smart pricing, identity verification',
        scale: { users: '60M+ guest arrivals', requests: 'Billions/year', data: '100s GBs' },
        stack: ['100+ microservices', 'Kafka (events)', 'Spark (analytics)', 'Druid (real-time analytics)', 'Stripe (replacing Braintree)', 'Smart Pricing ML'],
        architecture: 'Full SOA decomposition: listing service, search service, booking service, messaging service, payments service, review service — each with own DB. Smart Pricing ML model trained on 5 years of booking data to recommend dynamic pricing to hosts. Identity verification launched (government ID + selfie matching).',
        keyDecisions: [
          {
            what: 'Smart Pricing (dynamic pricing recommendation)',
            why: 'Hosts pricing too high or too low left revenue on the table — ML could optimize based on seasonality, local events, demand patterns',
            tradeoff: 'Revenue uplift for hosts and better inventory utilization, but hosts distrust algorithmic pricing and sometimes reject recommendations',
          },
          {
            what: 'Double-sided review reveal',
            why: 'If reviews were visible immediately, guests would give positive reviews to avoid retaliation from hosts',
            tradeoff: 'Honest reviews improve marketplace trust, but requires both parties to submit before either sees — some users don\'t review at all',
          },
        ],
        painPoints: ['Regulatory battles in SF, NYC, Berlin, Amsterdam', 'Insurance complexity across 220 countries', 'Racial discrimination in booking patterns (found in Harvard study)'],
        color: '#ff5a5f',
      },
      {
        year: 2020,
        title: 'COVID Survival + IPO',
        subtitle: 'Bookings crashed 80%, forced infrastructure right-sizing',
        scale: { users: '150M+ cumulative users', requests: 'Reduced then recovery', data: 'Petabytes' },
        stack: ['Kubernetes (cost optimization)', 'Airflow (ML pipelines)', 'Data warehouse consolidation', 'Experiences platform (virtual)', 'Direct booking tools for hosts'],
        architecture: 'COVID causes 80% booking cancellation. Airbnb refunds $1B+ to guests (controversial). Emergency cost-cutting: layoffs, AWS cost reduction, engineering priorities shift. IPO in December 2020 at $86/share (raises $3.5B). Engineering focus: long-term stays (work-from-anywhere), Experiences platform, host tools.',
        keyDecisions: [
          {
            what: 'Prioritize long-term stays post-COVID',
            why: 'Remote work untethered people from offices — 1-month+ stays in scenic locations became desirable; monetizes differently than nightly',
            tradeoff: 'New product category with different search, pricing, and review dynamics that required new ML models',
          },
          {
            what: 'IPO during pandemic',
            why: 'Uncertainty created a "now or never" window; company needed capital reserves',
            tradeoff: 'Raised capital to weather crisis but market valuation debate during uncertain times',
          },
        ],
        painPoints: ['$1B+ refund decision damaged host relationships', 'Proving resilience to IPO investors during worst-ever quarter', 'Remote work shift changed who uses Airbnb and why'],
        color: '#ff5a5f',
      },
    ],
  },
];
