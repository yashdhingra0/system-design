export const messageQueueDetail = {
  problemStatement: `Design a Distributed Message Queue like Apache Kafka. The queue must support high-throughput asynchronous message publication and subscription, guarantee message order within a partition, handle scale via horizontal partitioning across broker instances, and ensure durability and high availability through partition replication.`,
  useCases: [
    "Producers can publish messages to specific Topics.",
    "Consumers can subscribe to Topics and read messages in order.",
    "Topic partitioning allows concurrent reads/writes across multiple Broker servers.",
    "Support Consumer Groups, allowing multiple consumers to share the workload without double-processing messages.",
    "Durability: messages must be written to disk (Append-Only Log) and replicated to backup brokers.",
    "Support message replayability (consumers can reset offsets and re-read historical messages)."
  ],
  highLevelDesign: `### High Level System Architecture

1. **Brokers (Data Layer)**:
   - A broker is a server instance running the queue engine.
   - Topics are split into **Partitions**. Each partition is an ordered, immutable sequence of messages (commit log).
   - For a given partition, one broker is elected as the **Leader**, and others are **Followers**. All reads/writes go to the Leader. Followers pull data to replicate.
2. **Producers**:
   - Publish messages to topics. Uses a routing key to determine which partition receives the message (e.g. \`hash(routingKey) % partitionCount\`).
3. **Consumers & Consumer Groups**:
   - Consumers subscribe to topics.
   - **Consumer Group**: Multiple consumers cooperate. Each partition is assigned to exactly one consumer in the group, guaranteeing in-order processing and scale.
4. **Coordination (ZooKeeper / Raft KRaft)**:
   - Manages cluster metadata, tracks active brokers, and elects partition leaders.`,
  tradeoffs: [
    {
      component: "Storage Engine Design",
      optionA: "Database Table Indexing (storing messages in SQL/NoSQL)",
      optionB: "OS Append-Only Page Cache Log files",
      selected: "OS Append-Only Page Cache Log files",
      reason: "Databases use B-Tree indexes which take O(log N) time to insert and search, deteriorating under high queue concurrency. An append-only log allows O(1) writes (sequential file appends). Reads are also sequential. Bypassing DB index layers allows Kafka to write millions of events per second directly to disk."
    },
    {
      component: "Message Delivery Model",
      optionA: "Push Model (Broker pushes messages to active consumers)",
      optionB: "Pull Model (Consumers request batches from the Broker when ready)",
      selected: "Pull Model (Consumers request batches from the Broker when ready)",
      reason: "In a push model, if consumers process slower than the incoming rate, they get overwhelmed, leading to memory leaks and connection drops. A pull model allows consumers to fetch data at their own rate (flow control), support batching for high throughput, and easily seek/replay historical data."
    },
    {
      component: "Network Transfer Optimization",
      optionA: "Standard application buffer copies (Disk -> Kernel -> App -> Socket)",
      optionB: "Zero-Copy Socket Transfer (Sendfile system call)",
      selected: "Zero-Copy Socket Transfer (Sendfile system call)",
      reason: "Standard copies move data through user-space memory 4 times, putting high stress on CPU and context switching. Zero-Copy instructs the OS kernel to copy data directly from the read cache to the network socket, avoiding application-level buffers, resulting in near network-wire speeds."
    }
  ],
  lowLevelDesign: {
    entities: [
      {
        name: "Partition Directory Structure",
        fields: [
          "Topic-A/Partition-0/ (Directory on Disk)",
          "├── 0000000000.log (Binary message segment)",
          "└── 0000000000.index (Maps message offsets to physical file positions)"
        ]
      },
      {
        name: "ConsumerOffset (Metadata Store / Internal Topic)",
        fields: [
          "group_id: VARCHAR",
          "topic: VARCHAR",
          "partition: INT",
          "offset: BIGINT (Last successfully read offset)"
        ]
      }
    ],
    apis: [
      {
        method: "TCP API",
        path: "ProduceRequest",
        request: `{ "topic": "logs", "partition": 1, "messages": [{ "key": "user1", "val": "action_click" }] }`,
        response: `{ "error": 0, "partition": 1, "offset": 1024 }`,
        description: "Appends message to the leader broker partition log."
      },
      {
        method: "TCP API",
        path: "FetchRequest",
        request: `{ "topic": "logs", "partition": 1, "offset": 1024, "maxBytes": 1048576 }`,
        response: `{ "messages": [...], "highWatermark": 1050 }`,
        description: "Retrieves a batch of messages for a consumer starting from a specific offset."
      }
    ]
  },
  code: {
    typescript: `// TypeScript Partition Log Simulation
interface Message {
  offset: number;
  value: string;
  timestamp: number;
}

export class TopicPartition {
  private log: Message[] = [];
  private currentOffset = 0;

  public append(value: string): number {
    const offset = this.currentOffset++;
    this.log.push({
      offset,
      value,
      timestamp: Date.now()
    });
    return offset;
  }

  public read(fromOffset: number, limit = 10): Message[] {
    return this.log.filter(m => m.offset >= fromOffset).slice(0, limit);
  }

  public size(): number {
    return this.log.length;
  }
}

// Simulated Consumer group offset tracking
export class ConsumerGroupTracker {
  private offsets = new Map<string, number>(); // "groupId:partition" -> offset

  public commit(groupId: string, partitionId: number, offset: number) {
    this.offsets.set(\`\${groupId}:\${partitionId}\`, offset);
  }

  public getOffset(groupId: string, partitionId: number): number {
    return this.offsets.get(\`\${groupId}:\${partitionId}\`) || 0;
  }
}`,
    python: `# Python Commit Log Simulation
import time

class LogMessage:
    def __init__(self, offset: int, value: str):
        self.offset = offset
        self.value = value
        self.timestamp = time.time()

class CommitLogPartition:
    def __init__(self):
        self.messages = []
        self.next_offset = 0

    def append(self, value: str) -> int:
        offset = self.next_offset
        self.messages.append(LogMessage(offset, value))
        self.next_offset += 1
        return offset

    def fetch(self, start_offset: int, max_count: int = 5) -> list:
        # Sequential scan from offset
        result = [m for m in self.messages if m.offset >= start_offset]
        return result[:max_count]`,
    java: `// Java Broker Partition Queue implementation
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class BrokerPartition {
    public static class QueueMessage {
        public long offset;
        public String value;
        public long timestamp;

        public QueueMessage(long offset, String value) {
            this.offset = offset;
            this.value = value;
            this.timestamp = System.currentTimeMillis();
        }
    }

    private final List<QueueMessage> logSegment = new ArrayList<>();
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    private long currentOffset = 0;

    public long append(String val) {
        lock.writeLock().lock();
        try {
            long offset = currentOffset++;
            logSegment.add(new QueueMessage(offset, val));
            return offset;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public List<QueueMessage> fetch(long startOffset, int limit) {
        lock.readLock().lock();
        try {
            List<QueueMessage> batch = new ArrayList<>();
            for (QueueMessage msg : logSegment) {
                if (msg.offset >= startOffset) {
                    batch.add(msg);
                    if (batch.size() >= limit) break;
                }
            }
            return batch;
        } finally {
            lock.readLock().unlock();
        }
    }
}`,
    go: `// Go log-based broker partition
package main

import (
	"errors"
	"sync"
	"time"
)

type Msg struct {
	Offset    int64
	Val       string
	Timestamp time.Time
}

type PartitionLog struct {
	mu           sync.RWMutex
	messages     []Msg
	commitOffset int64
}

func NewPartitionLog() *PartitionLog {
	return &PartitionLog{
		messages:     make([]Msg, 0),
		commitOffset: 0,
	}
}

func (p *PartitionLog) Append(value string) int64 {
	p.mu.Lock()
	defer p.mu.Unlock()

	offset := p.commitOffset
	p.messages = append(p.messages, Msg{
		Offset:    offset,
		Val:       value,
		Timestamp: time.Now(),
	})
	p.commitOffset++
	return offset
}

func (p *PartitionLog) Fetch(startOffset int64, batchSize int) ([]Msg, error) {
	p.mu.RLock()
	defer p.mu.RUnlock()

	if startOffset < 0 || startOffset >= p.commitOffset {
		return nil, errors.New("out of bounds offset")
	}

	var batch []Msg
	count := 0
	for _, m := range p.messages {
		if m.Offset >= startOffset {
			batch = append(batch, m)
			count++
			if count >= batchSize {
				break
			}
		}
	}
	return batch, nil
}`,
    cpp: `// C++ Partition Log mockup
#include <iostream>
#include <vector>
#include <string>
#include <chrono>
#include <shared_mutex>

struct Message {
    long long offset;
    std::string value;
    std::chrono::system_clock::time_point timestamp;
};

class PartitionLog {
private:
    std::vector<Message> log;
    long long currentOffset = 0;
    std::shared_mutex mtx;

public:
    long long append(const std::string& val) {
        std::unique_lock lock(mtx);
        long long offset = currentOffset++;
        log.push_back({offset, val, std::chrono::system_clock::now()});
        return offset;
    }

    std::vector<Message> read(long long fromOffset, int limit = 10) {
        std::shared_lock lock(mtx);
        std::vector<Message> result;
        for (const auto& msg : log) {
            if (msg.offset >= fromOffset) {
                result.push_back(msg);
                if (result.size() >= limit) break;
            }
        }
        return result;
    }
};`
  }
};
