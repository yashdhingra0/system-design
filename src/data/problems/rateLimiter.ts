export const rateLimiterDetail = {
  problemStatement: `Design a Distributed Rate Limiter that can limit the rate of incoming requests to an API (e.g., max 100 requests per minute per IP address). The rate limiter should operate at scale across multiple service instances, have sub-millisecond overhead, and protect downstream microservices from DDoS attacks, scraping, and brute force attempts.`,
  useCases: [
    "Limit client requests based on client IP, User ID, or API Key.",
    "Support configurable rules (e.g., 10 requests/sec for free tier, 500 requests/sec for premium).",
    "Distributed operation: rate limit counts must sync correctly across a cluster of servers.",
    "Return clear HTTP headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset) and HTTP 429 Too Many Requests when rate limits are exceeded.",
    "High performance: the checking logic must execute with minimal latency (< 2-3ms)."
  ],
  highLevelDesign: `### High Level System Architecture

Rate limiting is typically integrated into the entry point of the infrastructure:
1. **API Gateway / Reverse Proxy**:
   - Acts as the central ingress point. The client request hits the **API Gateway**.
   - Before routing the request to backend services, the gateway invokes the **Rate Limiter Middleware**.
2. **Rate Limiter Middleware**:
   - Looks up the rate limit key (e.g., \`rate_limit_user_<id>\` or \`rate_limit_ip_<ip>\`).
   - Checks the count in a fast, in-memory store (**Redis**).
   - If Redis indicates the request is within limits, the middleware forwards the request to backend services and decrements/updates the bucket.
   - If limits are exceeded, it immediately rejects the request, returning HTTP 429.
3. **Redis Cluster (Data Layer)**:
   - Maintains the token counts and timestamps.
   - Configured with Replication and Sentinel/Clustering for high availability.
   - Redis pipeline or Lua scripts are used to ensure atomic read-and-write operations, avoiding race conditions.`,
  tradeoffs: [
    {
      component: "Rate Limiting Algorithm",
      optionA: "Token Bucket / Leaky Bucket",
      optionB: "Sliding Window Log / Sliding Window Counter",
      selected: "Token Bucket",
      reason: "Token Bucket is memory efficient (only stores token count and last updated timestamp) and handles bursts of traffic gracefully up to the capacity of the bucket. Sliding Window Log is extremely accurate but consumes high memory since it records timestamps of *every* request in a sorted set (ZSET) in Redis."
    },
    {
      component: "Architecture Location",
      optionA: "Local Client-side / Individual App Server Instance Memory",
      optionB: "Centralized Distributed Cache (Redis Cluster)",
      selected: "Centralized Distributed Cache (Redis Cluster)",
      reason: "Local server memory cannot share rate limit state across multiple app servers behind a load balancer, causing inconsistent limits if requests are distributed round-robin. Redis offers shared, sub-millisecond key-value operations and atomicity (via Lua scripting) ensuring accurate global limits."
    },
    {
      component: "Race Condition Resolution",
      optionA: "Locking (Distributed Locks via Redlock)",
      optionB: "Redis Lua Scripts (Atomic Execution)",
      selected: "Redis Lua Scripts (Atomic Execution)",
      reason: "Acquiring and releasing distributed locks introduces significant network overhead and increases request latency. Redis is single-threaded and executes Lua scripts atomically, preventing race conditions (read-modify-write) in a single roundtrip without locking overhead."
    }
  ],
  lowLevelDesign: {
    entities: [
      {
        name: "RateLimitRule (Config Table / Schema)",
        fields: [
          "rule_id: VARCHAR(64) (Primary Key)",
          "client_tier: VARCHAR(32) (e.g., FREE, PREMIUM)",
          "max_requests: INT",
          "window_size_seconds: INT"
        ]
      },
      {
        name: "Redis Token Bucket Key Schema",
        fields: [
          "Key: rate_limit:{clientId} (Hash Map)",
          "Field 1: tokens (FLOAT) - current remaining tokens",
          "Field 2: last_updated (INT) - epoch timestamp in milliseconds"
        ]
      }
    ],
    apis: [
      {
        method: "Middleware Interceptor",
        path: "Before routing requests",
        request: "Header: Authorization or X-Forwarded-For (Client IP)",
        response: "If allowed: Forward to service. If blocked: HTTP 429 with Headers",
        description: "Calculates rate limits on every incoming request using Token Bucket logic."
      }
    ]
  },
  code: {
    typescript: `// TypeScript Token Bucket Rate Limiter
export class TokenBucketRateLimiter {
  private capacity: number;
  private refillRate: number; // tokens per millisecond
  private tokens: number;
  private lastRefillTimestamp: number;

  constructor(capacity: number, refillRatePerSec: number) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSec / 1000.0;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedTime = now - this.lastRefillTimestamp;
    const tokensToAdd = elapsedTime * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = now;
  }

  public allowRequest(requestedTokens: number = 1): boolean {
    this.refill();
    if (this.tokens >= requestedTokens) {
      this.tokens -= requestedTokens;
      return true;
    }
    return false;
  }

  public getRemainingTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

// Example Express Middleware Usage Simulation
const limiters = new Map<string, TokenBucketRateLimiter>();

export function rateLimiterMiddleware(reqIp: string): { allowed: boolean; remaining: number } {
  // Free tier: max 5 requests per minute (refill rate: 5/60 = 0.083 per sec)
  if (!limiters.has(reqIp)) {
    limiters.set(reqIp, new TokenBucketRateLimiter(5, 5 / 60));
  }

  const limiter = limiters.get(reqIp)!;
  const allowed = limiter.allowRequest(1);
  return {
    allowed,
    remaining: limiter.getRemainingTokens()
  };
}`,
    python: `# Python Token Bucket Rate Limiter
import time
import threading

class TokenBucketRateLimiter:
    def __init__(self, capacity: int, refill_rate_per_sec: float):
        self.capacity = capacity
        self.refill_rate = refill_rate_per_sec / 1.0  # tokens per second
        self.tokens = float(capacity)
        self.last_refill = time.time()
        self.lock = threading.Lock()

    def _refill(self):
        now = time.time()
        elapsed = now - self.last_refill
        tokens_to_add = elapsed * self.refill_rate
        self.tokens = min(float(self.capacity), self.tokens + tokens_to_add)
        self.last_refill = now

    def allow_request(self, tokens_requested: int = 1) -> bool:
        with self.lock:
            self._refill()
            if self.tokens >= tokens_requested:
                self.tokens -= tokens_requested
                return True
            return False

    def remaining_tokens(self) -> int:
        with self.lock:
            self._refill()
            return int(self.tokens)

# Simulation
# limiter = TokenBucketRateLimiter(capacity=100, refill_rate_per_sec=10.0)`,
    java: `// Java Thread-Safe Token Bucket Rate Limiter
import java.util.concurrent.ConcurrentHashMap;

public class TokenBucketRateLimiter {
    private final double capacity;
    private final double refillRatePerMs; // Tokens per millisecond
    private double tokens;
    private long lastRefillTimestamp;

    public TokenBucketRateLimiter(int capacity, int refillRatePerSec) {
        this.capacity = capacity;
        this.refillRatePerMs = (double) refillRatePerSec / 1000.0;
        this.tokens = capacity;
        this.lastRefillTimestamp = System.currentTimeMillis();
    }

    private synchronized void refill() {
        long now = System.currentTimeMillis();
        long elapsedTime = now - lastRefillTimestamp;
        double tokensToAdd = elapsedTime * refillRatePerMs;
        
        this.tokens = Math.min(capacity, this.tokens + tokensToAdd);
        this.lastRefillTimestamp = now;
    }

    public synchronized boolean allowRequest(int requestedTokens) {
        refill();
        if (this.tokens >= requestedTokens) {
            this.tokens -= requestedTokens;
            return true;
        }
        return false;
    }

    public synchronized int getRemainingTokens() {
        refill();
        return (int) this.tokens;
    }
}`,
    go: `// Go Thread-Safe Token Bucket Rate Limiter
package main

import (
	"math"
	"sync"
	"time"
)

type TokenBucket struct {
	mu            sync.Mutex
	capacity      float64
	refillRate    float64 // tokens per millisecond
	tokens        float64
	lastUpdated   time.Time
}

func NewTokenBucket(capacity int, refillRatePerSec int) *TokenBucket {
	return &TokenBucket{
		capacity:    float64(capacity),
		refillRate:  float64(refillRatePerSec) / 1000.0,
		tokens:      float64(capacity),
		lastUpdated: time.Now(),
	}
}

func (tb *TokenBucket) refill() {
	now := time.Now()
	elapsed := now.Sub(tb.lastUpdated).Milliseconds()
	tokensToAdd := float64(elapsed) * tb.refillRate
	
	tb.tokens = math.Min(tb.capacity, tb.tokens+tokensToAdd)
	tb.lastUpdated = now
}

func (tb *TokenBucket) AllowRequest(requestedTokens float64) bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	tb.refill()
	if tb.tokens >= requestedTokens {
		tb.tokens -= requestedTokens
		return true
	}
	return false
}

func (tb *TokenBucket) RemainingTokens() int {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	tb.refill()
	return int(tb.tokens)
}`,
    cpp: `// C++ Thread-Safe Token Bucket Rate Limiter
#include <iostream>
#include <chrono>
#include <mutex>
#include <algorithm>

class TokenBucket {
private:
    double capacity;
    double refillRatePerMs; // Tokens per millisecond
    double tokens;
    std::chrono::steady_clock::time_point lastRefillTimestamp;
    std::mutex mtx;

    void refill() {
        auto now = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(now - lastRefillTimestamp).count();
        double tokensToAdd = elapsed * refillRatePerMs;
        
        tokens = std::min(capacity, tokens + tokensToAdd);
        lastRefillTimestamp = now;
    }

public:
    TokenBucket(int capacityVal, int refillRatePerSec) {
        capacity = static_cast<double>(capacityVal);
        refillRatePerMs = static_cast<double>(refillRatePerSec) / 1000.0;
        tokens = capacity;
        lastRefillTimestamp = std::chrono::steady_clock::now();
    }

    bool allowRequest(int requestedTokens = 1) {
        std::lock_guard<std::mutex> lock(mtx);
        refill();
        if (tokens >= requestedTokens) {
            tokens -= requestedTokens;
            return true;
        }
        return false;
    }

    int getRemainingTokens() {
        std::lock_guard<std::mutex> lock(mtx);
        refill();
        return static_cast<int>(tokens);
    }
};`
  }
};
