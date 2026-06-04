import { urlShortenerDetail } from './urlShortener';
import { rateLimiterDetail } from './rateLimiter';
import { chatServiceDetail } from './chatService';
import { rideSharingDetail } from './rideSharing';
import { videoStreamingDetail } from './videoStreaming';
import { messageQueueDetail } from './messageQueue';
import { ticketBookingDetail } from './ticketBooking';
import { webCrawlerDetail } from './webCrawler';

export interface ProblemDetail {
  problemStatement: string;
  useCases: string[];
  highLevelDesign: string;
  tradeoffs: {
    component: string;
    optionA: string;
    optionB: string;
    selected: string;
    reason: string;
  }[];
  lowLevelDesign: {
    entities: { name: string; fields: string[] }[];
    apis: { method: string; path: string; request: string; response: string; description: string }[];
  };
  code: {
    typescript: string;
    python: string;
    java: string;
    go: string;
    cpp: string;
  };
}

export interface Problem {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companyTags: string[];
  summary: string;
  isDetailed: boolean;
  details?: ProblemDetail;
}

// Ingest the 8 deep detailed problems
const detailedProblemsMap: Record<string, ProblemDetail> = {
  "url-shortener": urlShortenerDetail,
  "rate-limiter": rateLimiterDetail,
  "chat-service": chatServiceDetail,
  "ride-sharing": rideSharingDetail,
  "video-streaming": videoStreamingDetail,
  "message-queue": messageQueueDetail,
  "ticket-booking": ticketBookingDetail,
  "web-crawler": webCrawlerDetail
};

const rawProblemsMetadata: Omit<Problem, 'isDetailed' | 'details'>[] = [
  {
    id: "url-shortener",
    title: "URL Shortener (TinyURL)",
    category: "System Architecture",
    difficulty: "Easy",
    companyTags: ["Google", "Amazon", "Microsoft"],
    summary: "Design a high-availability URL shortener that converts long URLs to short aliases with low latency redirections."
  },
  {
    id: "rate-limiter",
    title: "Distributed Rate Limiter",
    category: "API Design",
    difficulty: "Medium",
    companyTags: ["Stripe", "Google", "Amazon"],
    summary: "Design an API gatekeeper to throttle incoming requests per IP/user, protecting backend services from traffic spikes."
  },
  {
    id: "chat-service",
    title: "Real-time Messaging App (WhatsApp)",
    category: "Real-time Systems",
    difficulty: "Hard",
    companyTags: ["Meta", "Google", "Microsoft"],
    summary: "Design a chat application supporting low-latency one-on-one and group messages, delivery receipts, and presence indicators."
  },
  {
    id: "ride-sharing",
    title: "Ride-Sharing Platform (Uber)",
    category: "Real-time Systems",
    difficulty: "Hard",
    companyTags: ["Uber", "Google", "Lyft"],
    summary: "Design a service to match riders with drivers in real-time, ingestion driver coordinates, and perform dynamic surge pricing."
  },
  {
    id: "video-streaming",
    title: "Video Streaming Platform (Netflix)",
    category: "Distributed Systems",
    difficulty: "Hard",
    companyTags: ["Netflix", "Google", "Amazon"],
    summary: "Design a video ingestion, transcoding, and content delivery system that streams high-quality video with adaptive bitrate."
  },
  {
    id: "message-queue",
    title: "Distributed Message Queue (Kafka)",
    category: "Distributed Systems",
    difficulty: "Hard",
    companyTags: ["LinkedIn", "Microsoft", "Amazon"],
    summary: "Design a highly-scalable pub/sub append-only commit log system supporting parallel consumer group reads."
  },
  {
    id: "ticket-booking",
    title: "Ticket Booking System (Ticketmaster)",
    category: "System Architecture",
    difficulty: "Medium",
    companyTags: ["Amazon", "Microsoft", "Uber"],
    summary: "Design a transactional ticket reservation engine that prevents double-bookings under extreme concurrent load."
  },
  {
    id: "web-crawler",
    title: "Distributed Web Crawler",
    category: "System Architecture",
    difficulty: "Hard",
    companyTags: ["Google", "Microsoft", "Baidu"],
    summary: "Design a scalable crawler bot to discover, fetch, deduplicate, and store billions of webpages politly."
  },
  // The remaining 42 problems
  {
    id: "key-value-store",
    title: "Distributed Key-Value Store (Redis/Dynamo)",
    category: "Distributed Systems",
    difficulty: "Hard",
    companyTags: ["Amazon", "Google", "Meta"],
    summary: "Design a partitioned, highly available key-value storage engine using consistent hashing and replication."
  },
  {
    id: "notification-service",
    title: "Notification System",
    category: "API Design",
    difficulty: "Medium",
    companyTags: ["Apple", "Google", "Meta"],
    summary: "Design a scalable engine to push SMS, email, and mobile push notifications with templates and rate limiting."
  },
  {
    id: "api-gateway",
    title: "API Gateway",
    category: "API Design",
    difficulty: "Medium",
    companyTags: ["Netflix", "Amazon", "Stripe"],
    summary: "Design a single entry point gateway for clients to handle load balancing, authentication, SSL termination, and routing."
  },
  {
    id: "cdn",
    title: "Content Delivery Network (CDN)",
    category: "Distributed Systems",
    difficulty: "Hard",
    companyTags: ["Cloudflare", "Netflix", "Akamai"],
    summary: "Design a global network of edge cache proxies that serve static files with maximum proximity and speed."
  },
  {
    id: "pastebin",
    title: "Pastebin (Text Sharing)",
    category: "System Architecture",
    difficulty: "Easy",
    companyTags: ["Amazon", "Microsoft", "Google"],
    summary: "Design a system where users can upload text snippets and access them via a sharing link."
  },
  {
    id: "yelp-nearby",
    title: "Proximity Server / Yelp (Nearby Places)",
    category: "Real-time Systems",
    difficulty: "Medium",
    companyTags: ["Yelp", "Google", "Meta"],
    summary: "Design a spatial search engine to locate nearby points of interest (restaurants, hotels) using quadtrees."
  },
  {
    id: "food-delivery",
    title: "Food Delivery System (UberEats)",
    category: "System Architecture",
    difficulty: "Medium",
    companyTags: ["Uber", "DoorDash", "Instacart"],
    summary: "Design a multi-actor platform coordinating consumers, restaurants, and delivery drivers with live tracking."
  },
  {
    id: "dropbox",
    title: "Cloud File Storage (Dropbox/Google Drive)",
    category: "System Architecture",
    difficulty: "Hard",
    companyTags: ["Dropbox", "Google", "Microsoft"],
    summary: "Design a file storage service featuring block-level synchronization, chunk upload, deduplication, and metadata databases."
  },
  {
    id: "metrics-monitoring",
    title: "Metrics Monitoring & Alerting (Prometheus)",
    category: "Distributed Systems",
    difficulty: "Hard",
    companyTags: ["Uber", "Netflix", "Datadog"],
    summary: "Design a timeseries metrics aggregation pipeline that collects telemetry, aggregates alerts, and plots graphs."
  },
  {
    id: "distributed-db",
    title: "Distributed Database (Spanner/Cassandra)",
    category: "Distributed Systems",
    difficulty: "Hard",
    companyTags: ["Google", "Meta", "Netflix"],
    summary: "Design a database supporting atomic transactions across servers globally using TrueTime GPS synchronization."
  },
  {
    id: "ad-click-aggregator",
    title: "Ad Click Aggregator",
    category: "System Architecture",
    difficulty: "Hard",
    companyTags: ["Google", "Meta", "Amazon"],
    summary: "Design a low-latency data processing pipeline to count millions of ad click events and generate real-time metrics."
  },
  {
    id: "webmail-server",
    title: "Web Mail Server (Gmail)",
    category: "System Architecture",
    difficulty: "Medium",
    companyTags: ["Google", "Microsoft", "Yahoo"],
    summary: "Design an email client handling SMTP/IMAP protocol parsing, massive mailbox scaling, and spam/search indexing."
  },
  {
    id: "photo-sharing",
    title: "Photo Sharing App (Instagram)",
    category: "Real-time Systems",
    difficulty: "Medium",
    companyTags: ["Meta", "Pinterest", "Snapchat"],
    summary: "Design an image upload and news feed generation system optimized for high read/write asymmetry."
  },
  {
    id: "collaborative-editor",
    title: "Collaborative Document Editor (Google Docs)",
    category: "Real-time Systems",
    difficulty: "Hard",
    companyTags: ["Google", "Figma", "Microsoft"],
    summary: "Design a multi-user editor resolving text conflicts in real-time using Operational Transformation (OT) or CRDTs."
  },
  {
    id: "log-aggregation",
    title: "Log Aggregation System (ELK Stack)",
    category: "Distributed Systems",
    difficulty: "Medium",
    companyTags: ["Elastic", "Amazon", "Netflix"],
    summary: "Design a pipeline to collect unstructured logs from servers, index them, and support full-text search."
  },
  {
    id: "dns-resolver",
    title: "Domain Name System (DNS) Resolver",
    category: "System Architecture",
    difficulty: "Medium",
    companyTags: ["Cloudflare", "Google", "Amazon"],
    summary: "Design a root-hierarchical distributed DNS caching server handling high throughput recursive name queries."
  },
  {
    id: "saga-transaction",
    title: "Distributed Transaction Coordinator (Saga)",
    category: "Distributed Systems",
    difficulty: "Hard",
    companyTags: ["Stripe", "Amazon", "PayPal"],
    summary: "Design a workflow engine enforcing consistency across multiple independent databases using rollback compensation."
  },
  {
    id: "online-judge",
    title: "Online Coding Judge (LeetCode)",
    category: "System Architecture",
    difficulty: "Medium",
    companyTags: ["Google", "Uber", "HackerRank"],
    summary: "Design a secure code compilation and sandbox execution pipeline running untrusted user submissions."
  },
  {
    id: "stock-brokerage",
    title: "Stock Brokerage Platform (Robinhood)",
    category: "Real-time Systems",
    difficulty: "Hard",
    companyTags: ["Robinhood", "Bloomberg", "GoldmanSachs"],
    summary: "Design an order-matching engine that matches buy/sell stock orders under sub-millisecond conditions."
  },
  {
    id: "multiplayer-game",
    title: "Multiplayer Game Server",
    category: "Real-time Systems",
    difficulty: "Hard",
    companyTags: ["RiotGames", "Valve", "EpicGames"],
    summary: "Design a UDP/WebSocket game server syncing player coordinates with high tick-rate physics simulation."
  },
  {
    id: "payment-gateway",
    title: "Payment Gateway Integration (Stripe)",
    category: "API Design",
    difficulty: "Medium",
    companyTags: ["Stripe", "PayPal", "Square"],
    summary: "Design a secure, idempotent API to process payments, handle webhooks, and coordinate merchant ledger records."
  },
  {
    id: "hotel-booking",
    title: "Hotel Booking System (Airbnb)",
    category: "System Architecture",
    difficulty: "Medium",
    companyTags: ["Airbnb", "Booking.com", "Expedia"],
    summary: "Design a platform to search hotel/room inventory and reserve stays, supporting calendar overlaps and dynamic pricing."
  },
  {
    id: "recommendation-engine",
    title: "Recommendation Engine",
    category: "Distributed Systems",
    difficulty: "Hard",
    companyTags: ["Amazon", "Netflix", "YouTube"],
    summary: "Design a machine learning feed pipeline collecting user signals and recommending personalized content."
  },
  {
    id: "distributed-lock",
    title: "Distributed Lock Manager (Redlock/Chubby)",
    category: "Distributed Systems",
    difficulty: "Hard",
    companyTags: ["Google", "ZooKeeper", "Redisson"],
    summary: "Design a coordination service that guarantees mutual exclusion across distributed servers using consensus."
  },
  {
    id: "e-commerce-cart",
    title: "E-Commerce Shopping Cart (Amazon)",
    category: "API Design",
    difficulty: "Easy",
    companyTags: ["Amazon", "Walmart", "Shopify"],
    summary: "Design a highly available shopping cart service that merges guest and user carts across multiple browser sessions."
  },
  {
    id: "flash-sale",
    title: "Flash Sale System",
    category: "System Architecture",
    difficulty: "Hard",
    companyTags: ["Alibaba", "Amazon", "Shopify"],
    summary: "Design an inventory manager protecting databases from crashing when millions of users buy 100 products at once."
  },
  {
    id: "social-graph",
    title: "Social Graph Service (LinkedIn/Facebook)",
    category: "System Architecture",
    difficulty: "Hard",
    companyTags: ["LinkedIn", "Meta", "Twitter"],
    summary: "Design a graph storage system to represent user connections (friends/followers) and fetch degrees of separation."
  },
  {
    id: "api-rate-limiter-token",
    title: "Leaky Bucket Rate Limiter",
    category: "API Design",
    difficulty: "Easy",
    companyTags: ["Stripe", "Cloudflare"],
    summary: "Design a single-instance rate limiter utilizing a leaky bucket model to smooth out bursty traffic."
  },
  {
    id: "fraud-detection",
    title: "Fraud Detection Pipeline",
    category: "Distributed Systems",
    difficulty: "Hard",
    companyTags: ["Stripe", "PayPal", "Adyen"],
    summary: "Design a real-time event analytics flow checking transaction features against rules and models to block fraud."
  },
  {
    id: "url-blacklist",
    title: "URL Blacklist Checker (Safe Browsing)",
    category: "API Design",
    difficulty: "Medium",
    companyTags: ["Google", "Microsoft", "Cloudflare"],
    summary: "Design a high-throughput, low-memory API verifying if a requested URL is listed as malicious."
  },
  {
    id: "parking-lot",
    title: "Parking Lot System",
    category: "Low-Level Design",
    difficulty: "Easy",
    companyTags: ["Amazon", "Microsoft", "Google"],
    summary: "Low-level design of a multi-floor parking lot with vehicle types, ticketing terminals, and slot allocation."
  },
  {
    id: "movie-reservation",
    title: "Movie Reservation Seat Lock",
    category: "Low-Level Design",
    difficulty: "Easy",
    companyTags: ["BookMyShow", "AMC"],
    summary: "Low-level design for booking specific cinema seats, focusing on thread safety in object representation."
  },
  {
    id: "distributed-cache",
    title: "Distributed Cache (Memcached)",
    category: "Distributed Systems",
    difficulty: "Hard",
    companyTags: ["Meta", "Twitter", "Amazon"],
    summary: "Design an in-memory key-value cache engine supporting sharding, LRU eviction, and cluster-wide lookups."
  },
  {
    id: "cloud-pub-sub",
    title: "Cloud Pub/Sub (Google Cloud Pub/Sub)",
    category: "Distributed Systems",
    difficulty: "Hard",
    companyTags: ["Google", "AWS", "Microsoft"],
    summary: "Design a managed message routing service supporting push and pull consumer subscriptions at global scale."
  },
  {
    id: "web-app-firewall",
    title: "Web Application Firewall (WAF)",
    category: "Network",
    difficulty: "Medium",
    companyTags: ["Cloudflare", "AWS", "Akamai"],
    summary: "Design an edge proxy inspecting HTTP payloads to block SQL injection and cross-site scripting."
  },
  {
    id: "log-forwarder",
    title: "Log Forwarder Agent (Logstash/Fluentd)",
    category: "System Architecture",
    difficulty: "Easy",
    companyTags: ["Elastic", "Datadog", "Splunk"],
    summary: "Design a lightweight background daemon that tails log files, buffers events, and forwards them to a central sink."
  },
  {
    id: "dns-cache",
    title: "Local DNS Cache",
    category: "Low-Level Design",
    difficulty: "Easy",
    companyTags: ["Cloudflare", "Google"],
    summary: "Low-level design of an in-memory cache for IP records, prioritizing fast lookups and background TTL refreshes."
  },
  {
    id: "dynamic-pricing",
    title: "Dynamic Pricing Engine",
    category: "Distributed Systems",
    difficulty: "Medium",
    companyTags: ["Uber", "Lyft", "Airbnb"],
    summary: "Design a service that aggregates demand/supply events and updates ride pricing metrics in real-time."
  },
  {
    id: "vending-machine",
    title: "Vending Machine System",
    category: "Low-Level Design",
    difficulty: "Easy",
    companyTags: ["Amazon", "Microsoft"],
    summary: "Low-level design of a vending machine controller utilizing the State Pattern to handle coin inserts and drops."
  },
  {
    id: "atm-machine",
    title: "ATM Machine Controller",
    category: "Low-Level Design",
    difficulty: "Medium",
    companyTags: ["Microsoft", "Oracle"],
    summary: "Low-level design of an ATM controller validating cards, maintaining cash vault limits, and coordinating ledger balances."
  },
  {
    id: "library-management",
    title: "Library Management System",
    category: "Low-Level Design",
    difficulty: "Easy",
    companyTags: ["Microsoft", "Google"],
    summary: "Low-level design of a cataloging system managing book loans, cardholder fees, and reservations."
  },
  {
    id: "elevator-system",
    title: "Elevator Dispatch System",
    category: "Low-Level Design",
    difficulty: "Medium",
    companyTags: ["Amazon", "Microsoft", "Google"],
    summary: "Low-level design of an elevator group controller utilizing scheduling algorithms (e.g. SCAN) to optimize passenger wait times."
  }
];

// Helper to generate template details for the remaining 42 problems
function generateTemplateDetail(prob: typeof rawProblemsMetadata[0]): ProblemDetail {
  const compUpper = prob.title.replace(/[()]/g, '');
  return {
    problemStatement: `Design a system for: ${prob.title}. Goal: ${prob.summary} Must support high availability, horizontal scaling, and secure API boundaries.`,
    useCases: [
      `Support core transactional flow for ${prob.title}.`,
      "Handle high-concurrency requests securely with authentication and authorization.",
      "Track system states, log errors, and collect performance metrics.",
      "Achieve low latency and guarantee horizontal data partitioning."
    ],
    highLevelDesign: `### High Level System Design for ${prob.title}

1. **Client Gateway**: Entry point for API routing, load balancing, and rate limiting.
2. **Core Services Engine**: Stateless application servers executing the business logic for ${compUpper}.
3. **Data Cache Layer**: Fast, in-memory cache (Redis) storing hot indices and session payloads.
4. **Relational / NoSQL Storage**: Divided databases (e.g., PostgreSQL for transactions, MongoDB/Cassandra for write-heavy unstructured records) to scale data storage.`,
    tradeoffs: [
      {
        component: "System Partitioning",
        optionA: "Single DB Instance with Replication",
        optionB: "Horizontal Sharding (Consistent Hashing)",
        selected: "Horizontal Sharding",
        reason: "For interview readiness, sharding is selected to ensure we can scale horizontally as data volumes grow, avoiding single database size caps."
      }
    ],
    lowLevelDesign: {
      entities: [
        {
          name: `${prob.id.replace(/-/g, '_')}_record`,
          fields: [
            "id: UUID (Primary Key)",
            "status: VARCHAR",
            "metadata: JSONB",
            "created_at: TIMESTAMP"
          ]
        }
      ],
      apis: [
        {
          method: "POST",
          path: `/api/v1/${prob.id}/action`,
          request: `{ "action": "execute", "payload": {} }`,
          response: `{ "id": "uuid-1234", "status": "completed" }`,
          description: `Core API to trigger ${prob.title} events.`
        }
      ]
    },
    code: {
      typescript: `// TypeScript stub for ${compUpper}
export class ${compUpper.replace(/[\s-]/g, '')}Service {
  public executeAction(data: any): string {
    console.log("Action executed in TypeScript for ${prob.title}");
    return "completed_ts";
  }
}`,
      python: `# Python stub for ${compUpper}
class ${compUpper.replace(/[\s-]/g, '')}Service:
    def execute_action(self, data: dict) -> str:
        print("Action executed in Python for ${prob.title}")
        return "completed_py"`,
      java: `// Java stub for ${compUpper}
public class ${compUpper.replace(/[\s-]/g, '')}Service {
    public String executeAction(Object data) {
        System.out.println("Action executed in Java for ${prob.title}");
        return "completed_java";
    }
}`,
      go: `// Go stub for ${compUpper}
package main
import "fmt"

type ${compUpper.replace(/[\s-]/g, '')}Service struct{}

func (s *${compUpper.replace(/[\s-]/g, '')}) ExecuteAction(data interface{}) string {
    fmt.Println("Action executed in Go for ${prob.title}")
    return "completed_go"
}`,
      cpp: `// C++ stub for ${compUpper}
#include <iostream>
#include <string>

class ${compUpper.replace(/[\s-]/g, '')}Service {
public:
    std::string executeAction() {
        std::cout << "Action executed in C++ for ${prob.title}" << std::endl;
        return "completed_cpp";
    }
};`
    }
  };
}

export const problems: Problem[] = rawProblemsMetadata.map(prob => {
  const hasDetail = Object.prototype.hasOwnProperty.call(detailedProblemsMap, prob.id);
  return {
    ...prob,
    isDetailed: hasDetail,
    details: hasDetail ? detailedProblemsMap[prob.id] : generateTemplateDetail(prob)
  };
});
