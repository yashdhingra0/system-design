import React, { useState } from 'react';
import { designPatterns } from '../data/designPatterns';
import type { DesignPattern } from '../data/designPatterns';
import {
  Stethoscope, Activity, AlertTriangle, CheckCircle2,
  ArrowRight, RotateCcw, ChevronRight, Lightbulb, Search
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface Symptom {
  id: string;
  label: string;
  category: SymptomCategory;
  patternIds: string[];  // ordered by relevance
  whyMap: Record<string, string>; // patternId → one-line reason
}

type SymptomCategory = 'Performance' | 'Scalability' | 'Reliability' | 'Data' | 'Architecture';

interface PatternRec {
  pattern: DesignPattern;
  score: number;
  reasons: string[];
}

// ── Category colours ─────────────────────────────────────────────────────────
const CAT_STYLE: Record<SymptomCategory, { bg: string; border: string; text: string; dot: string }> = {
  Performance:  { bg: 'rgba(139,124,246,0.08)', border: 'rgba(139,124,246,0.25)', text: '#8b7cf6', dot: '#8b7cf6' },
  Scalability:  { bg: 'rgba(56,189,248,0.08)',  border: 'rgba(56,189,248,0.25)',  text: '#38bdf8', dot: '#38bdf8' },
  Reliability:  { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', text: '#f87171', dot: '#f87171' },
  Data:         { bg: 'rgba(45,212,191,0.08)',  border: 'rgba(45,212,191,0.25)',  text: '#2dd4bf', dot: '#2dd4bf' },
  Architecture: { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)',  text: '#fbbf24', dot: '#fbbf24' },
};

// ── Pattern category → recommended colour ────────────────────────────────────
const PATTERN_CAT_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  Architectural: { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)',  text: 'var(--color-primary)' },
  Creational:    { bg: 'rgba(14,165,233,0.08)',   border: 'rgba(14,165,233,0.25)',  text: 'var(--color-secondary)' },
  Structural:    { bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.25)',  text: 'var(--color-teal)' },
  Behavioral:    { bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.25)',  text: 'var(--color-gold)' },
  Scaling:       { bg: 'rgba(139,124,246,0.08)',  border: 'rgba(139,124,246,0.25)', text: '#8b7cf6' },
  Caching:       { bg: 'rgba(45,212,191,0.08)',   border: 'rgba(45,212,191,0.25)',  text: '#2dd4bf' },
  Messaging:     { bg: 'rgba(56,189,248,0.08)',   border: 'rgba(56,189,248,0.25)',  text: '#38bdf8' },
  Reliability:   { bg: 'rgba(248,113,113,0.08)',  border: 'rgba(248,113,113,0.25)', text: '#f87171' },
  Microservices: { bg: 'rgba(251,191,36,0.08)',   border: 'rgba(251,191,36,0.25)',  text: '#fbbf24' },
};

// ── Symptom data ─────────────────────────────────────────────────────────────
const SYMPTOMS: Symptom[] = [
  // Performance
  {
    id: 'slow-reads',
    label: 'Reads / queries are too slow',
    category: 'Performance',
    patternIds: ['cache-aside', 'read-replicas', 'materialized-views', 'cdn'],
    whyMap: {
      'cache-aside':        'Serve hot data from in-memory cache, bypassing the slow DB entirely',
      'read-replicas':      'Distribute read traffic across multiple DB copies',
      'materialized-views': 'Pre-compute expensive aggregation queries so reads are instant',
      'cdn':                'Cache static/cacheable responses at the network edge',
    },
  },
  {
    id: 'slow-writes',
    label: 'Writes can\'t keep up with traffic',
    category: 'Performance',
    patternIds: ['write-behind', 'message-queue', 'database-sharding', 'cqrs'],
    whyMap: {
      'write-behind':      'Acknowledge writes immediately; flush to DB asynchronously in batches',
      'message-queue':     'Buffer write-heavy jobs in a queue so the DB isn\'t hit directly',
      'database-sharding': 'Split writes across N independent DB primaries to multiply write capacity',
      'cqrs':              'Separate write model from read model so each can scale independently',
    },
  },
  {
    id: 'db-overload',
    label: 'Database is constantly overwhelmed',
    category: 'Performance',
    patternIds: ['cache-aside', 'read-replicas', 'database-sharding', 'write-through'],
    whyMap: {
      'cache-aside':       'Intercept the majority of reads before they reach the DB',
      'read-replicas':     'Fan out reads across replicas; primary handles writes only',
      'database-sharding': 'Horizontal partitioning turns one overloaded DB into N parallel ones',
      'write-through':     'Cache handles reads; writes stay consistent without extra DB round-trips',
    },
  },
  {
    id: 'global-latency',
    label: 'Users far away get high latency',
    category: 'Performance',
    patternIds: ['cdn', 'read-replicas', 'consistent-hashing', 'data-partitioning'],
    whyMap: {
      'cdn':                'Serve assets from the nearest PoP — 200ms RTT → 10ms',
      'read-replicas':      'Place read replicas in each region so reads are geographically local',
      'consistent-hashing': 'Route requests to the nearest cache/storage node consistently',
      'data-partitioning':  'Partition data by region so queries only scan local data',
    },
  },

  // Scalability
  {
    id: 'traffic-spikes',
    label: 'Crashes / degrades during traffic spikes',
    category: 'Scalability',
    patternIds: ['horizontal-scaling', 'load-balancing', 'rate-limiting', 'cdn'],
    whyMap: {
      'horizontal-scaling': 'Auto-add stateless server instances to absorb the spike',
      'load-balancing':     'Distribute spike traffic across the instance pool',
      'rate-limiting':      'Shed excess load before it cascades to backends',
      'cdn':                'Absorb cacheable traffic at the edge before it hits origin',
    },
  },
  {
    id: 'bottleneck',
    label: 'One server is the bottleneck for everything',
    category: 'Scalability',
    patternIds: ['load-balancing', 'horizontal-scaling', 'database-sharding'],
    whyMap: {
      'load-balancing':     'Route each request to the least-loaded server in the pool',
      'horizontal-scaling': 'Make the service stateless and replicate across N instances',
      'database-sharding':  'If the bottleneck is your DB, split it across multiple shards',
    },
  },
  {
    id: 'data-too-large',
    label: 'Dataset is too large for one database',
    category: 'Scalability',
    patternIds: ['database-sharding', 'data-partitioning', 'consistent-hashing'],
    whyMap: {
      'database-sharding':  'Split rows across N independent DB instances using a shard key',
      'data-partitioning':  'Divide the table by range/hash/list so each partition is independently queryable',
      'consistent-hashing': 'Map data keys to nodes consistently, minimising reshuffling when nodes change',
    },
  },
  {
    id: 'cant-add-servers',
    label: 'Adding servers breaks session / state',
    category: 'Scalability',
    patternIds: ['horizontal-scaling', 'load-balancing'],
    whyMap: {
      'horizontal-scaling': 'Move session state to an external store (Redis) so any instance can serve any user',
      'load-balancing':     'With external session store, sticky sessions are no longer needed',
    },
  },

  // Reliability
  {
    id: 'cascade-failure',
    label: 'One failure cascades to every service',
    category: 'Reliability',
    patternIds: ['circuit-breaker', 'bulkhead', 'retry-pattern', 'failover'],
    whyMap: {
      'circuit-breaker': 'Trip open when a dependency fails — stop the cascade instantly',
      'bulkhead':        'Isolate thread/connection pools so one bad service can\'t exhaust all resources',
      'retry-pattern':   'Retry transient errors with backoff instead of letting them propagate',
      'failover':        'Automatically promote a standby when the primary goes down',
    },
  },
  {
    id: 'api-abuse',
    label: 'Clients hammering the API / DDoS risk',
    category: 'Reliability',
    patternIds: ['rate-limiting', 'api-gateway', 'circuit-breaker'],
    whyMap: {
      'rate-limiting':   'Enforce per-client request budgets — reject excess with 429',
      'api-gateway':     'Centralise rate limiting, auth, and DDoS protection at one edge layer',
      'circuit-breaker': 'Protect backends by tripping open when downstream is saturated',
    },
  },
  {
    id: 'no-ha',
    label: 'Service downtime when one node dies',
    category: 'Reliability',
    patternIds: ['failover', 'leader-election', 'load-balancing'],
    whyMap: {
      'failover':        'Automatically route traffic to a healthy standby within seconds',
      'leader-election': 'Elect a new leader from healthy cluster members without manual intervention',
      'load-balancing':  'Health-check instances and remove dead ones from rotation automatically',
    },
  },
  {
    id: 'flaky-dep',
    label: 'Flaky third-party API causing failures',
    category: 'Reliability',
    patternIds: ['circuit-breaker', 'retry-pattern', 'bulkhead'],
    whyMap: {
      'circuit-breaker': 'Fast-fail when the dependency is unhealthy instead of waiting for timeout',
      'retry-pattern':   'Transparently retry transient 5xx errors with exponential backoff + jitter',
      'bulkhead':        'Isolate the flaky call to its own thread pool so it can\'t starve core paths',
    },
  },

  // Data
  {
    id: 'distributed-tx',
    label: 'Business transaction spans multiple services',
    category: 'Data',
    patternIds: ['saga', 'distributed-transactions', 'event-sourcing'],
    whyMap: {
      'saga':                     'Chain local transactions with compensating actions on rollback',
      'distributed-transactions': 'Coordinate atomicity across services with 2PC or saga orchestration',
      'event-sourcing':           'Append immutable events so any state can be reconstructed or compensated',
    },
  },
  {
    id: 'inconsistency',
    label: 'Data is inconsistent across services',
    category: 'Data',
    patternIds: ['event-sourcing', 'cqrs', 'pub-sub', 'event-driven'],
    whyMap: {
      'event-sourcing': 'Single immutable event log is the source of truth for all services',
      'cqrs':           'Separate write and read models eliminates sync conflicts',
      'pub-sub':        'Propagate changes via events so every subscriber eventually converges',
      'event-driven':   'Async events decouple services and let each update independently',
    },
  },
  {
    id: 'need-audit',
    label: 'Need full audit trail / event replay',
    category: 'Data',
    patternIds: ['event-sourcing', 'cqrs'],
    whyMap: {
      'event-sourcing': 'Every state change is an appended event — replay gives you any past state',
      'cqrs':           'Read model is a projection of events, replayable from the event log',
    },
  },
  {
    id: 'slow-reports',
    label: 'Aggregation / reporting queries are too slow',
    category: 'Data',
    patternIds: ['materialized-views', 'cqrs', 'read-replicas'],
    whyMap: {
      'materialized-views': 'Pre-compute aggregations once; reports query the stored result instantly',
      'cqrs':               'Dedicated read model optimised for reporting, separate from write model',
      'read-replicas':      'Route heavy reporting queries to dedicated read replicas',
    },
  },

  // Architecture
  {
    id: 'services-cant-find',
    label: 'Services can\'t locate each other dynamically',
    category: 'Architecture',
    patternIds: ['service-discovery', 'api-gateway', 'service-mesh'],
    whyMap: {
      'service-discovery': 'Registry tracks live instance IPs; callers query it instead of hardcoding',
      'api-gateway':       'Single static entry point — clients never need internal service locations',
      'service-mesh':      'Sidecar proxy handles discovery and load-balancing transparently',
    },
  },
  {
    id: 'too-many-endpoints',
    label: 'Clients must call too many services',
    category: 'Architecture',
    patternIds: ['api-gateway', 'service-mesh'],
    whyMap: {
      'api-gateway':  'Aggregate / fan-out multiple service calls behind one client-facing endpoint (BFF)',
      'service-mesh': 'Internal request routing is managed by the mesh, invisible to the client',
    },
  },
  {
    id: 'duplicate-cross-cutting',
    label: 'Every service re-implements logging, auth, TLS',
    category: 'Architecture',
    patternIds: ['sidecar', 'service-mesh', 'api-gateway'],
    whyMap: {
      'sidecar':      'Deploy cross-cutting concerns as a sidecar container — zero service code changes',
      'service-mesh': 'Enforce mTLS, tracing, and retries at mesh level for all services uniformly',
      'api-gateway':  'Centralise auth, SSL termination, and logging at the edge',
    },
  },
  {
    id: 'tight-coupling',
    label: 'Adding features requires changing multiple services',
    category: 'Architecture',
    patternIds: ['pub-sub', 'event-driven', 'message-queue', 'strangler-fig'],
    whyMap: {
      'pub-sub':        'Services react to events independently — no service knows about others',
      'event-driven':   'Emit events on state change; consumers handle them without coupling to producers',
      'message-queue':  'Decouple producers from consumers via a durable async buffer',
      'strangler-fig':  'Incrementally replace coupled monolith modules without a big-bang rewrite',
    },
  },
  {
    id: 'real-time-events',
    label: 'Need to process high-volume real-time events',
    category: 'Architecture',
    patternIds: ['stream-processing', 'pub-sub', 'message-queue', 'event-driven'],
    whyMap: {
      'stream-processing': 'Process unbounded event streams continuously with windowed aggregations',
      'pub-sub':           'Fan-out events to N consumer groups in parallel without polling',
      'message-queue':     'Buffer event bursts so consumers aren\'t overwhelmed',
      'event-driven':      'Model your system around immutable events flowing between services',
    },
  },
];

// ── Keyword-to-pattern mapping for describe mode ─────────────────────────────
const KEYWORD_PATTERN_MAP: Array<{ keywords: string[]; patternId: string; reason: string }> = [
  { keywords: ['slow', 'read', 'latency', 'query', 'cache', 'fast'],     patternId: 'cache-aside',        reason: 'Cache frequently read data to eliminate DB round-trips' },
  { keywords: ['replica', 'read', 'db', 'database', 'query'],            patternId: 'read-replicas',      reason: 'Offload reads to dedicated replica instances' },
  { keywords: ['global', 'cdn', 'edge', 'static', 'asset', 'image'],     patternId: 'cdn',                reason: 'Serve content from geographically distributed edge nodes' },
  { keywords: ['write', 'throughput', 'async', 'batch', 'flush'],        patternId: 'write-behind',       reason: 'Batch-flush writes asynchronously to improve write throughput' },
  { keywords: ['scale', 'traffic', 'spike', 'peak', 'instance'],         patternId: 'horizontal-scaling', reason: 'Add stateless instances to absorb traffic growth' },
  { keywords: ['load', 'balance', 'distribute', 'server', 'pool'],       patternId: 'load-balancing',     reason: 'Distribute requests across a pool of servers' },
  { keywords: ['shard', 'partition', 'large', 'big', 'dataset', 'size'], patternId: 'database-sharding',  reason: 'Split data across multiple DB instances for write capacity' },
  { keywords: ['fail', 'crash', 'cascade', 'circuit', 'trip', 'down'],   patternId: 'circuit-breaker',    reason: 'Trip the circuit open on failures to stop cascading' },
  { keywords: ['isolate', 'pool', 'thread', 'bulkhead', 'noisy'],        patternId: 'bulkhead',           reason: 'Separate resource pools so failures stay contained' },
  { keywords: ['retry', 'transient', 'timeout', 'flaky', 'backoff'],     patternId: 'retry-pattern',      reason: 'Automatically retry transient errors with exponential backoff' },
  { keywords: ['rate', 'limit', 'throttle', 'abuse', 'ddos', 'quota'],   patternId: 'rate-limiting',      reason: 'Enforce per-client request budgets to protect backends' },
  { keywords: ['failover', 'standby', 'ha', 'high availability', 'downtime'], patternId: 'failover',      reason: 'Auto-promote a standby when the primary goes down' },
  { keywords: ['leader', 'election', 'singleton', 'cron', 'coordinate'], patternId: 'leader-election',    reason: 'Elect a single leader to coordinate shared tasks' },
  { keywords: ['transaction', 'saga', 'rollback', 'compensate', 'multi'], patternId: 'saga',              reason: 'Chain local transactions with compensating rollback actions' },
  { keywords: ['event', 'sourcing', 'audit', 'history', 'replay'],       patternId: 'event-sourcing',     reason: 'Store all state changes as immutable events for full auditability' },
  { keywords: ['cqrs', 'command', 'separate', 'read model', 'write'],    patternId: 'cqrs',               reason: 'Separate read and write models for independent scaling' },
  { keywords: ['queue', 'async', 'background', 'job', 'decouple'],       patternId: 'message-queue',      reason: 'Decouple producers from consumers via a durable async queue' },
  { keywords: ['publish', 'subscribe', 'broadcast', 'notify', 'fan-out'], patternId: 'pub-sub',           reason: 'Fan-out one event to multiple independent consumers' },
  { keywords: ['stream', 'real-time', 'continuous', 'pipeline', 'fraud'], patternId: 'stream-processing', reason: 'Process continuous event streams in real time' },
  { keywords: ['gateway', 'single entry', 'aggregat', 'bff', 'api'],     patternId: 'api-gateway',        reason: 'Provide a single client-facing entry point for many services' },
  { keywords: ['discover', 'find service', 'ip', 'dynamic', 'registry'], patternId: 'service-discovery',  reason: 'Dynamically locate service instances without hardcoded IPs' },
  { keywords: ['mesh', 'mtls', 'envoy', 'istio', 'sidecar', 'proxy'],    patternId: 'service-mesh',       reason: 'Manage all service-to-service networking at the infrastructure layer' },
  { keywords: ['report', 'aggregat', 'dashboard', 'slow', 'precompute'], patternId: 'materialized-views', reason: 'Pre-compute expensive aggregations so reports run instantly' },
  { keywords: ['consistent hash', 'node add', 'cache node', 'remap'],    patternId: 'consistent-hashing', reason: 'Minimise data movement when cluster nodes are added/removed' },
];

// ── Scoring engine ────────────────────────────────────────────────────────────
function scoreBySymptoms(selectedIds: Set<string>): PatternRec[] {
  const scoreMap = new Map<string, { score: number; reasons: string[] }>();

  SYMPTOMS.filter(s => selectedIds.has(s.id)).forEach(symptom => {
    symptom.patternIds.forEach((pid, idx) => {
      const weight = symptom.patternIds.length - idx; // higher rank = higher weight
      const existing = scoreMap.get(pid) ?? { score: 0, reasons: [] };
      existing.score += weight;
      if (symptom.whyMap[pid] && !existing.reasons.includes(symptom.whyMap[pid])) {
        existing.reasons.push(symptom.whyMap[pid]);
      }
      scoreMap.set(pid, existing);
    });
  });

  return [...scoreMap.entries()]
    .map(([pid, { score, reasons }]) => {
      const pattern = designPatterns.find(p => p.id === pid);
      return pattern ? { pattern, score, reasons: reasons.slice(0, 2) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score)
    .slice(0, 6) as PatternRec[];
}

function scoreByText(text: string): PatternRec[] {
  const lower = text.toLowerCase();
  const scoreMap = new Map<string, { score: number; reasons: string[] }>();

  KEYWORD_PATTERN_MAP.forEach(({ keywords, patternId, reason }) => {
    const matches = keywords.filter(kw => lower.includes(kw)).length;
    if (matches === 0) return;
    const existing = scoreMap.get(patternId) ?? { score: 0, reasons: [] };
    existing.score += matches;
    if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
    scoreMap.set(patternId, existing);
  });

  return [...scoreMap.entries()]
    .map(([pid, { score, reasons }]) => {
      const pattern = designPatterns.find(p => p.id === pid);
      return pattern ? { pattern, score, reasons: reasons.slice(0, 2) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score)
    .slice(0, 6) as PatternRec[];
}

// ── Confidence label ─────────────────────────────────────────────────────────
function confidenceLabel(score: number, maxScore: number): { label: string; color: string } {
  const pct = score / (maxScore || 1);
  if (pct > 0.7) return { label: 'Strong match', color: '#2dd4bf' };
  if (pct > 0.4) return { label: 'Good match',   color: '#8b7cf6' };
  return                { label: 'Related',       color: '#f59e0b' };
}

// ── Component ────────────────────────────────────────────────────────────────
interface DesignDoctorProps {
  onViewPattern: (patternId: string) => void;
}

const CATEGORIES: SymptomCategory[] = ['Performance', 'Scalability', 'Reliability', 'Data', 'Architecture'];

export const DesignDoctor: React.FC<DesignDoctorProps> = ({ onViewPattern }) => {
  const [mode, setMode]               = useState<'symptoms' | 'describe'>('symptoms');
  const [activeCategory, setActiveCat]= useState<SymptomCategory>('Performance');
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [describeText, setDescribeText] = useState('');
  const [diagnosed, setDiagnosed]     = useState(false);
  const [recs, setRecs]               = useState<PatternRec[]>([]);

  const catSymptoms = SYMPTOMS.filter(s => s.category === activeCategory);
  const totalSelected = selected.size;

  const diagnose = () => {
    if (mode === 'symptoms') {
      if (selected.size === 0) return;
      setRecs(scoreBySymptoms(selected));
    } else {
      if (describeText.trim().length < 10) return;
      setRecs(scoreByText(describeText));
    }
    setDiagnosed(true);
  };

  const reset = () => {
    setSelected(new Set());
    setDescribeText('');
    setDiagnosed(false);
    setRecs([]);
    setActiveCat('Performance');
  };

  const maxScore = recs[0]?.score ?? 1;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
          background: 'rgba(139,124,246,0.12)', border: '1px solid rgba(139,124,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Stethoscope size={28} style={{ color: '#8b7cf6' }} />
        </div>
        <div>
          <h1 className="glow-text section-h1" style={{ marginBottom: '4px' }}>Design Doctor</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '560px', margin: 0 }}>
            Describe your system design problem — by symptoms or in plain language — and get targeted pattern recommendations with explanations.
          </p>
        </div>
      </div>

      {!diagnosed ? (
        <>
          {/* ── Mode toggle ── */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-glass)', width: 'fit-content' }}>
            {([
              { id: 'symptoms', label: 'Pick Symptoms', icon: <Activity size={14} /> },
              { id: 'describe',  label: 'Describe Problem', icon: <Search size={14} /> },
            ] as const).map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '8px 16px', borderRadius: '7px', border: 'none',
                  background: mode === id ? '#8b7cf6' : 'transparent',
                  color: mode === id ? '#fff' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {mode === 'symptoms' ? (
            <>
              {/* Category tabs */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => {
                  const col = CAT_STYLE[cat];
                  const count = SYMPTOMS.filter(s => s.category === cat && selected.has(s.id)).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCat(cat)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        padding: '7px 14px', borderRadius: '9px', border: '1px solid',
                        borderColor: activeCategory === cat ? col.border : 'var(--border-glass)',
                        background: activeCategory === cat ? col.bg : 'transparent',
                        color: activeCategory === cat ? col.text : 'var(--text-secondary)',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {cat}
                      {count > 0 && (
                        <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: col.dot, color: '#fff', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Symptom pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {catSymptoms.map(symptom => {
                  const isSelected = selected.has(symptom.id);
                  const col = CAT_STYLE[symptom.category];
                  return (
                    <button
                      key={symptom.id}
                      onClick={() => {
                        setSelected(prev => {
                          const next = new Set(prev);
                          if (next.has(symptom.id)) next.delete(symptom.id);
                          else next.add(symptom.id);
                          return next;
                        });
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 18px', borderRadius: '12px', border: '1px solid',
                        borderColor: isSelected ? col.border : 'var(--border-glass)',
                        background: isSelected ? col.bg : 'var(--surface-obsidian)',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                        boxShadow: isSelected ? `0 0 0 1px ${col.border}` : 'none',
                      }}
                    >
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${isSelected ? col.text : 'var(--border-glass)'}`,
                        background: isSelected ? col.text : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}>
                        {isSelected && <CheckCircle2 size={12} style={{ color: '#fff' }} />}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {symptom.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected summary */}
              {totalSelected > 0 && (
                <div style={{
                  padding: '12px 16px', borderRadius: '10px',
                  background: 'rgba(139,124,246,0.06)', border: '1px solid rgba(139,124,246,0.2)',
                  marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '13px', color: '#8b7cf6',
                }}>
                  <AlertTriangle size={14} />
                  <span>
                    <strong>{totalSelected}</strong> symptom{totalSelected !== 1 ? 's' : ''} selected across all categories
                    — check other categories to add more before diagnosing.
                  </span>
                </div>
              )}
            </>
          ) : (
            /* ── Describe mode ── */
            <div style={{ marginBottom: '28px' }}>
              <div style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Describe what's going wrong in your system in plain language — the more detail the better.
              </div>
              <textarea
                value={describeText}
                onChange={e => setDescribeText(e.target.value)}
                placeholder={`Examples:\n• "My API is slow during peak hours and the database keeps timing out under load"\n• "When one microservice fails, everything else crashes too"\n• "I need to track every change ever made to an order for compliance"`}
                style={{
                  width: '100%', minHeight: '160px', padding: '16px',
                  borderRadius: '12px', border: '1px solid var(--border-glass)',
                  background: 'var(--surface-obsidian)', color: 'var(--text-primary)',
                  fontSize: '14px', lineHeight: 1.7, fontFamily: 'inherit',
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(139,124,246,0.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-glass)'}
              />
              {describeText.length > 0 && describeText.length < 10 && (
                <p style={{ fontSize: '12px', color: '#f87171', marginTop: '6px' }}>
                  Write a bit more for better recommendations
                </p>
              )}
            </div>
          )}

          {/* ── Diagnose button ── */}
          <button
            onClick={diagnose}
            disabled={mode === 'symptoms' ? totalSelected === 0 : describeText.trim().length < 10}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '14px 28px', borderRadius: '12px', border: 'none',
              background: (mode === 'symptoms' ? totalSelected > 0 : describeText.trim().length >= 10)
                ? 'linear-gradient(135deg, #6d5df6 0%, #a78bfa 100%)'
                : 'rgba(255,255,255,0.04)',
              color: (mode === 'symptoms' ? totalSelected > 0 : describeText.trim().length >= 10)
                ? '#fff' : 'var(--text-muted)',
              fontSize: '15px', fontWeight: 700, cursor: (mode === 'symptoms' ? totalSelected > 0 : describeText.trim().length >= 10) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', letterSpacing: '-0.2px',
            }}
          >
            <Stethoscope size={18} />
            Diagnose My System
            <ArrowRight size={16} />
          </button>
        </>
      ) : (
        /* ── Results ── */
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          {/* Results header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <Lightbulb size={18} style={{ color: '#8b7cf6' }} />
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
                  {recs.length > 0 ? `${recs.length} recommended patterns` : 'No strong matches found'}
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Ranked by relevance to your selected symptoms
              </p>
            </div>
            <button
              onClick={reset}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '8px 16px', borderRadius: '9px',
                border: '1px solid var(--border-glass)', background: 'transparent',
                color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} />
              Start over
            </button>
          </div>

          {recs.length === 0 && (
            <div style={{
              padding: '40px', textAlign: 'center', borderRadius: '14px',
              border: '1px solid var(--border-glass)', background: 'var(--surface-obsidian)',
              color: 'var(--text-muted)',
            }}>
              <Search size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p>No patterns matched. Try describing your problem differently or pick symptoms from the other mode.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recs.map((rec, idx) => {
              const conf = confidenceLabel(rec.score, maxScore);
              const catColor = PATTERN_CAT_COLOR[rec.pattern.category] ?? PATTERN_CAT_COLOR['Architectural'];
              return (
                <div
                  key={rec.pattern.id}
                  style={{
                    padding: '22px 24px', borderRadius: '14px',
                    border: `1px solid ${catColor.border}`,
                    background: idx === 0 ? catColor.bg : 'var(--surface-obsidian)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Rank badge */}
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: idx === 0 ? catColor.text : 'var(--border-glass)',
                      border: `1px solid ${catColor.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 900,
                      color: idx === 0 ? '#fff' : 'var(--text-muted)',
                    }}>
                      {idx + 1}
                    </div>

                    {/* Emoji + info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '24px' }}>{rec.pattern.emoji}</span>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{rec.pattern.name}</span>

                        {/* Category chip */}
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                          background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}`,
                        }}>
                          {rec.pattern.category}
                        </span>

                        {/* Confidence */}
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                          background: `${conf.color}18`, color: conf.color, border: `1px solid ${conf.color}30`,
                        }}>
                          {conf.label}
                        </span>
                      </div>

                      {/* Intent */}
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                        {rec.pattern.intent}
                      </p>

                      {/* Why it fits */}
                      {rec.reasons.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                          {rec.reasons.map((reason, ri) => (
                            <div key={ri} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                              <span style={{ color: catColor.text, fontWeight: 800, flexShrink: 0 }}>→</span>
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Cheatsheet row */}
                      {(rec.pattern.pickItWhen || rec.pattern.mainTradeoff) && (
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                          {rec.pattern.pickItWhen && (
                            <span style={{ fontSize: '11px', color: '#2dd4bf', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', padding: '3px 10px', borderRadius: '6px' }}>
                              ✓ Use when: {rec.pattern.pickItWhen}
                            </span>
                          )}
                          {rec.pattern.mainTradeoff && (
                            <span style={{ fontSize: '11px', color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', padding: '3px 10px', borderRadius: '6px' }}>
                              ⚠ Trade-off: {rec.pattern.mainTradeoff}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Study button */}
                      <button
                        onClick={() => onViewPattern(rec.pattern.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '7px',
                          padding: '8px 16px', borderRadius: '8px',
                          border: `1px solid ${catColor.border}`,
                          background: catColor.bg, color: catColor.text,
                          fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.15s', textDecoration: 'none',
                        }}
                      >
                        Study this pattern
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer tip */}
          {recs.length > 0 && (
            <div style={{
              marginTop: '24px', padding: '14px 18px', borderRadius: '10px',
              background: 'rgba(139,124,246,0.05)', border: '1px solid rgba(139,124,246,0.15)',
              fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '10px', alignItems: 'flex-start',
            }}>
              <Lightbulb size={14} style={{ color: '#8b7cf6', flexShrink: 0, marginTop: '1px' }} />
              <span>These patterns often work together. In a real system design interview, mentioning 2-3 complementary patterns shows depth.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
