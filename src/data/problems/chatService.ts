export const chatServiceDetail = {
  problemStatement: `Design a Real-time Chat Service like WhatsApp, WeChat, or Slack. The system should support one-on-one and group messaging, real-time message delivery with low latency, message delivery status (sent, delivered, read), user presence status (online/offline), and historical chat storage.`,
  useCases: [
    "One-on-one real-time messaging with low latency (< 100ms).",
    "Group messaging (up to 500 members in a group).",
    "Message status tracking (Sent -> Delivered -> Read).",
    "User presence status (Online, Offline, Last Seen).",
    "Persistent chat history storage and pagination.",
    "Support for sending offline messages (delivering them when a user reconnects)."
  ],
  highLevelDesign: `### High Level System Architecture

1. **Client Connections (WebSockets)**:
   - Clients establish a persistent connection with **WebSocket Servers (Gateway)**. WebSockets allow bi-directional, full-duplex communication over a single TCP connection, critical for low-latency messaging.
2. **WebSocket Manager & Connection Repository**:
   - Manages active connections. Stores mapping of \`userId -> webSocketServerIp\` in a distributed cache like **Redis** (Presence & Session Store).
3. **Chat Service (Microservice)**:
   - Receives message objects from a WebSocket server, saves them to the **Database**, and checks if the receiver is online.
   - **If Online**: Finds their WebSocket server in Redis and forwards the message to that server, which pushes it to the recipient.
   - **If Offline**: Sends a notification via the **Push Notification Service (APNs/FCM)**.
4. **Database (Cassandra/HBase)**:
   - Used for storing high-frequency chat messages. Optimized for write-heavy timeseries data.`,
  tradeoffs: [
    {
      component: "Network Protocol",
      optionA: "HTTP Long Polling / Server-Sent Events (SSE)",
      optionB: "WebSockets (Bi-directional TCP)",
      selected: "WebSockets (Bi-directional TCP)",
      reason: "Long polling is slow, creates high HTTP header overhead, and strains the server pool. SSE is uni-directional (Server to Client). WebSockets provide a persistent, bi-directional, lightweight connection, which is essential for two-way conversations and typing indicators."
    },
    {
      component: "Message Database",
      optionA: "Relational Database (MySQL / PostgreSQL)",
      optionB: "NoSQL Wide-Column Store (Cassandra / HBase)",
      selected: "NoSQL Wide-Column Store (Cassandra)",
      reason: "Chat messages are write-heavy, read-sequential (scrolling history), and grow exponentially. Relational databases degrade under high concurrent insert rates and sharding joins is complex. Cassandra's log-structured merge-tree (LSM) storage engine provides sub-millisecond writes, and stores chat history sequentially on disk grouped by \`chat_room_id\`."
    },
    {
      component: "Presence Status updates",
      optionA: "Pushing active changes on every status toggle",
      optionB: "Heartbeat pulling + Last Seen timestamping",
      selected: "Heartbeat pulling + Last Seen timestamping",
      reason: "Directly pushing presence updates (Online/Offline) to all friends on every network glitch creates a write storm (millions of writes per second). A heartbeat mechanism (client sends ping every 5-10 seconds) combined with lazy-loading presence when a user opens a chat window drastically reduces network traffic."
    }
  ],
  lowLevelDesign: {
    entities: [
      {
        name: "Messages (Cassandra Table)",
        fields: [
          "channel_id: UUID (Partition Key)",
          "message_id: TIMEUUID (Clustering Key - orders messages chronologically)",
          "sender_id: UUID",
          "content: TEXT",
          "status: VARCHAR (SENT, DELIVERED, READ)"
        ]
      },
      {
        name: "UserSessions (Redis Key)",
        fields: [
          "Key: user:session:{userId} (String)",
          "Value: gateway_ip_address (expires in 15s if no heartbeat)"
        ]
      }
    ],
    apis: [
      {
        method: "WebSocket Event",
        path: "send_message",
        request: `{ "to": "user-456", "content": "Hello!", "channelId": "group-789" }`,
        response: `{ "messageId": "msg-992", "status": "sent", "timestamp": 1622548800 }`,
        description: "WebSocket frame sent by client to publish a message."
      },
      {
        method: "GET",
        path: "/api/v1/messages",
        request: "Query params: channelId, limit=50, cursor=msg-900",
        response: `{ "messages": [...], "nextCursor": "msg-850" }`,
        description: "Fetches paginated historical messages for a chat channel."
      }
    ]
  },
  code: {
    typescript: `// TypeScript WebSocket Chat Client & Server Mockup
import { EventEmitter } from 'events';

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
}

class ChatGateway extends EventEmitter {
  private activeConnections = new Map<string, string>(); // userId -> gatewayServerIp
  private messageStore = new Map<string, Message[]>();

  constructor() {
    super();
  }

  public connectUser(userId: string, serverIp: string) {
    this.activeConnections.set(userId, serverIp);
    this.emit('status', userId, 'online');
  }

  public disconnectUser(userId: string) {
    this.activeConnections.delete(userId);
    this.emit('status', userId, 'offline');
  }

  public sendMessage(from: string, to: string, content: string): Message {
    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      from,
      to,
      content,
      timestamp: Date.now()
    };

    // Store in historical chat log
    const chatKey = [from, to].sort().join('_');
    if (!this.messageStore.has(chatKey)) {
      this.messageStore.set(chatKey, []);
    }
    this.messageStore.get(chatKey)!.push(msg);

    // Route message
    const receiverGateway = this.activeConnections.get(to);
    if (receiverGateway) {
      console.log(\`[Routing] Routing message \${msg.id} via gateway \${receiverGateway} to user \${to}\`);
      this.emit('deliver', to, msg);
    } else {
      console.log(\`[Push Notification] User \${to} is offline. Sending FCM alert.\`);
    }

    return msg;
  }
}`,
    python: `# Python WebSocket Connection Mockup
import time
import uuid

class Message:
    def __init__(self, from_user: str, to_user: str, content: str):
        self.message_id = str(uuid.uuid4())
        self.from_user = from_user
        self.to_user = to_user
        self.content = content
        self.timestamp = int(time.time() * 1000)

class ChatServer:
    def __init__(self):
        self.user_sessions = {} # userId -> Socket Connection
        self.chat_history = {} # chat_key -> list of messages

    def connect(self, user_id: str, ws_connection):
        self.user_sessions[user_id] = ws_connection
        print(f"User {user_id} connected.")

    def disconnect(self, user_id: str):
        if user_id in self.user_sessions:
            del self.user_sessions[user_id]
            print(f"User {user_id} disconnected.")

    def send_message(self, from_user: str, to_user: str, content: str):
        msg = Message(from_user, to_user, content)
        chat_key = "_".join(sorted([from_user, to_user]))
        
        # Save message
        if chat_key not in self.chat_history:
            self.chat_history[chat_key] = []
        self.chat_history[chat_key].append(msg)
        
        # Deliver message
        if to_user in self.user_sessions:
            ws = self.user_sessions[to_user]
            ws.send(f"New Message from {from_user}: {content}")
            print(f"Directly delivered to {to_user}")
        else:
            print(f"Saved message. Queueing push alert for offline user {to_user}")
        return msg`,
    java: `// Java Chat Manager implementation
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class ChatManager {
    public static class Message {
        public String id = UUID.randomUUID().toString();
        public String from;
        public String to;
        public String content;
        public long timestamp = System.currentTimeMillis();

        public Message(String from, String to, String content) {
            this.from = from;
            this.to = to;
            this.content = content;
        }
    }

    private final Map<String, String> userSessionRegistry = new ConcurrentHashMap<>();
    private final Map<String, List<Message>> databaseMock = new ConcurrentHashMap<>();

    public void registerUser(String userId, String serverIp) {
        userSessionRegistry.put(userId, serverIp);
    }

    public void unregisterUser(String userId) {
        userSessionRegistry.remove(userId);
    }

    public Message handleIncomingMessage(String from, String to, String content) {
        Message msg = new Message(from, to, content);
        
        // Save to wide-column simulated DB
        String chatKey = getChatKey(from, to);
        databaseMock.computeIfAbsent(chatKey, k -> new ArrayList<>()).add(msg);
        
        // Routing logic
        String targetServer = userSessionRegistry.get(to);
        if (targetServer != null) {
            System.out.println("Forwarding message " + msg.id + " to WebServer " + targetServer + " for user " + to);
        } else {
            System.out.println("User " + to + " is offline. Pushing notification.");
        }
        return msg;
    }

    private String getChatKey(String u1, String u2) {
        String[] arr = {u1, u2};
        Arrays.sort(arr);
        return arr[0] + "_" + arr[1];
    }
}`,
    go: `// Go Real-time chat pipeline
package main

import (
	"fmt"
	"sort"
	"sync"
	"time"
)

type ChatMessage struct {
	ID        string    \`json:"id"\`
	From      string    \`json:"from"\`
	To        string    \`json:"to"\`
	Content   string    \`json:"content"\`
	Timestamp time.Time \`json:"timestamp"\`
}

type ChatHub struct {
	mu           sync.RWMutex
	connections  map[string]string // userId -> gatewayServerIp
	historyCache map[string][]ChatMessage
}

func NewChatHub() *ChatHub {
	return &ChatHub{
		connections:  make(map[string]string),
		historyCache: make(map[string][]ChatMessage),
	}
}

func (h *ChatHub) Connect(userID string, gatewayIP string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.connections[userID] = gatewayIP
}

func (h *ChatHub) Disconnect(userID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.connections, userID)
}

func (h *ChatHub) RouteMessage(from string, to string, content string) ChatMessage {
	msg := ChatMessage{
		ID:        fmt.Sprintf("%d", time.Now().UnixNano()),
		From:      from,
		To:        to,
		Content:   content,
		Timestamp: time.Now(),
	}

	h.mu.Lock()
	// Save to DB Cache key
	users := []string{from, to}
	sort.Strings(users)
	chatKey := fmt.Sprintf("%s_%s", users[0], users[1])
	h.historyCache[chatKey] = append(h.historyCache[chatKey], msg)
	
	// Check connection
	serverIP, online := h.connections[to]
	h.mu.Unlock()

	if online {
		fmt.Printf("[Routing] Sent payload to gateway %s for user %s\\n", serverIP, to)
	} else {
		fmt.Printf("[Offline] Pushed background notification to iOS/Android for client %s\\n", to)
	}

	return msg
}`,
    cpp: `// C++ Chat Manager mockup
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>
#include <algorithm>
#include <chrono>

struct ChatMessage {
    std::string id;
    std::string fromUser;
    std::string toUser;
    std::string content;
    long long timestamp;
};

class ChatHub {
private:
    std::unordered_map<std::string, std::string> activeSessions; // userId -> serverIp
    std::unordered_map<std::string, std::vector<ChatMessage>> chatLogs;

    std::string getChatKey(const std::string& u1, const std::string& u2) {
        std::string first = u1;
        std::string second = u2;
        if (first > second) std::swap(first, second);
        return first + "_" + second;
    }

public:
    void connectUser(const std::string& userId, const std::string& serverIp) {
        activeSessions[userId] = serverIp;
    }

    void disconnectUser(const std::string& userId) {
        activeSessions.erase(userId);
    }

    ChatMessage handleMessage(const std::string& from, const std::string& to, const std::string& content) {
        ChatMessage msg;
        msg.id = "msg_" + std::to_string(std::chrono::system_clock::now().time_since_epoch().count());
        msg.fromUser = from;
        msg.toUser = to;
        msg.content = content;
        msg.timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();

        std::string key = getChatKey(from, to);
        chatLogs[key].push_back(msg);

        if (activeSessions.find(to) != activeSessions.end()) {
            std::cout << "Delivered directly to user " << to << " on gateway " << activeSessions[to] << "\\n";
        } else {
            std::cout << "User " << to << " offline. Sending mobile push notification...\\n";
        }

        return msg;
    }
};`
  }
};
