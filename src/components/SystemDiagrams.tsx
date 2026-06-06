import React, { useState } from 'react';
import type { JSX } from 'react';
import { Info, ChevronLeft, Layers } from 'lucide-react';

interface SystemMeta {
  id: string;
  name: string;
  emoji: string;
  color: string;
  tagline: string;
  scale: string;
  keyInsights: string[];
  techStack: string[];
}

const systems: SystemMeta[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    emoji: '▶️',
    color: '#ff0000',
    tagline: 'Video upload, transcoding, and adaptive streaming at global scale',
    scale: '500 hours of video uploaded per minute, 2B+ logged-in users/month',
    keyInsights: [
      'Videos are chunked into segments and transcoded into multiple resolutions (360p → 4K) in parallel workers',
      'Adaptive Bitrate (ABR) streaming: client switches quality based on network conditions using MPEG-DASH or HLS',
      'CDN caches popular video segments at edge nodes close to viewers — origin only serves cold content',
      'Video metadata (title, description, channel) is stored in Bigtable; watch history in Spanner',
      'Recommendation engine uses user watch history, likes, and collaborative filtering signals',
    ],
    techStack: ['Google Cloud Storage (raw video)', 'Bigtable (metadata)', 'Google Spanner (transactions)', 'Cloud CDN', 'Pub/Sub (events)', 'Dataflow (analytics)'],
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    emoji: '🐦',
    color: '#1da1f2',
    tagline: 'Real-time tweet publishing and personalized timeline delivery',
    scale: '500M tweets/day, 350K QPS on read path at peak',
    keyInsights: [
      'Fan-out on write: when a user tweets, the tweet is pushed into the Redis timeline cache of all followers (for ≤ N followers)',
      'Celebrities (>N followers) use fan-out on read — their tweets are merged into follower timelines at read time',
      'Tweets stored in a distributed Cassandra cluster; timelines cached in Redis Sorted Sets',
      'Search index is a near-real-time Lucene/Earlybird cluster that indexes tweets within seconds',
      'Trending topics computed via distributed counting with sliding time windows (Storm/Heron)',
    ],
    techStack: ['Cassandra (tweets)', 'Redis (timeline cache)', 'Kafka (event pipeline)', 'Earlybird (search)', 'Manhattan (key-value)', 'Twemcache'],
  },
  {
    id: 'discord',
    name: 'Discord',
    emoji: '💬',
    color: '#5865f2',
    tagline: 'Real-time messaging, voice, and video for gaming communities',
    scale: '19M active servers, 4B+ messages/day',
    keyInsights: [
      'Messages sent over WebSocket persistent connections; WebSocket servers are stateless and track which users are connected via Redis',
      'Message history stored in Cassandra with (channel_id, message_id) partition — optimized for time-ordered reads',
      'Voice/video uses WebRTC for peer-to-peer; Discord\'s own Selective Forwarding Unit (SFU) servers for larger calls',
      'Presence system (online/offline/DND) uses a distributed pub/sub layer — every presence change published to interested subscribers',
      'Read states (last-read message) stored in a separate key-value store to avoid hot-spotting the main message DB',
    ],
    techStack: ['Cassandra (messages)', 'Redis (presence, pub/sub)', 'WebSocket (messaging)', 'WebRTC (voice/video)', 'Rust (performance-critical services)', 'Elixir (Gateway)'],
  },
  {
    id: 'uber',
    name: 'Uber',
    emoji: '🚗',
    color: '#000000',
    tagline: 'Real-time ride matching, GPS tracking, and surge pricing',
    scale: '28M trips/day, 5M+ drivers streaming GPS every 4 seconds',
    keyInsights: [
      'Driver GPS positions stored in a Redis geospatial index using H3 hexagonal grid for O(1) radius queries',
      'Dispatch service matches riders with drivers using a supply-demand optimization algorithm per city zone',
      'Surge pricing computed in real-time from supply/demand ratio in each H3 cell — updated every minute',
      'Trip data flows through Kafka for analytics, billing, driver pay, and fraud detection pipelines',
      'Schemaless (built on MySQL) stores trip state with consistent hashing for horizontal scaling',
    ],
    techStack: ['Redis Geo + H3 (driver positions)', 'Kafka (event backbone)', 'MySQL/Schemaless (trip data)', 'Go (core services)', 'Python (ML/pricing)', 'Cadence (workflows)'],
  },
  {
    id: 'netflix',
    name: 'Netflix',
    emoji: '🎬',
    color: '#e50914',
    tagline: 'Personalized content ingestion, encoding, and global streaming',
    scale: '260M subscribers, 15% of global internet traffic at peak',
    keyInsights: [
      'Content is encoded into 1000+ bitrate/resolution/codec combinations per title for adaptive streaming',
      'Netflix\'s CDN (Open Connect) caches entire catalogs on ISP-embedded appliances — 95% of traffic served from CDN',
      'Chaos Monkey and chaos engineering culture: intentionally kill production instances to prove resilience',
      'Recommendation engine combines collaborative filtering, viewing history, and content features (tags, genres)',
      'Zuul gateway handles authentication, routing, and rate limiting for 1000+ backend microservices',
    ],
    techStack: ['AWS (full cloud)', 'Cassandra (metadata)', 'Kafka (event streams)', 'Zuul (API gateway)', 'Hystrix (circuit breaker)', 'Open Connect CDN'],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    emoji: '📸',
    color: '#e1306c',
    tagline: 'Photo/video upload and interest-based feed generation at scale',
    scale: '2B+ users, 100M photos/videos uploaded daily',
    keyInsights: [
      'Photos stored in object storage (originally TAO + Haystack, now Meta\'s F4 + HDFS) — optimized for warm/cold photo access',
      'Feed generation uses a hybrid approach: precomputed feeds for active users (push), on-demand assembly for inactive users (pull)',
      'Follow graph stored in TAO (Meta\'s distributed graph cache on top of MySQL) — fast traversal for feed assembly',
      'Explore page uses a two-tower neural network: user tower (interests) × content tower (features) → ranking score',
      'Shared infrastructure with Facebook — Django monolith migrated to microservices, Thrift for internal RPC',
    ],
    techStack: ['TAO (social graph)', 'Cassandra (timelines)', 'Haystack/F4 (photo storage)', 'Memcache (hot cache)', 'Thrift/gRPC (internal RPC)', 'PostgreSQL (metadata)'],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    emoji: '💚',
    color: '#25d366',
    tagline: 'End-to-end encrypted messaging for 2B+ users with minimal infrastructure',
    scale: '2B users, 100B messages/day — on remarkably lean infrastructure (~50 engineers when acquired)',
    keyInsights: [
      'Built on Erlang/OTP (BEAM VM) — designed for massive concurrency with lightweight processes (millions of connections per server)',
      'Signal Protocol provides end-to-end encryption — server stores only ciphertext it cannot read',
      'Messages are stored on device; server holds messages only until delivery confirmation, then deletes them',
      'XMPP-derived protocol over WebSocket for message transport; media sent via separate HTTP upload servers',
      'Mnesia (Erlang distributed DB) for session/presence state; Cassandra for message queues for offline users',
    ],
    techStack: ['Erlang/OTP (core server)', 'XMPP (protocol)', 'Signal Protocol (E2E encryption)', 'Mnesia (presence)', 'Cassandra (offline queues)', 'FreeBSD (OS)'],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    emoji: '📦',
    color: '#ff9900',
    tagline: 'E-commerce, inventory management, and order fulfillment at global scale',
    scale: '1.6M packages shipped/day, 300M+ active customers',
    keyInsights: [
      'The product detail page aggregates data from 100+ services — pioneered the practice of microservices decomposition',
      'Inventory uses optimistic locking with conditional writes in DynamoDB to prevent overselling without 2PC',
      'Order processing is a Saga orchestration: OrderService → PaymentService → InventoryService → ShippingService with compensation on failure',
      'Personalized recommendations use collaborative filtering + item-based CF — the original "customers who bought X also bought Y"',
      'Every AWS service powers an Amazon retail feature — S3 for product images, DynamoDB for cart, SQS for order processing',
    ],
    techStack: ['DynamoDB (cart, inventory)', 'S3 (product images)', 'SQS/SNS (order events)', 'Aurora (relational data)', 'Elasticsearch (product search)', 'Kinesis (clickstream)'],
  },
  {
    id: 'github',
    name: 'GitHub',
    emoji: '🐙',
    color: '#238636',
    tagline: 'Distributed version control hosting, CI/CD, and code collaboration',
    scale: '100M developers, 420M repositories, 4B+ contributions/year',
    keyInsights: [
      'Git repositories stored as packed objects on distributed file storage — each repo is a directory of git objects',
      'Pull requests use Optimistic UI + eventual consistency — your PR creation appears instantly, backend processes async',
      'GitHub Actions runners are ephemeral VMs (on Azure) that execute CI/CD workflows defined in YAML',
      'Code search uses a custom inverted index (Blackbird) that tokenizes and indexes all code for sub-second search',
      'GitHub Copilot uses OpenAI Codex models served via Azure OpenAI — prompt is code context window',
    ],
    techStack: ['Ruby on Rails (web app)', 'MySQL (metadata)', 'Git (VCS)', 'Elasticsearch (code search)', 'Kafka (event pipeline)', 'Azure (GitHub Actions runners)'],
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    emoji: '🏠',
    color: '#ff5a5f',
    tagline: 'Global home-sharing marketplace with real-time availability and booking',
    scale: '150M+ users, 6.6M active listings across 220 countries',
    keyInsights: [
      'Search uses Elasticsearch with geospatial filtering + custom ranking that balances relevance, price, and host response rate',
      'Calendar availability uses an optimistic locking approach — a booking attempt acquires a database-level lock on the date range',
      'Dynamic pricing (Smart Pricing) uses ML models trained on historical booking data, seasonality, and local events',
      'Service-oriented architecture: listing service, search service, payment service, messaging service — each with own DB',
      'Review system uses a two-sided model (host reviews guest + guest reviews host) revealed simultaneously to prevent gaming',
    ],
    techStack: ['MySQL (listings, bookings)', 'Elasticsearch (search)', 'Redis (sessions, caching)', 'Kafka (events)', 'Airflow (ML pipelines)', 'Kubernetes (container orchestration)'],
  },
];

const NODE_COLORS = {
  client:   { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.15)', text: '#f8fafc' },
  gateway:  { bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.4)',   text: '#818cf8' },
  service:  { bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.4)',   text: '#38bdf8' },
  cache:    { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.4)',   text: '#fbbf24' },
  database: { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.4)',   text: '#34d399' },
  queue:    { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.4)',  text: '#c4b5fd' },
  cdn:      { bg: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.4)',  text: '#fb7185' },
  storage:  { bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.4)',   text: '#34d399' },
};

type NodeType = keyof typeof NODE_COLORS;

interface SVGNode {
  id: string;
  label: string;
  sublabel?: string;
  type: NodeType;
  x: number;
  y: number;
  w?: number;
  description: string;
}

interface SVGEdge {
  from: string;
  to: string;
  label?: string;
  color?: string;
  dashed?: boolean;
  animated?: boolean;
}

interface Diagram {
  nodes: SVGNode[];
  edges: SVGEdge[];
}

function makeDiagrams(): Record<string, Diagram> {
  return {
    youtube: {
      nodes: [
        { id: 'client',     label: 'Browser / App', type: 'client',   x: 50,  y: 170, description: 'Web or mobile client. Sends upload requests and streams video segments via HLS/DASH adaptive bitrate.' },
        { id: 'api_gw',     label: 'API Gateway',   type: 'gateway',  x: 220, y: 170, description: 'Routes requests — upload traffic to Upload Service, playback to Video Service, search to Search Service.' },
        { id: 'upload',     label: 'Upload Service', sublabel: 'chunked', type: 'service', x: 390, y: 80, description: 'Receives raw video chunks from client. Stores to raw storage and enqueues transcoding jobs.' },
        { id: 'transcode',  label: 'Transcode Workers', sublabel: 'parallel', type: 'service', x: 580, y: 80, description: 'Scales horizontally. Each worker encodes one resolution (360p/720p/1080p/4K) + multiple codecs (H.264, AV1).' },
        { id: 'video_svc',  label: 'Video Service',  type: 'service',  x: 390, y: 170, description: 'Serves video metadata and generates signed CDN URLs for segment playback. Validates watch permissions.' },
        { id: 'cdn',        label: 'CDN Edge',       sublabel: 'global', type: 'cdn', x: 580, y: 170, description: 'Caches encoded video segments at 130+ PoPs globally. Serves 95%+ of playback traffic without hitting origin.' },
        { id: 'rec_engine', label: 'Recommendation', type: 'service',  x: 390, y: 270, description: 'Two-tower neural net: user embedding × video embedding → ranking score. Trained on watch history and engagement signals.' },
        { id: 'kafka',      label: 'Kafka',           sublabel: 'events', type: 'queue', x: 220, y: 270, description: 'Event bus for watch events, likes, comments. Feeds analytics, recommendations, and ad serving pipelines.' },
        { id: 'bigtable',   label: 'Bigtable',        sublabel: 'metadata', type: 'database', x: 580, y: 270, description: 'Stores video metadata, channel info, comments. Wide-column design for high-volume point reads.' },
        { id: 'gcs',        label: 'Cloud Storage',   sublabel: 'video files', type: 'storage', x: 740, y: 170, description: 'Stores raw uploaded video and all transcoded output segments. Petabyte-scale durable object storage.' },
      ],
      edges: [
        { from: 'client',    to: 'api_gw',    label: 'HTTPS',    animated: true },
        { from: 'api_gw',    to: 'upload',    label: 'upload',   color: 'rgba(14,165,233,0.8)' },
        { from: 'api_gw',    to: 'video_svc', label: 'play',     color: 'rgba(99,102,241,0.8)' },
        { from: 'upload',    to: 'transcode', label: 'enqueue',  color: 'rgba(245,158,11,0.8)', animated: true },
        { from: 'transcode', to: 'gcs',       label: 'store',    color: 'rgba(52,211,153,0.8)' },
        { from: 'transcode', to: 'cdn',       label: 'push',     color: 'rgba(251,113,133,0.8)' },
        { from: 'video_svc', to: 'cdn',       label: 'CDN URL',  color: 'rgba(251,113,133,0.8)' },
        { from: 'cdn',       to: 'client',    label: 'segments', color: 'rgba(251,113,133,0.8)', dashed: true },
        { from: 'client',    to: 'kafka',     label: 'events',   color: 'rgba(167,139,250,0.6)', dashed: true },
        { from: 'kafka',     to: 'rec_engine',label: 'signals',  color: 'rgba(167,139,250,0.8)', animated: true },
        { from: 'video_svc', to: 'bigtable',  label: 'metadata', color: 'rgba(16,185,129,0.8)' },
      ],
    },

    twitter: {
      nodes: [
        { id: 'client',    label: 'Client',         type: 'client',   x: 50,  y: 180, description: 'Web/iOS/Android app. Posts tweets and reads home timeline on each screen load.' },
        { id: 'api_gw',    label: 'API Gateway',    type: 'gateway',  x: 220, y: 180, description: 'Auth, rate limiting, and routing to tweet or timeline service based on request path.' },
        { id: 'tweet_svc', label: 'Tweet Service',  type: 'service',  x: 390, y: 100, description: 'Writes tweet to Cassandra. Triggers fan-out service async via Kafka.' },
        { id: 'fanout',    label: 'Fan-out Service',sublabel:'async', type: 'service', x: 580, y: 100, description: 'For users with ≤N followers: pushes tweet ID into every follower\'s Redis timeline sorted set. Celebrities skip fan-out (read merge at timeline service).' },
        { id: 'timeline',  label: 'Timeline Service',type: 'service', x: 390, y: 260, description: 'Reads from Redis cache. For celebrity follows, fetches their latest tweets and merges at read time.' },
        { id: 'redis',     label: 'Redis',           sublabel: 'timeline cache', type: 'cache', x: 580, y: 180, description: 'Sorted Set per user storing tweet IDs in chronological order. Read path hits Redis first; DB only on cold miss.' },
        { id: 'cassandra', label: 'Cassandra',       sublabel: 'tweets', type: 'database', x: 740, y: 100, description: 'Immutable tweet store. Partitioned by (user_id, tweet_id). LSM tree optimizes write throughput.' },
        { id: 'kafka',     label: 'Kafka',           sublabel: 'events', type: 'queue', x: 220, y: 100, description: 'Event bus. Tweet events fan out to: fan-out service, search indexer, analytics, ad serving.' },
        { id: 'search',    label: 'Search Index',    sublabel: 'Earlybird', type: 'service', x: 740, y: 260, description: 'Near-real-time Lucene-based index. Indexes tweets within seconds. Powers search and trending topics.' },
      ],
      edges: [
        { from: 'client',    to: 'api_gw',    animated: true },
        { from: 'api_gw',    to: 'tweet_svc', label: 'POST tweet', color: 'rgba(14,165,233,0.8)' },
        { from: 'api_gw',    to: 'timeline',  label: 'GET timeline', color: 'rgba(99,102,241,0.8)' },
        { from: 'tweet_svc', to: 'cassandra', label: 'persist',  color: 'rgba(16,185,129,0.8)' },
        { from: 'tweet_svc', to: 'kafka',     label: 'publish',  color: 'rgba(167,139,250,0.8)', animated: true },
        { from: 'kafka',     to: 'fanout',    label: 'consume',  color: 'rgba(245,158,11,0.8)', animated: true },
        { from: 'fanout',    to: 'redis',     label: 'push IDs', color: 'rgba(245,158,11,0.8)' },
        { from: 'timeline',  to: 'redis',     label: 'read',     color: 'rgba(245,158,11,0.8)' },
        { from: 'kafka',     to: 'search',    label: 'index',    color: 'rgba(167,139,250,0.6)', dashed: true },
      ],
    },

    discord: {
      nodes: [
        { id: 'alice',     label: 'Alice (Client)',  type: 'client',   x: 50,  y: 180, description: 'WebSocket client. Maintains persistent connection to a Gateway server.' },
        { id: 'gateway',   label: 'Gateway Server', sublabel: 'WebSocket', type: 'gateway', x: 210, y: 180, description: 'Maintains persistent WebSocket connections. Stateless — maps session state to Redis. Horizontally scalable.' },
        { id: 'msg_svc',   label: 'Message Service', type: 'service',  x: 390, y: 100, description: 'Validates, persists messages to Cassandra, and publishes MessageCreated event to Kafka.' },
        { id: 'presence',  label: 'Presence Service',type: 'service',  x: 390, y: 260, description: 'Tracks online/offline/DND status. Publishes presence changes via Redis pub/sub to all interested gateways.' },
        { id: 'redis',     label: 'Redis',           sublabel: 'sessions + pub/sub', type: 'cache', x: 580, y: 180, description: 'Stores: (1) session → gateway mapping, (2) presence pub/sub channels, (3) read state (last-read message IDs).' },
        { id: 'cassandra', label: 'Cassandra',        sublabel: 'messages', type: 'database', x: 580, y: 80, description: 'Primary message store. Partition key: (channel_id). Clustering key: message_id (Snowflake). Optimized for time-ordered reads per channel.' },
        { id: 'kafka',     label: 'Kafka',            sublabel: 'events', type: 'queue', x: 580, y: 280, description: 'Message events fan-out to: push notifications (for offline users), search indexing, audit logs.' },
        { id: 'sfu',       label: 'SFU Server',       sublabel: 'voice/video', type: 'service', x: 210, y: 80, description: 'Selective Forwarding Unit: receives one media stream from each participant and forwards to others. Built on WebRTC.' },
        { id: 'bob',       label: 'Bob (Client)',      type: 'client',   x: 740, y: 180, description: 'Receives messages via its own persistent WebSocket connection to a (different) Gateway server.' },
      ],
      edges: [
        { from: 'alice',    to: 'gateway',  label: 'WebSocket',  animated: true, color: 'rgba(88,101,242,0.8)' },
        { from: 'gateway',  to: 'msg_svc',  label: 'send msg',   color: 'rgba(14,165,233,0.8)' },
        { from: 'msg_svc',  to: 'cassandra',label: 'persist',    color: 'rgba(16,185,129,0.8)' },
        { from: 'msg_svc',  to: 'kafka',    label: 'publish',    color: 'rgba(167,139,250,0.8)', animated: true },
        { from: 'gateway',  to: 'redis',    label: 'subscribe',  color: 'rgba(245,158,11,0.6)', dashed: true },
        { from: 'presence', to: 'redis',    label: 'pub/sub',    color: 'rgba(245,158,11,0.8)' },
        { from: 'redis',    to: 'gateway',  label: 'fan-out',    color: 'rgba(245,158,11,0.8)', animated: true },
        { from: 'gateway',  to: 'bob',      label: 'push msg',   color: 'rgba(88,101,242,0.8)', animated: true },
        { from: 'alice',    to: 'sfu',      label: 'WebRTC',     color: 'rgba(99,102,241,0.6)', dashed: true },
      ],
    },

    uber: {
      nodes: [
        { id: 'rider',    label: 'Rider App',      type: 'client',   x: 50,  y: 100, description: 'Mobile app. Sends ride request with pickup/dropoff coordinates. Polls for driver assignment.' },
        { id: 'driver',   label: 'Driver App',     type: 'client',   x: 50,  y: 270, description: 'Streams GPS coordinates every 4 seconds. Receives trip assignment and navigation instructions.' },
        { id: 'api_gw',   label: 'API Gateway',    type: 'gateway',  x: 220, y: 180, description: 'Authentication, rate limiting, and routing to appropriate microservices.' },
        { id: 'dispatch', label: 'Dispatch Service',type: 'service',  x: 400, y: 100, description: 'Core matching engine. Finds nearest available drivers using Redis Geo queries. Runs ETA and routing algorithms.' },
        { id: 'location', label: 'Location Service',type: 'service', x: 400, y: 270, description: 'Ingests driver GPS pings. Updates Redis geospatial index. Rate-limits updates to once every 4 seconds per driver.' },
        { id: 'redis_geo',label: 'Redis Geo',       sublabel: 'H3 grid', type: 'cache', x: 580, y: 180, description: 'Stores driver lat/lng as Redis GEO commands. GEORADIUS queries return nearest drivers in O(N+log M) time.' },
        { id: 'kafka',    label: 'Kafka',            sublabel: 'events', type: 'queue', x: 220, y: 100, description: 'Streams trip events to: billing service, driver pay, fraud detection, surge pricing, analytics.' },
        { id: 'pricing',  label: 'Surge Pricing',   type: 'service',  x: 580, y: 80, description: 'Computes supply/demand ratio per H3 cell every minute. Multiplier stored in Redis for low-latency reads by Dispatch.' },
        { id: 'mysql',    label: 'MySQL (Schemaless)',sublabel: 'trips', type: 'database', x: 580, y: 280, description: 'Trip lifecycle storage using consistent hashing for sharding. Schemaless layer adds schema-on-read flexibility.' },
        { id: 'maps',     label: 'Maps / ETA',       type: 'service',  x: 740, y: 180, description: 'Routing engine for ETA calculation and navigation. Uber built its own mapping stack (H3, routing graph).' },
      ],
      edges: [
        { from: 'rider',    to: 'api_gw',    label: 'request ride', animated: true },
        { from: 'driver',   to: 'api_gw',    label: 'GPS ping',     animated: true, color: 'rgba(16,185,129,0.8)' },
        { from: 'api_gw',   to: 'dispatch',  label: 'match',        color: 'rgba(14,165,233,0.8)' },
        { from: 'api_gw',   to: 'location',  label: 'update loc',   color: 'rgba(16,185,129,0.8)' },
        { from: 'location', to: 'redis_geo', label: 'GEOADD',       color: 'rgba(245,158,11,0.8)', animated: true },
        { from: 'dispatch', to: 'redis_geo', label: 'GEORADIUS',    color: 'rgba(245,158,11,0.8)' },
        { from: 'dispatch', to: 'maps',      label: 'ETA',          color: 'rgba(99,102,241,0.6)' },
        { from: 'dispatch', to: 'kafka',     label: 'trip created', color: 'rgba(167,139,250,0.8)', animated: true },
        { from: 'kafka',    to: 'pricing',   label: 'demand signals',color: 'rgba(245,158,11,0.6)', dashed: true },
        { from: 'pricing',  to: 'redis_geo', label: 'update surge', color: 'rgba(245,158,11,0.6)', dashed: true },
        { from: 'dispatch', to: 'mysql',     label: 'persist trip', color: 'rgba(16,185,129,0.8)' },
      ],
    },

    netflix: {
      nodes: [
        { id: 'client',   label: 'Client App',      type: 'client',   x: 50,  y: 180, description: 'Smart TV, browser, mobile. Fetches personalized home shelf and streams via adaptive bitrate (HLS/DASH).' },
        { id: 'zuul',     label: 'Zuul Gateway',     type: 'gateway',  x: 220, y: 180, description: 'API gateway handling auth, A/B test routing, and load balancing across 1000+ microservices.' },
        { id: 'transcode',label: 'Encoding Service', sublabel: '1000+ profiles', type: 'service', x: 390, y: 80, description: 'Encodes each title into 1200+ bitrate/resolution/codec combinations. Runs on AWS EC2 Spot fleet for cost efficiency.' },
        { id: 'rec',      label: 'Recommender',      type: 'service',  x: 390, y: 180, description: 'Collaborative filtering + neural embedding models. Generates personalized shelf titles for each user per session.' },
        { id: 'streaming',label: 'Streaming Service',type: 'service',  x: 390, y: 280, description: 'Handles playback session: validates DRM license, selects optimal CDN, returns manifest (chunk URLs) to client.' },
        { id: 'cdn',      label: 'Open Connect CDN', sublabel: 'ISP embedded', type: 'cdn', x: 580, y: 80, description: 'Netflix-owned CDN appliances installed at ISPs worldwide. Store full catalog. Serve 95% of traffic with no AWS egress cost.' },
        { id: 'cassandra',label: 'Cassandra',         sublabel: 'catalog + history', type: 'database', x: 580, y: 180, description: 'Stores: viewing history, user ratings, show metadata. Multi-region active-active replication.' },
        { id: 'kafka',    label: 'Kafka',              sublabel: 'events', type: 'queue', x: 580, y: 280, description: 'Streams playback events → recommendation model training, A/B testing, billing, and monitoring pipelines.' },
        { id: 'chaos',    label: 'Chaos Monkey',       type: 'service',  x: 220, y: 80, description: 'Intentionally terminates random production EC2 instances to verify services are resilient to instance failures.' },
      ],
      edges: [
        { from: 'client',    to: 'zuul',      animated: true },
        { from: 'zuul',      to: 'rec',       label: 'browse',    color: 'rgba(99,102,241,0.8)' },
        { from: 'zuul',      to: 'streaming', label: 'play',      color: 'rgba(14,165,233,0.8)' },
        { from: 'transcode', to: 'cdn',       label: 'push segments', color: 'rgba(251,113,133,0.8)', animated: true },
        { from: 'streaming', to: 'cdn',       label: 'manifest URL',  color: 'rgba(251,113,133,0.8)' },
        { from: 'cdn',       to: 'client',    label: 'video chunks',  color: 'rgba(251,113,133,0.8)', dashed: true },
        { from: 'rec',       to: 'cassandra', label: 'history',   color: 'rgba(16,185,129,0.8)' },
        { from: 'streaming', to: 'kafka',     label: 'play events',   color: 'rgba(167,139,250,0.8)', animated: true },
        { from: 'chaos',     to: 'zuul',      label: 'kill →',    color: 'rgba(239,68,68,0.5)', dashed: true },
      ],
    },

    instagram: {
      nodes: [
        { id: 'client',  label: 'Mobile Client',   type: 'client',   x: 50,  y: 180, description: 'iOS/Android app. Uploads photos and fetches personalized feed.' },
        { id: 'api_gw',  label: 'API Gateway',     type: 'gateway',  x: 220, y: 180, description: 'Nginx + Zuul-style gateway. Routes to upload, feed, or explore service.' },
        { id: 'upload',  label: 'Upload Service',  type: 'service',  x: 390, y: 80, description: 'Receives photo, generates multiple resolutions, stores to object storage. Publishes UploadComplete event.' },
        { id: 'feed',    label: 'Feed Service',     type: 'service',  x: 390, y: 180, description: 'Assembles home feed. For active users: reads pre-computed sorted set from Redis. Merges celebrity posts at read time.' },
        { id: 'explore', label: 'Explore / Rec',   type: 'service',  x: 390, y: 280, description: 'Two-tower neural net ranking for Explore page. User embedding × content embedding → relevance score.' },
        { id: 'storage', label: 'Photo Storage',   sublabel: 'F4/Haystack', type: 'storage', x: 580, y: 80, description: 'Meta\'s Haystack (hot) and F4 (warm/cold) blob stores optimized for photo serving. Billions of photos at petabyte scale.' },
        { id: 'redis',   label: 'Redis',            sublabel: 'feed cache', type: 'cache', x: 580, y: 180, description: 'Stores pre-computed feed as sorted sets per user. Fan-out worker pushes photo IDs on upload event.' },
        { id: 'tao',     label: 'TAO / MySQL',      sublabel: 'social graph', type: 'database', x: 580, y: 280, description: 'TAO is Meta\'s distributed graph cache on MySQL. Stores follow graph for efficient fan-out and feed assembly.' },
        { id: 'kafka',   label: 'Kafka',             sublabel: 'events', type: 'queue', x: 220, y: 80, description: 'Photo upload events trigger: fan-out to follower feeds, push notifications, search indexing.' },
      ],
      edges: [
        { from: 'client',  to: 'api_gw',  animated: true },
        { from: 'api_gw',  to: 'upload',  label: 'upload photo', color: 'rgba(14,165,233,0.8)' },
        { from: 'api_gw',  to: 'feed',    label: 'get feed',     color: 'rgba(99,102,241,0.8)' },
        { from: 'upload',  to: 'storage', label: 'store',        color: 'rgba(52,211,153,0.8)' },
        { from: 'upload',  to: 'kafka',   label: 'UploadComplete', color: 'rgba(167,139,250,0.8)', animated: true },
        { from: 'kafka',   to: 'redis',   label: 'fan-out',      color: 'rgba(245,158,11,0.8)', animated: true },
        { from: 'feed',    to: 'redis',   label: 'read feed',    color: 'rgba(245,158,11,0.8)' },
        { from: 'feed',    to: 'tao',     label: 'celebrity fetch', color: 'rgba(16,185,129,0.6)', dashed: true },
        { from: 'explore', to: 'tao',     label: 'graph signals',  color: 'rgba(16,185,129,0.6)', dashed: true },
      ],
    },

    whatsapp: {
      nodes: [
        { id: 'alice',   label: 'Alice (Client)',  type: 'client',   x: 50,  y: 180, description: 'Mobile app. Generates encrypted ciphertext locally using Signal Protocol. Sends over WebSocket.' },
        { id: 'gateway', label: 'XMPP Gateway',    sublabel: 'Erlang', type: 'gateway', x: 220, y: 180, description: 'Erlang/OTP process handles 1M+ concurrent connections per node via lightweight BEAM processes. Maps JID → connection.' },
        { id: 'msg_svc', label: 'Message Router',  type: 'service',  x: 390, y: 100, description: 'Routes message to recipient\'s XMPP gateway if online. Otherwise queues in Cassandra for deferred delivery.' },
        { id: 'media',   label: 'Media Upload',    type: 'service',  x: 390, y: 260, description: 'Client uploads encrypted media blob directly to WhatsApp CDN. Only the download URL is sent in the message.' },
        { id: 'mnesia',  label: 'Mnesia (Erlang)',  sublabel: 'sessions', type: 'cache', x: 580, y: 100, description: 'Erlang\'s built-in distributed DB. Stores: session routing table (JID → gateway node). Millisecond lookups.' },
        { id: 'cassandra',label: 'Cassandra',        sublabel: 'offline queue', type: 'database', x: 580, y: 180, description: 'Stores messages for offline recipients until delivery. Message deleted from server after delivery + receipt confirmation.' },
        { id: 'cdn',     label: 'Media CDN',        type: 'cdn',      x: 580, y: 280, description: 'Stores encrypted media blobs. Only the uploader knows the decryption key — server cannot read media content.' },
        { id: 'bob',     label: 'Bob (Client)',      type: 'client',   x: 740, y: 180, description: 'Receives ciphertext over WebSocket. Decrypts locally using Signal Protocol private key. Server never sees plaintext.' },
      ],
      edges: [
        { from: 'alice',   to: 'gateway',  label: 'encrypted msg', animated: true, color: 'rgba(37,211,102,0.8)' },
        { from: 'gateway', to: 'msg_svc',  label: 'route',         color: 'rgba(14,165,233,0.8)' },
        { from: 'msg_svc', to: 'mnesia',   label: 'is Bob online?',color: 'rgba(245,158,11,0.8)' },
        { from: 'msg_svc', to: 'cassandra',label: 'queue offline',  color: 'rgba(16,185,129,0.8)', dashed: true },
        { from: 'msg_svc', to: 'gateway',  label: 'deliver',       color: 'rgba(37,211,102,0.8)', animated: true },
        { from: 'gateway', to: 'bob',      label: 'push ciphertext',animated: true, color: 'rgba(37,211,102,0.8)' },
        { from: 'alice',   to: 'media',    label: 'upload encrypted blob', color: 'rgba(251,113,133,0.6)', dashed: true },
        { from: 'media',   to: 'cdn',      label: 'store',         color: 'rgba(251,113,133,0.8)' },
      ],
    },

    amazon: {
      nodes: [
        { id: 'client',    label: 'Customer Browser', type: 'client',   x: 50,  y: 180, description: 'Web/mobile. Browses product catalog, adds to cart, and places orders.' },
        { id: 'api_gw',    label: 'API Gateway',      type: 'gateway',  x: 220, y: 180, description: 'Aggregates data from 100+ services for product detail page. Auth and rate limiting.' },
        { id: 'search',    label: 'Search Service',   sublabel: 'A9', type: 'service', x: 390, y: 80, description: 'Amazon\'s A9 search engine. Full-text + filtering on product catalog. Relevance + sponsored ranking.' },
        { id: 'cart',      label: 'Cart Service',     type: 'service',  x: 390, y: 180, description: 'Stateless service backed by DynamoDB. Merges guest + signed-in carts. Uses optimistic locking for concurrent updates.' },
        { id: 'order',     label: 'Order Service',    type: 'service',  x: 390, y: 280, description: 'Orchestrates order saga: payment → inventory reservation → warehouse fulfillment → shipping. Uses AWS Step Functions.' },
        { id: 'dynamo',    label: 'DynamoDB',          sublabel: 'cart + inventory', type: 'database', x: 580, y: 180, description: 'Cart storage and inventory counts. Conditional writes for atomic decrements without 2PC. Sub-millisecond latency.' },
        { id: 'rds',       label: 'Aurora (RDS)',      sublabel: 'orders', type: 'database', x: 580, y: 280, description: 'Relational store for orders and financial transactions requiring ACID guarantees.' },
        { id: 'sqs',       label: 'SQS / SNS',         sublabel: 'async events', type: 'queue', x: 580, y: 80, description: 'Order placed events fan out via SNS to: fulfillment, payment confirmation email, recommendation updates.' },
        { id: 'es',        label: 'Elasticsearch',     sublabel: 'product search', type: 'service', x: 740, y: 80, description: 'Full-text search index on product catalog. Near-real-time updates from product service change events.' },
        { id: 's3',        label: 'S3',                 sublabel: 'product images', type: 'storage', x: 740, y: 180, description: 'Product images, seller documents, and static assets. CloudFront CDN serves product images globally.' },
      ],
      edges: [
        { from: 'client',  to: 'api_gw',  animated: true },
        { from: 'api_gw',  to: 'search',  label: 'search',     color: 'rgba(14,165,233,0.8)' },
        { from: 'api_gw',  to: 'cart',    label: 'add to cart', color: 'rgba(99,102,241,0.8)' },
        { from: 'api_gw',  to: 'order',   label: 'checkout',   color: 'rgba(245,158,11,0.8)' },
        { from: 'cart',    to: 'dynamo',  label: 'read/write',  color: 'rgba(16,185,129,0.8)' },
        { from: 'order',   to: 'dynamo',  label: 'reserve inv', color: 'rgba(16,185,129,0.8)' },
        { from: 'order',   to: 'rds',     label: 'persist order', color: 'rgba(16,185,129,0.8)' },
        { from: 'order',   to: 'sqs',     label: 'OrderPlaced', color: 'rgba(167,139,250,0.8)', animated: true },
        { from: 'search',  to: 'es',      label: 'query',      color: 'rgba(14,165,233,0.6)', dashed: true },
        { from: 'api_gw',  to: 's3',      label: 'images',     color: 'rgba(52,211,153,0.6)', dashed: true },
      ],
    },

    github: {
      nodes: [
        { id: 'client',   label: 'Developer',       type: 'client',   x: 50,  y: 180, description: 'git push, PR creation, code review, and Actions trigger via browser or git CLI.' },
        { id: 'api',      label: 'Rails API / Web', type: 'gateway',  x: 220, y: 180, description: 'GitHub\'s Ruby on Rails monolith + extracted services. Handles auth, repo metadata, and PR state machine.' },
        { id: 'git_svc',  label: 'Git Service',      type: 'service',  x: 390, y: 80, description: 'Manages pack objects and git protocol. Distributed file store via Gitaly — each repo shard on a Gitaly node.' },
        { id: 'actions',  label: 'GitHub Actions',   sublabel: 'CI/CD', type: 'service', x: 390, y: 180, description: 'Workflow runner. Ephemeral VMs (Azure) execute YAML-defined jobs. Results stream back in real-time via SSE.' },
        { id: 'search',   label: 'Code Search',      sublabel: 'Blackbird', type: 'service', x: 390, y: 280, description: 'Custom inverted index (Blackbird). Tokenizes code with language-aware lexers. Sub-second search across all public code.' },
        { id: 'gitaly',   label: 'Gitaly',            sublabel: 'git storage', type: 'storage', x: 580, y: 80, description: 'gRPC service wrapping git operations on disk. Sharded across many nodes. Each repo assigned to a Gitaly shard.' },
        { id: 'mysql',    label: 'MySQL',              sublabel: 'metadata', type: 'database', x: 580, y: 180, description: 'Repo metadata, PR state, issue data, user data. Sharded MySQL with Vitess for horizontal scaling.' },
        { id: 'kafka',    label: 'Kafka',              sublabel: 'events', type: 'queue', x: 580, y: 280, description: 'Push/PR events fan out to: webhooks, GitHub Pages builds, notifications, audit log, Actions triggers.' },
        { id: 'runners',  label: 'Actions Runners',   sublabel: 'Azure VMs', type: 'service', x: 740, y: 180, description: 'Ephemeral VMs that run CI/CD workflows. Self-hosted runners also supported. Results streamed via WebSocket.' },
      ],
      edges: [
        { from: 'client',  to: 'api',     animated: true },
        { from: 'api',     to: 'git_svc', label: 'git protocol', color: 'rgba(35,134,54,0.8)' },
        { from: 'api',     to: 'actions', label: 'trigger workflow', color: 'rgba(14,165,233,0.8)' },
        { from: 'api',     to: 'search',  label: 'code search', color: 'rgba(99,102,241,0.8)' },
        { from: 'git_svc', to: 'gitaly',  label: 'read/write objects', color: 'rgba(35,134,54,0.8)' },
        { from: 'api',     to: 'mysql',   label: 'metadata',    color: 'rgba(16,185,129,0.8)' },
        { from: 'api',     to: 'kafka',   label: 'events',      color: 'rgba(167,139,250,0.8)', animated: true },
        { from: 'kafka',   to: 'actions', label: 'trigger',     color: 'rgba(167,139,250,0.8)', animated: true },
        { from: 'actions', to: 'runners', label: 'dispatch job', color: 'rgba(14,165,233,0.8)', animated: true },
        { from: 'runners', to: 'api',     label: 'stream logs', color: 'rgba(14,165,233,0.6)', dashed: true },
      ],
    },

    airbnb: {
      nodes: [
        { id: 'client',   label: 'Guest / Host',   type: 'client',   x: 50,  y: 180, description: 'Web and mobile app for searching listings, messaging hosts, and managing bookings.' },
        { id: 'api_gw',   label: 'API Gateway',    type: 'gateway',  x: 220, y: 180, description: 'Auth, rate limiting, and routing. Backend for Frontend (BFF) pattern — GraphQL API assembles data from services.' },
        { id: 'search',   label: 'Search Service', sublabel: 'geo + ranking', type: 'service', x: 390, y: 80, description: 'Elasticsearch with geospatial bounding box + date availability filter. Ranking: relevance × price × host response rate.' },
        { id: 'listing',  label: 'Listing Service', type: 'service', x: 390, y: 180, description: 'CRUD for listing metadata (photos, description, amenities). Photos stored in S3, served via CDN.' },
        { id: 'booking',  label: 'Booking Service', type: 'service', x: 390, y: 280, description: 'Calendar availability logic with optimistic locking. Prevents double-booking via DB-level row lock on date range.' },
        { id: 'es',       label: 'Elasticsearch',   sublabel: 'listings', type: 'database', x: 580, y: 80, description: 'Full-text + geo search index. Updated via change data capture from MySQL listing DB.' },
        { id: 'redis',    label: 'Redis',             sublabel: 'sessions + cache', type: 'cache', x: 580, y: 180, description: 'Session storage, listing cache (hot listings), search result cache for common queries.' },
        { id: 'mysql',    label: 'MySQL',              sublabel: 'listings + bookings', type: 'database', x: 580, y: 280, description: 'Source of truth for listing inventory and booking records. Sharded by listing_id. Uses pessimistic locks on booking.' },
        { id: 'kafka',    label: 'Kafka',              sublabel: 'events', type: 'queue', x: 220, y: 80, description: 'Booking events fan out to: payment service, host notifications, review triggers, fraud detection.' },
        { id: 'pricing',  label: 'Smart Pricing',     type: 'service', x: 740, y: 180, description: 'ML model for dynamic pricing recommendations. Trained on seasonality, local events, competitor pricing, and booking demand.' },
      ],
      edges: [
        { from: 'client',  to: 'api_gw',  animated: true },
        { from: 'api_gw',  to: 'search',  label: 'search',     color: 'rgba(14,165,233,0.8)' },
        { from: 'api_gw',  to: 'listing', label: 'view listing', color: 'rgba(99,102,241,0.8)' },
        { from: 'api_gw',  to: 'booking', label: 'book',        color: 'rgba(245,158,11,0.8)' },
        { from: 'search',  to: 'es',      label: 'query',       color: 'rgba(14,165,233,0.8)' },
        { from: 'listing', to: 'redis',   label: 'cache hot',   color: 'rgba(245,158,11,0.8)' },
        { from: 'booking', to: 'mysql',   label: 'lock + write', color: 'rgba(16,185,129,0.8)' },
        { from: 'booking', to: 'kafka',   label: 'BookingConfirmed', color: 'rgba(167,139,250,0.8)', animated: true },
        { from: 'listing', to: 'pricing', label: 'price signals', color: 'rgba(99,102,241,0.5)', dashed: true },
        { from: 'search',  to: 'redis',   label: 'cache results', color: 'rgba(245,158,11,0.6)', dashed: true },
      ],
    },
  };
}

const ALL_DIAGRAMS = makeDiagrams();

function renderDiagram(
  systemId: string,
  selectedNode: string | null,
  onNodeClick: (id: string) => void
): JSX.Element {
  const diagram = ALL_DIAGRAMS[systemId];
  if (!diagram) return <></>;

  const NODE_W = 130;
  const NODE_H = 52;

  // Build node map for edge rendering
  const nodeMap: Record<string, SVGNode> = {};
  diagram.nodes.forEach(n => { nodeMap[n.id] = n; });

  return (
    <svg viewBox="0 0 870 380" width="100%" height="auto"
      style={{ background: 'rgba(5,10,20,0.7)', borderRadius: '14px', border: '1px solid var(--border-glass)', display: 'block' }}>
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
        </marker>
        <marker id="arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(14,165,233,0.9)" />
        </marker>
        <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(16,185,129,0.9)" />
        </marker>
        <marker id="arr-gold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(245,158,11,0.9)" />
        </marker>
        <marker id="arr-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(167,139,250,0.9)" />
        </marker>
        <marker id="arr-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(251,113,133,0.9)" />
        </marker>
      </defs>

      {/* Render edges */}
      {diagram.edges.map((edge, i) => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return null;

        const fx = from.x + NODE_W / 2;
        const fy = from.y + NODE_H / 2;
        const tx = to.x + NODE_W / 2;
        const ty = to.y + NODE_H / 2;

        // Choose edge color and marker
        const strokeColor = edge.color || '#475569';
        const markerRef = edge.color
          ? edge.color.includes('165,233') ? 'url(#arr-blue)'
          : edge.color.includes('185,129') ? 'url(#arr-green)'
          : edge.color.includes('158,11')  ? 'url(#arr-gold)'
          : edge.color.includes('139,250') ? 'url(#arr-purple)'
          : edge.color.includes('113,133') ? 'url(#arr-red)'
          : 'url(#arr)'
          : 'url(#arr)';

        // Shorten endpoints to not overlap node boxes
        const dx = tx - fx; const dy = ty - fy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pad = 28;
        const sx = fx + (dx / dist) * pad;
        const sy = fy + (dy / dist) * pad;
        const ex = tx - (dx / dist) * pad;
        const ey = ty - (dy / dist) * pad;

        const midX = (sx + ex) / 2;
        const midY = (sy + ey) / 2;

        return (
          <g key={i}>
            <line
              x1={sx} y1={sy} x2={ex} y2={ey}
              stroke={strokeColor}
              strokeWidth="1.8"
              strokeDasharray={edge.dashed ? '6,4' : undefined}
              markerEnd={markerRef}
              opacity={0.85}
            />
            {edge.animated && (
              <line x1={sx} y1={sy} x2={ex} y2={ey}
                className="svg-flow-line"
                stroke={strokeColor}
                strokeWidth="1.5"
                style={{ stroke: strokeColor }}
              />
            )}
            {edge.label && (
              <text x={midX} y={midY - 6} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Render nodes */}
      {diagram.nodes.map(node => {
        const colors = NODE_COLORS[node.type];
        const isSelected = selectedNode === node.id;
        return (
          <g key={node.id} className="svg-node" onClick={() => onNodeClick(node.id)} style={{ cursor: 'pointer' }}>
            <rect
              x={node.x} y={node.y}
              width={NODE_W} height={NODE_H}
              rx="9"
              fill={colors.bg}
              stroke={isSelected ? '#6366f1' : colors.border}
              strokeWidth={isSelected ? '2.5' : '1.5'}
              filter={isSelected ? 'drop-shadow(0 0 10px rgba(99,102,241,0.5))' : undefined}
            />
            <text
              x={node.x + NODE_W / 2}
              y={node.sublabel ? node.y + NODE_H / 2 - 5 : node.y + NODE_H / 2 + 5}
              textAnchor="middle"
              fill={colors.text}
              fontSize="12" fontWeight="700"
            >
              {node.label}
            </text>
            {node.sublabel && (
              <text
                x={node.x + NODE_W / 2}
                y={node.y + NODE_H / 2 + 10}
                textAnchor="middle"
                fill="#64748b"
                fontSize="9.5"
              >
                {node.sublabel}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export const SystemDiagrams: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const system = selectedSystem ? systems.find(s => s.id === selectedSystem) : null;
  const diagram = selectedSystem ? ALL_DIAGRAMS[selectedSystem] : null;
  const nodeDetail = selectedNode && diagram ? diagram.nodes.find(n => n.id === selectedNode) : null;

  if (selectedSystem && system && diagram) {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        {/* Back + header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => { setSelectedSystem(null); setSelectedNode(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)', borderRadius: '8px',
              padding: '8px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              transition: 'var(--transition-smooth)',
            }}
          >
            <ChevronLeft size={15} /> All Systems
          </button>
          <span style={{ fontSize: '28px' }}>{system.emoji}</span>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{system.name}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{system.tagline}</p>
          </div>
        </div>

        {/* Scale badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '20px', marginBottom: '20px',
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
          fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600
        }}>
          <Layers size={12} />
          {system.scale}
        </div>

        {/* Diagram */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={11} />
            Interactive Architecture — click any component for details
          </div>
          <div className="svg-scroll-container">
            {renderDiagram(selectedSystem, selectedNode, (id) => setSelectedNode(selectedNode === id ? null : id))}
          </div>
        </div>

        {/* Node Detail */}
        {nodeDetail && (
          <div className="glass-panel" style={{
            padding: '16px 20px', marginBottom: '20px',
            borderLeft: '4px solid var(--color-primary)',
            background: 'rgba(99,102,241,0.04)',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: '6px' }}>
              {nodeDetail.label} {nodeDetail.sublabel ? `(${nodeDetail.sublabel})` : ''}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.7 }}>
              {nodeDetail.description}
            </p>
          </div>
        )}

        {/* Key Insights + Tech Stack */}
        <div className="grid-insight-stack">
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              🔑 Key Design Insights
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {system.keyInsights.map((insight, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--color-secondary)', fontWeight: 800, flexShrink: 0, fontSize: '11px', marginTop: '2px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', minWidth: '200px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
              🛠 Tech Stack
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {system.techStack.map((tech, i) => (
                <div key={i} style={{
                  padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)'
                }}>
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Gallery view
  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="glow-text section-h1">
          Real-World System Architectures
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Interactive architecture diagrams for 10 of the world's largest systems. Click any component to explore how it works.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {systems.map(sys => (
          <button
            key={sys.id}
            onClick={() => setSelectedSystem(sys.id)}
            className="glass-panel glass-panel-interactive"
            style={{
              padding: '24px',
              textAlign: 'left',
              cursor: 'pointer',
              background: 'var(--surface-obsidian)',
              border: '1px solid var(--border-glass)',
              transition: 'var(--transition-smooth)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${sys.color}44`;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${sys.color}22`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-glass)';
              (e.currentTarget as HTMLElement).style.boxShadow = '';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>{sys.emoji}</span>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{sys.name}</h3>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {ALL_DIAGRAMS[sys.id].nodes.slice(0, 4).map(n => (
                    <span key={n.id} style={{
                      fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                      background: NODE_COLORS[n.type].bg,
                      color: NODE_COLORS[n.type].text,
                      border: `1px solid ${NODE_COLORS[n.type].border}`,
                      fontWeight: 600,
                    }}>
                      {n.label.split(' ')[0]}
                    </span>
                  ))}
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '1px 4px' }}>
                    +{ALL_DIAGRAMS[sys.id].nodes.length - 4} more
                  </span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {sys.tagline}
            </p>
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {sys.scale}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
