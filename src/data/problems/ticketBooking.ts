export const ticketBookingDetail = {
  problemStatement: `Design a High-Concurrency Ticket Booking System like Ticketmaster or BookMyShow. The system should manage ticket reservations for popular music concerts and movies where hundreds of thousands of users attempt to purchase a limited number of seats (e.g. 50,000) simultaneously. It must prevent double-booking, hold seats temporarily during checkout (e.g. 10 minutes), and scale gracefully during extreme traffic spikes.`,
  useCases: [
    "Users can view available events and see real-time seat maps.",
    "Select seats and lock them temporarily for 5-10 minutes while checking out.",
    "Process payment securely and issue a ticket upon successful transaction.",
    "Release locked seats back to the pool if the payment timer expires.",
    "Prevent double-booking: under no circumstances should the same seat be sold to two different users.",
    "Scale to handle massive bursts of concurrent users (e.g., ticket release times)."
  ],
  highLevelDesign: `### High Level System Architecture

1. **Virtual Waiting Room (Traffic Throttling)**:
   - During high-demand ticket drops, traffic exceeds capacity. A **Queue Service (using Redis Sorted Sets or Cloudflare Waiting Room)** places incoming users in a FIFO queue, releasing them slowly into the booking site.
2. **Booking & Reservation Service**:
   - Handles seat lookups and locks. To prevent double-booking under high concurrency, it acquires a **Distributed Lock (e.g., Redis via Redisson or ZooKeeper)** on the requested seat IDs.
   - Updates reservation status in a fast cache and database.
3. **Distributed Cache (Redis)**:
   - Holds active seat lock states (\`seat:123:locked -> true\` with a TTL of 10 minutes).
4. **Database (RDBMS - PostgreSQL / MySQL)**:
   - Crucial for ACID transactional guarantees. Booking transactions are wrapped in strict isolation levels (Serializable or Repeatable Read) to ensure exact inventory deductions.`,
  tradeoffs: [
    {
      component: "Concurrency Isolation Level",
      optionA: "Optimistic Locking (Version numbers in DB)",
      optionB: "Pessimistic Locking / Distributed Locks (Redis Redlock)",
      selected: "Pessimistic Locking / Distributed Locks (Redis Redlock)",
      reason: "Optimistic locking is great for low-contention scenarios. In ticket releases, thousands of requests hit the exact same seat at the exact same millisecond. Optimistic locking would fail almost all transactions, causing users to retry repeatedly, overloading the database. A pessimistic distributed lock in Redis blocks concurrent attempts instantly, allowing the first user to secure the seat and immediately rejecting others."
    },
    {
      component: "Seat Hold State Management",
      optionA: "Direct Database Rows with cron-based cleaner",
      optionB: "Redis Keys with TTL (Time-To-Live) expiration callbacks",
      selected: "Redis Keys with TTL (Time-To-Live) expiration callbacks",
      reason: "Creating database rows for every temporary seat hold and running a cron job every minute is database intensive. Using Redis with TTL allows us to keep holds in-memory. If the user doesn't complete the purchase in 10 minutes, Redis automatically deletes the lock key and triggers a keyspace notification to release the seat."
    },
    {
      component: "Database Choice",
      optionA: "NoSQL Database (MongoDB / Cassandra)",
      optionB: "Relational Database (PostgreSQL / MySQL with ACID)",
      selected: "Relational Database (PostgreSQL / MySQL with ACID)",
      reason: "NoSQL databases favor availability over consistency (eventual consistency). For ticketing, double-booking is a critical business failure. Relational databases support robust, multi-table transactions (updating Seat Status + creating Booking Record + deducting User Credit) with ACID guarantees."
    }
  ],
  lowLevelDesign: {
    entities: [
      {
        name: "Show (Database Table)",
        fields: [
          "show_id: UUID (Primary Key)",
          "event_name: VARCHAR",
          "start_time: TIMESTAMP",
          "venue: VARCHAR"
        ]
      },
      {
        name: "Seat (Database Table)",
        fields: [
          "seat_id: UUID (Primary Key)",
          "show_id: UUID (Foreign Key)",
          "seat_number: VARCHAR",
          "status: VARCHAR (AVAILABLE, LOCKED, SOLD)",
          "locked_until: TIMESTAMP (Nullable)"
        ]
      },
      {
        name: "Booking (Database Table)",
        fields: [
          "booking_id: UUID (Primary Key)",
          "user_id: UUID",
          "show_id: UUID",
          "seat_id: UUID",
          "status: VARCHAR (PENDING, PAID, EXPIRED)",
          "created_at: TIMESTAMP"
        ]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/booking/reserve",
        request: `{ "userId": "usr-55", "showId": "shw-12", "seatId": "set-99" }`,
        response: `{ "bookingId": "bkg-101", "status": "reserved", "holdExpiresAt": "2026-06-04T12:10:00Z" }`,
        description: "Attempts to temporarily lock a seat for checkout. Returns HTTP 409 if seat is locked or sold."
      },
      {
        method: "POST",
        path: "/api/v1/booking/confirm",
        request: `{ "bookingId": "bkg-101", "paymentToken": "tok_9912a" }`,
        response: `{ "ticketId": "tkt-882", "status": "confirmed" }`,
        description: "Processes payment and transitions seat status from LOCKED to SOLD."
      }
    ]
  },
  code: {
    typescript: `// TypeScript Seat Lock and Booking coordinator
export class TicketReservationManager {
  private seatLocks = new Map<string, { lockedBy: string; expiresAt: number }>();
  private soldSeats = new Set<string>();

  // Attempts to temporarily lock a seat
  public reserveSeat(seatId: string, userId: string, lockDurationMs = 10 * 60 * 1000): boolean {
    const now = Date.now();

    // 1. Check if already sold
    if (this.soldSeats.has(seatId)) {
      return false;
    }

    // 2. Check if currently locked
    const currentLock = this.seatLocks.get(seatId);
    if (currentLock && currentLock.expiresAt > now) {
      return false; // Active lock exists
    }

    // 3. Acquire lock
    this.seatLocks.set(seatId, {
      lockedBy: userId,
      expiresAt: now + lockDurationMs
    });
    return true;
  }

  // Finalizes booking upon successful payment
  public confirmBooking(seatId: string, userId: string): boolean {
    const now = Date.now();
    const currentLock = this.seatLocks.get(seatId);

    if (!currentLock) return false;
    if (currentLock.lockedBy !== userId || currentLock.expiresAt < now) {
      return false; // Lock expired or belongs to someone else
    }

    // Finalize purchase
    this.soldSeats.add(seatId);
    this.seatLocks.delete(seatId);
    return true;
  }

  public releaseExpiredLocks(): void {
    const now = Date.now();
    for (const [seatId, lock] of this.seatLocks.entries()) {
      if (lock.expiresAt < now) {
        this.seatLocks.delete(seatId);
      }
    }
  }
}`,
    python: `# Python Ticket Reservation Simulation
import time

class TicketManager:
    def __init__(self):
        self.locks = {}  # seat_id -> tuple(user_id, expires_at)
        self.sold_seats = set()

    def reserve_seat(self, seat_id: str, user_id: str, hold_seconds: int = 600) -> bool:
        now = time.time()
        
        # Check sold
        if seat_id in self.sold_seats:
            return False
            
        # Check lock
        if seat_id in self.locks:
            holder, expires_at = self.locks[seat_id]
            if expires_at > now:
                return False  # active lock held by another
                
        # Set lock
        self.locks[seat_id] = (user_id, now + hold_seconds)
        return True

    def confirm_booking(self, seat_id: str, user_id: str) -> bool:
        now = time.time()
        if seat_id not in self.locks:
            return False
            
        holder, expires_at = self.locks[seat_id]
        if holder != user_id or expires_at < now:
            return False  # Lock expired or unauthorized
            
        self.sold_seats.add(seat_id)
        del self.locks[seat_id]
        return True`,
    java: `// Java Transactional Reservation service
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class TicketReservationService {
    private static class SeatLock {
        String userId;
        long expiresAt;

        SeatLock(String userId, long expiresAt) {
            this.userId = userId;
            this.expiresAt = expiresAt;
        }
    }

    private final Map<String, SeatLock> seatLocks = new ConcurrentHashMap<>();
    private final Set<String> soldSeats = ConcurrentHashMap.newKeySet();

    public synchronized boolean reserveSeat(String seatId, String userId, long holdDurationMs) {
        long now = System.currentTimeMillis();

        if (soldSeats.contains(seatId)) {
            return false;
        }

        SeatLock activeLock = seatLocks.get(seatId);
        if (activeLock != null && activeLock.expiresAt > now) {
            return false; // active lock exists
        }

        // Place lock
        seatLocks.put(seatId, new SeatLock(userId, now + holdDurationMs));
        return true;
    }

    public synchronized boolean confirmBooking(String seatId, String userId) {
        long now = System.currentTimeMillis();
        SeatLock activeLock = seatLocks.get(seatId);

        if (activeLock == null) return false;
        if (!activeLock.userId.equals(userId) || activeLock.expiresAt < now) {
            return false; // Lock expired or stolen
        }

        soldSeats.add(seatId);
        seatLocks.remove(seatId);
        return true;
    }
}`,
    go: `// Go Ticket Booking coordinator
package main

import (
	"sync"
	"time"
)

type SeatLock struct {
	UserID    string
	ExpiresAt time.Time
}

type TicketCoordinator struct {
	mu        sync.Mutex
	locks     map[string]SeatLock
	soldSeats map[string]bool
}

func NewTicketCoordinator() *TicketCoordinator {
	return &TicketCoordinator{
		locks:     make(map[string]SeatLock),
		soldSeats: make(map[string]bool),
	}
}

func (tc *TicketCoordinator) ReserveSeat(seatID string, userID string, duration time.Duration) bool {
	tc.mu.Lock()
	defer tc.mu.Unlock()

	// Check if sold
	if tc.soldSeats[seatID] {
		return false
	}

	// Check if active lock
	if activeLock, locked := tc.locks[seatID]; locked {
		if activeLock.ExpiresAt.After(time.Now()) {
			return false
		}
	}

	// Apply lock
	tc.locks[seatID] = SeatLock{
		UserID:    userID,
		ExpiresAt: time.Now().Add(duration),
	}
	return true
}

func (tc *TicketCoordinator) ConfirmBooking(seatID string, userID string) bool {
	tc.mu.Lock()
	defer tc.mu.Unlock()

	activeLock, locked := tc.locks[seatID]
	if !locked {
		return false
	}

	if activeLock.UserID != userID || activeLock.ExpiresAt.Before(time.Now()) {
		return false
	}

	// Finalize sale
	tc.soldSeats[seatID] = true
	delete(tc.locks, seatID)
	return true
}`,
    cpp: `// C++ Thread-safe Ticket Reservation Manager
#include <iostream>
#include <unordered_map>
#include <unordered_set>
#include <string>
#include <mutex>
#include <chrono>

struct SeatLock {
    std::string userId;
    std::chrono::steady_clock::time_point expiresAt;
};

class TicketReservationManager {
private:
    std::unordered_map<std::string, SeatLock> locks;
    std::unordered_set<std::string> soldSeats;
    std::mutex mtx;

public:
    bool reserveSeat(const std::string& seatId, const std::string& userId, int holdSeconds = 600) {
        std::lock_guard<std::mutex> lock(mtx);
        auto now = std::chrono::steady_clock::now();

        // Check if sold
        if (soldSeats.find(seatId) != soldSeats.end()) {
            return false;
        }

        // Check locks
        auto it = locks.find(seatId);
        if (it != locks.end()) {
            if (it->second.expiresAt > now) {
                return false; // active lock exists
            }
        }

        // Lock
        locks[seatId] = SeatLock{userId, now + std::chrono::seconds(holdSeconds)};
        return true;
    }

    bool confirmBooking(const std::string& seatId, const std::string& userId) {
        std::lock_guard<std::mutex> lock(mtx);
        auto now = std::chrono::steady_clock::now();

        auto it = locks.find(seatId);
        if (it == locks.end()) return false;

        if (it->second.userId != userId || it->second.expiresAt < now) {
            return false;
        }

        soldSeats.insert(seatId);
        locks.erase(it);
        return true;
    }
};`
  }
};
