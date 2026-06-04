export const urlShortenerDetail = {
  problemStatement: `Design a URL Shortening service like TinyURL. The service will take a long URL (e.g., https://example.com/very-long-path/page.html) and generate a short alias (e.g., https://tiny.url/ab12XYZ). When a user visits the short URL, the system must redirect them to the original long URL with minimum latency.`,
  useCases: [
    "Generate a unique short URL corresponding to a given long URL.",
    "Redirect user requests from a short URL to the original long URL with 301/302 Redirect status code.",
    "Support custom aliases (e.g., tiny.url/my-custom-path).",
    "Support URL expiration (URLs should automatically delete after a specified retention period).",
    "Gather analytics: number of redirects/clicks per URL over time.",
    "Highly available, highly performant, and scale to billions of URLs."
  ],
  highLevelDesign: `### High Level System Architecture

The system splits cleanly into two main flow paths:
1. **Write Path (Shorten URL)**:
   - **Client** submits a long URL via POST request.
   - **Load Balancer** routes the request to one of the **Web Servers**.
   - The **Web Server** checks if a custom alias is provided or requests a unique ID from the **ID Generator**.
   - The server encodes the numerical ID into a Base62 string (e.g., \`568392\` -> \`a8F\`).
   - The server writes the mapping \`shortKey -> longUrl\` to the **Database** and caches it.
   - The short URL is returned to the client.

2. **Read Path (Redirection)**:
   - **Client** requests the short URL (e.g., GET \`/a8F\`).
   - **Load Balancer** redirects the request to the **Web Servers**.
   - The server first checks the **Cache (Redis)**.
   - **Cache Hit**: Instantly returns a HTTP 302/301 redirection header to the client.
   - **Cache Miss**: Queries the **Database**. If found, writes it to the cache for future requests and redirects. If not found, returns HTTP 404.`,
  tradeoffs: [
    {
      component: "Database Storage",
      optionA: "Relational Database (SQL - PostgreSQL)",
      optionB: "NoSQL Database (NoSQL - DynamoDB/Cassandra)",
      selected: "NoSQL Database (DynamoDB/Cassandra)",
      reason: "URL shortening is read-heavy and does not require complex relations or ACID transactions across multiple tables. NoSQL databases scale horizontally out-of-the-box and handle simple key-value reads/writes with sub-10ms latencies, which is ideal for billions of records."
    },
    {
      component: "Short URL Generation",
      optionA: "Hashing (MD5 / SHA-256) + Collision Resolution",
      optionB: "Unique Counter ID + Base62 Encoding",
      selected: "Unique Counter ID + Base62 Encoding",
      reason: "MD5 hashing produces a 128-bit hash. Even if we take the first 7 characters, collisions will occur, requiring us to check the database on every write and append a counter. A centralized ID generator (like Snowflake) provides a guaranteed unique sequence number which is then directly converted to Base62 without database lookups or collision risks."
    },
    {
      component: "HTTP Redirection Code",
      optionA: "HTTP 301 Permanent Redirect",
      optionB: "HTTP 302 Temporary Redirect",
      selected: "HTTP 302 Temporary Redirect",
      reason: "HTTP 301 redirects are cached indefinitely by the browser. If we want to collect analytics (count clicks, capture referrer data, user-agents) on every click, we should use HTTP 302 redirects, forcing the client's browser to hit our servers every time before redirecting."
    }
  ],
  lowLevelDesign: {
    entities: [
      {
        name: "URL_Mapping (Database Table)",
        fields: [
          "short_key: VARCHAR(7) (Primary Key)",
          "original_url: TEXT (Not Null)",
          "creator_id: VARCHAR(64) (Nullable)",
          "created_at: TIMESTAMP",
          "expiration_time: TIMESTAMP (Indexed)"
        ]
      },
      {
        name: "URL_Analytics (Database Table / Timeseries)",
        fields: [
          "id: UUID (Primary Key)",
          "short_key: VARCHAR(7) (Foreign Key / Indexed)",
          "timestamp: TIMESTAMP",
          "ip_address: VARCHAR(45)",
          "user_agent: TEXT",
          "referrer: VARCHAR(256)"
        ]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/shorten",
        request: `{ "longUrl": "https://example.com/long-path", "customAlias": "optional-alias", "expireAfterDays": 30 }`,
        response: `{ "shortUrl": "https://tiny.url/a8F", "expireAt": "2026-07-04T12:00:00Z" }`,
        description: "Takes a long URL and generates a short key. Validates URLs and supports custom aliases."
      },
      {
        method: "GET",
        path: "/{shortKey}",
        request: "Header: User-Agent, Referrer",
        response: "HTTP 302 Redirect to Long URL",
        description: "Redirects the visitor to the original URL. Returns HTTP 404 if the key is invalid or expired."
      }
    ]
  },
  code: {
    typescript: `// TypeScript Implementation of Base62 URL Shortener
import express, { Request, Response } from 'express';

const BASE62_CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export class Base62Converter {
  public static encode(num: number): string {
    let result = '';
    while (num > 0) {
      result = BASE62_CHARSET[num % 62] + result;
      num = Math.floor(num / 62);
    }
    return result.padStart(7, 'a');
  }

  public static decode(str: string): number {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      let val = 0;
      if (code >= 97 && code <= 122) val = code - 97; // a-z
      else if (code >= 65 && code <= 90) val = code - 65 + 26; // A-Z
      else if (code >= 48 && code <= 57) val = code - 48 + 52; // 0-9
      result = result * 62 + val;
    }
    return result;
  }
}

// In-Memory Simulation of Database & Cache
const db = new Map<string, string>();
const cache = new Map<string, string>();
let globalCounter = 1000000000; // Starting ID for 7-char range

const app = express();
app.use(express.json());

app.post('/api/v1/shorten', (req: Request, res: Response) => {
  const { longUrl, customAlias } = req.body;
  if (!longUrl) return res.status(400).json({ error: "longUrl is required" });

  let shortKey: string;
  if (customAlias) {
    if (db.has(customAlias)) {
      return res.status(409).json({ error: "Alias already in use" });
    }
    shortKey = customAlias;
  } else {
    const id = globalCounter++;
    shortKey = Base62Converter.encode(id);
  }

  db.set(shortKey, longUrl);
  cache.set(shortKey, longUrl); // Populate cache

  res.status(201).json({ shortUrl: \`https://tiny.url/\${shortKey}\` });
});

app.get('/:shortKey', (req: Request, res: Response) => {
  const { shortKey } = req.params;

  // 1. Check cache
  let longUrl = cache.get(shortKey);

  if (!longUrl) {
    // 2. Check DB (Cache Miss)
    longUrl = db.get(shortKey);
    if (longUrl) {
      cache.set(shortKey, longUrl); // Populate cache
    }
  }

  if (longUrl) {
    // Async Analytics tracking goes here
    console.log(\`Analytics: Redirecting \${shortKey} to \${longUrl}\`);
    return res.redirect(302, longUrl);
  }

  res.status(404).send("URL not found");
});`,
    python: `# Python Implementation of Base62 URL Shortener
import string

BASE62_CHARSET = string.ascii_lowercase + string.ascii_uppercase + string.digits

class Base62Converter:
    @staticmethod
    def encode(num: int) -> str:
        if num == 0:
            return BASE62_CHARSET[0]
        arr = []
        base = len(BASE62_CHARSET)
        while num:
            num, rem = divmod(num, base)
            arr.append(BASE62_CHARSET[rem])
        arr.reverse()
        return ''.join(arr).rjust(7, 'a')

    @staticmethod
    def decode(s: str) -> int:
        base = len(BASE62_CHARSET)
        limit = len(s)
        res = 0
        for i in range(limit):
            val = BASE62_CHARSET.index(s[i])
            res = res * base + val
        return res

# Simulation components
db = {}
cache = {}
global_counter = 1000000000

def shorten_url(long_url: str, custom_alias: str = None) -> str:
    global global_counter
    if custom_alias:
        if custom_alias in db:
            raise ValueError("Alias taken")
        short_key = custom_alias
    else:
        id_val = global_counter
        global_counter += 1
        short_key = Base62Converter.encode(id_val)
        
    db[short_key] = long_url
    cache[short_key] = long_url
    return f"https://tiny.url/{short_key}"

def redirect_url(short_key: str) -> str:
    # 1. Read from cache
    if short_key in cache:
        return cache[short_key]
        
    # 2. Read from DB on cache miss
    if short_key in db:
        url = db[short_key]
        cache[short_key] = url # Populate cache
        return url
        
    return None # 404`,
    java: `// Java Implementation of Base62 URL Shortener
import java.util.HashMap;
import java.util.Map;

public class UrlShortenerService {
    private static final String BASE62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private final Map<String, String> db = new HashMap<>();
    private final Map<String, String> cache = new HashMap<>();
    private long globalCounter = 1000000000L;

    public static String encode(long num) {
        StringBuilder sb = new StringBuilder();
        while (num > 0) {
            sb.append(BASE62.charAt((int) (num % 62)));
            num /= 62;
        }
        while (sb.length() < 7) {
            sb.append('a');
        }
        return sb.reverse().toString();
    }

    public static long decode(String str) {
        long num = 0;
        for (int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            int val = BASE62.indexOf(c);
            num = num * 62 + val;
        }
        return num;
    }

    public synchronized String shortenUrl(String longUrl, String customAlias) throws IllegalArgumentException {
        String shortKey;
        if (customAlias != null && !customAlias.isEmpty()) {
            if (db.containsKey(customAlias)) {
                throw new IllegalArgumentException("Alias already in use");
            }
            shortKey = customAlias;
        } else {
            shortKey = encode(globalCounter++);
        }
        db.put(shortKey, longUrl);
        cache.put(shortKey, longUrl); // Populate cache
        return "https://tiny.url/" + shortKey;
    }

    public String getOriginalUrl(String shortKey) {
        // 1. Try cache
        if (cache.containsKey(shortKey)) {
            return cache.get(shortKey);
        }
        // 2. Try DB
        if (db.containsKey(shortKey)) {
            String originalUrl = db.get(shortKey);
            cache.put(shortKey, originalUrl); // populate cache
            return originalUrl;
        }
        return null;
    }
}`,
    go: `// Go Implementation of Base62 URL Shortener
package main

import (
	"errors"
	"fmt"
	"strings"
	"sync"
)

const base62Charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

type URLShortener struct {
	mu            sync.Mutex
	db            map[string]string
	cache         map[string]string
	globalCounter int64
}

func NewURLShortener() *URLShortener {
	return &URLShortener{
		db:            make(map[string]string),
		cache:         make(map[string]string),
		globalCounter: 1000000000,
	}
}

func Encode(num int64) string {
	var sb strings.Builder
	for num > 0 {
		rem := num % 62
		sb.WriteByte(base62Charset[rem])
		num /= 62
	}
	encoded := sb.String()
	// reverse and pad
	runes := []rune(encoded)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	result := string(runes)
	for len(result) < 7 {
		result = "a" + result
	}
	return result
}

func (s *URLShortener) Shorten(longURL string, customAlias string) (string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var shortKey string
	if customAlias != "" {
		if _, exists := s.db[customAlias]; exists {
			return "", errors.New("alias already taken")
		}
		shortKey = customAlias
	} else {
		shortKey = Encode(s.globalCounter)
		s.globalCounter++
	}

	s.db[shortKey] = longURL
	s.cache[shortKey] = longURL
	return fmt.Sprintf("https://tiny.url/%s", shortKey), nil
}

func (s *URLShortener) Redirect(shortKey string) (string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// 1. Check cache
	if url, found := s.cache[shortKey]; found {
		return url, nil
	}

	// 2. Check DB
	if url, found := s.db[shortKey]; found {
		s.cache[shortKey] = url // Update cache
		return url, nil
	}

	return "", errors.New("URL not found")
}`,
    cpp: `// C++ Implementation of Base62 URL Shortener
#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>
#include <stdexcept>

class UrlShortener {
private:
    const std::string BASE62_CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    std::unordered_map<std::string, std::string> db;
    std::unordered_map<std::string, std::string> cache;
    long long globalCounter = 1000000000LL;

public:
    std::string encode(long long num) {
        std::string result;
        while (num > 0) {
            result += BASE62_CHARSET[num % 62];
            num /= 62;
        }
        std::reverse(result.begin(), result.end());
        while (result.length() < 7) {
            result = "a" + result;
        }
        return result;
    }

    std::string shortenUrl(const std::string& longUrl, const std::string& customAlias = "") {
        std::string shortKey;
        if (!customAlias.empty()) {
            if (db.find(customAlias) != db.end()) {
                throw std::invalid_argument("Alias already in use");
            }
            shortKey = customAlias;
        } else {
            shortKey = encode(globalCounter++);
        }
        db[shortKey] = longUrl;
        cache[shortKey] = longUrl;
        return "https://tiny.url/" + shortKey;
    }

    std::string getOriginalUrl(const std::string& shortKey) {
        // 1. Check cache
        if (cache.find(shortKey) != cache.end()) {
            return cache[shortKey];
        }
        // 2. Check DB (Cache Miss)
        if (db.find(shortKey) != db.end()) {
            std::string original = db[shortKey];
            cache[shortKey] = original; // update cache
            return original;
        }
        return "";
    }
};`
  }
};
