export const webCrawlerDetail = {
  problemStatement: `Design a Distributed Web Crawler like Googlebot that can traverse the entire World Wide Web, fetch webpages, extract links, discover new pages, and save content for a search engine search index. The crawler must crawl politely, scale to billions of URLs, be highly fault tolerant, and avoid traps (infinite directories, spider traps).`,
  useCases: [
    "Traverse the web starting from a set of seed URLs.",
    "Parse HTML to extract outgoing links and add them to the crawl queue.",
    "Avoid crawling duplicate pages (deduplication of both URLs and content).",
    "Politeness: respect robots.txt instructions and never overload a target server with excessive requests.",
    "Handle massive scale (billions of pages) and distribute tasks across a network of workers.",
    "Robustness: handle bad links, connection timeouts, redirects, and spider traps."
  ],
  highLevelDesign: `### High Level System Architecture

1. **URL Frontier (Central Crawl Queue)**:
   - Manages the queue of URLs waiting to be crawled.
   - Organizes URLs by hostnames to enforce **Politeness** (ensuring only one worker queries a host at a time, with a delay like 1-2 seconds between requests) and **Priority**.
2. **HTML Downloader Workers**:
   - Worker processes that fetch webpages from the internet using HTTP.
   - Employs a **DNS Resolver Cache** to avoid resolving domain names repeatedly, which adds massive latency.
3. **HTML Parser & Content Extractor**:
   - Parses the downloaded page content, extracts text/metadata, and isolates outgoing links (\`<a href="...">\`).
4. **Duplicate Filter (Bloom Filter)**:
   - Before adding newly discovered URLs back to the Frontier, it checks a **Bloom Filter** to verify if the URL has already been crawled or scheduled. If not, it writes the URL to a database and adds it to the Frontier.
5. **Content Deduplicator**:
   - Compares document hashes (using Locality-Sensitive Hashing or SimHash) to prevent indexing duplicate pages with different URLs (e.g. print versions or HTTP vs. HTTPS mirrors).`,
  tradeoffs: [
    {
      component: "Search Traversal Strategy",
      optionA: "Depth-First Search (DFS)",
      optionB: "Breadth-First Search (BFS)",
      selected: "Breadth-First Search (BFS) with Priority",
      reason: "DFS descends indefinitely down a single website's links, getting stuck in deep structures or infinite loops (spider traps). BFS crawls in layers, spreading queries across different websites. It is safer, discovers page hierarchies naturally, and allows us to prioritize high-value pages (e.g., homepages) first."
    },
    {
      component: "URL Deduplication Engine",
      optionA: "In-memory Hash Set (SQL Unique Indexes)",
      optionB: "Distributed Bloom Filter",
      selected: "Distributed Bloom Filter",
      reason: "To track billions of URLs, a simple hash set would consume terabytes of RAM. Bloom Filters are space-efficient probabilistic data structures. They tell us if a URL is *definitely not* crawled, or *might be* crawled. While it has a small false positive rate (about 1% which means we might skip 1 in 100 pages), it uses 95%+ less memory, fitting billions of URLs in standard server RAM."
    },
    {
      component: "Politeness Enforcement",
      optionA: "Simple Sleep delays in download worker threads",
      optionB: "Host-to-Queue routing mapping (Frontier queues)",
      selected: "Host-to-Queue routing mapping (Frontier queues)",
      reason: "Simple sleep delays block threads, reducing crawler throughput. By routing URLs to queues mapped directly to specific hostnames (e.g., one queue for wikipedia.org, one for github.com) and using a queue selector that only pulls from a host queue once its cooldown timer has elapsed, we ensure politeness without idle worker threads."
    }
  ],
  lowLevelDesign: {
    entities: [
      {
        name: "CrawlHistory (Database Schema)",
        fields: [
          "url_hash: VARCHAR(64) (Primary Key)",
          "url: TEXT",
          "last_crawled_at: TIMESTAMP",
          "content_hash: VARCHAR(64)"
        ]
      },
      {
        name: "FrontierQueue (Queue Structure)",
        fields: [
          "Queue FIFO 1..N: Prioritized incoming URLs",
          "Queue Host-Mapping: Hostname -> FIFO Queue",
          "Queue Cooldown table: Hostname -> next_allowed_time"
        ]
      }
    ],
    apis: [
      {
        method: "Worker Pull",
        path: "Frontier.nextUrl()",
        request: "Worker ID, status=ready",
        response: `{ "url": "https://example.com/blog", "timeoutMs": 5000 }`,
        description: "Returns the next polite URL to crawl from the Frontier queues."
      }
    ]
  },
  code: {
    typescript: `// TypeScript Simple Web Crawler Mockup
import axios from 'axios'; // Mocked usage

export class BloomFilterMock {
  private filter = new Set<string>();

  public add(val: string) {
    this.filter.add(val);
  }

  public mightContain(val: string): boolean {
    return this.filter.has(val); // Simulated bloom check
  }
}

export class SimpleCrawler {
  private frontier: string[] = [];
  private bloomFilter = new BloomFilterMock();
  private crawledUrls: string[] = [];

  constructor(seeds: string[]) {
    for (const seed of seeds) {
      this.frontier.push(seed);
      this.bloomFilter.add(seed);
    }
  }

  // Simulates parsing outgoing links from a page
  private extractLinks(url: string): string[] {
    console.log(\`Parsing page \${url}\`);
    if (url.includes('seed.com')) {
      return ['https://seed.com/about', 'https://other.com/contact'];
    }
    return [];
  }

  public crawlNext(): string | null {
    if (this.frontier.length === 0) return null;

    const url = this.frontier.shift()!;
    this.crawledUrls.push(url);

    const discoveredLinks = this.extractLinks(url);
    for (const link of discoveredLinks) {
      if (!this.bloomFilter.mightContain(link)) {
        this.bloomFilter.add(link);
        this.frontier.push(link); // Add to frontier queue
      }
    }
    return url;
  }

  public getFrontierSize(): number {
    return this.frontier.length;
  }
}`,
    python: `# Python Web Crawler Simulation
import urllib.parse

class WebCrawler:
    def __init__(self, seeds):
        self.frontier = list(seeds)
        self.visited = set()
        
    def get_host(self, url):
        return urllib.parse.urlparse(url).netloc

    def parse_links(self, url):
        # Mock HTML link extraction
        if "google.com" in url:
            return ["https://google.com/search", "https://news.google.com"]
        return []

    def crawl_step(self):
        if not self.frontier:
            return None
            
        url = self.frontier.pop(0)
        self.visited.add(url)
        
        # Parse & Discover
        links = self.parse_links(url)
        for link in links:
            if link not in self.visited and link not in self.frontier:
                self.frontier.append(link)
                
        return url

# crawler = WebCrawler(["https://google.com"])
# crawler.crawl_step()`,
    java: `// Java Simple Link Parser
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Set;

public class SimpleWebCrawler {
    private final Queue<String> frontier = new LinkedList<>();
    private final Set<String> visited = new HashSet<>();

    public SimpleWebCrawler(String[] seeds) {
        for (String seed : seeds) {
            frontier.add(seed);
            visited.add(seed);
        }
    }

    private String[] mockHtmlParser(String url) {
        if (url.contains("wikipedia.org")) {
            return new String[]{ "https://wikipedia.org/wiki/Science", "https://wikipedia.org/wiki/History" };
        }
        return new String[0];
    }

    public String crawlNext() {
        if (frontier.isEmpty()) {
            return null;
        }

        String url = frontier.poll();
        String[] links = mockHtmlParser(url);

        for (String link : links) {
            if (!visited.contains(link)) {
                visited.add(link);
                frontier.add(link); // Append to FIFO queue
            }
        }
        return url;
    }
}`,
    go: `// Go Crawl Worker Channel pipeline
package main

import (
	"fmt"
	"net/url"
	"sync"
)

type Crawler struct {
	mu       sync.Mutex
	visited  map[string]bool
	frontier chan string
}

func NewCrawler(seeds []string, bufferSize int) *Crawler {
	c := &Crawler{
		visited:  make(map[string]bool),
		frontier: make(chan string, bufferSize),
	}
	for _, seed := range seeds {
		c.visited[seed] = true
		c.frontier <- seed
	}
	return c
}

func (c *Crawler) extractLinks(pageURL string) []string {
	// Parse URL host
	u, _ := url.Parse(pageURL)
	if u.Host == "github.com" {
		return []string{"https://github.com/trending", "https://github.com/about"}
	}
	return []string{}
}

func (c *Crawler) CrawlWorker(workerID int) {
	for link := range c.frontier {
		fmt.Printf("Worker %d crawling: %s\\n", workerID, link)
		
		extracted := c.extractLinks(link)
		c.mu.Lock()
		for _, exLink := range extracted {
			if !c.visited[exLink] {
				c.visited[exLink] = true
				
				// Try send to channel without blocking
				select {
				case c.frontier <- exLink:
				default:
					fmt.Println("Frontier buffer full. Dropping link.")
				}
			}
		}
		c.mu.Unlock()
	}
}`,
    cpp: `// C++ URL frontier manager
#include <iostream>
#include <queue>
#include <unordered_set>
#include <string>
#include <mutex>

class UrlFrontier {
private:
    std::queue<std::string> queue;
    std::unordered_set<std::string> bloomMock;
    std::mutex mtx;

public:
    void addUrl(const std::string& url) {
        std::lock_guard<std::mutex> lock(mtx);
        if (bloomMock.find(url) == bloomMock.end()) {
            bloomMock.insert(url);
            queue.push(url);
        }
    }

    std::string getNextUrl() {
        std::lock_guard<std::mutex> lock(mtx);
        if (queue.empty()) {
            return "";
        }
        std::string next = queue.front();
        queue.pop();
        return next;
    }

    size_t size() {
        std::lock_guard<std::mutex> lock(mtx);
        return queue.size();
    }
};`
  }
};
