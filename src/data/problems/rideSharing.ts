export const rideSharingDetail = {
  problemStatement: `Design a Ride-Sharing Platform like Uber or Lyft. The platform must connect riders looking for trips with nearby active drivers, track driver locations in real-time, compute dynamic fare prices, and handle trip lifecycles (Request -> Match -> Trip in progress -> Complete).`,
  useCases: [
    "Riders can request a trip by specifying pick-up and drop-off coordinates.",
    "Drivers report their location in real-time (every 4-5 seconds) when active.",
    "The system matches a rider with the closest available driver in less than 5 seconds.",
    "Determine trip fares dynamically based on demand, supply, weather, and distance.",
    "Highly available, handle scale (millions of concurrent active drivers/riders globally), and support real-time map updates."
  ],
  highLevelDesign: `### High Level System Architecture

1. **Driver Location Service (Write Intensive)**:
   - Active drivers send lat/long updates via WebSocket/HTTP to the **Driver Location Ingestion Gateway**.
   - These updates are pushed to a fast, geospatial storage engine (**Redis Geospatial index** using geohash / H3 cell mapping) to keep track of active driver states.
2. **Trip Management Service (Dispatch/Match)**:
   - When a rider clicks 'Request Ride', the **Trip Service** creates a trip record and queries the **Geospatial Index Service** for drivers within a specific radius (e.g., 2km).
   - It computes the route using the **Routing Engine** (e.g., OSRM) and requests a dynamic pricing multiplier from the **Surge Engine**.
   - It locks the driver, sends a WebSocket message to the driver's device offering the trip, and handles their response.
3. **Database (PostgreSQL with PostGIS / Cassandra)**:
   - PostgreSQL (relational) stores trip records, payment details, and user profiles. Cassandra/TimescaleDB stores historical telemetry/location trails.`,
  tradeoffs: [
    {
      component: "Geospatial Indexing System",
      optionA: "Google S2 Geometry (Square Grid Cells)",
      optionB: "Uber H3 Spatial Index (Hexagonal Grid Cells)",
      selected: "Uber H3 Spatial Index (Hexagonal Grid Cells)",
      reason: "H3 uses hexagons. In a hexagon, the distance from the center to all 6 neighbors is exactly the same, making radius searches and expansion algorithms highly accurate and uniform. In S2 (squares), the distance to diagonal neighbors is longer than orthogonal neighbors, creating distortion during radial searches."
    },
    {
      component: "Driver Search Mode",
      optionA: "Push Match (System assigns best driver and asks them to accept/decline)",
      optionB: "Pull Match (Open marketplace where all nearby drivers see a board and grab trips)",
      selected: "Push Match (System assigns best driver and asks them to accept/decline)",
      reason: "A pull marketplace creates bidding wars, high app latency, and double-booking race conditions. A centralized Push Match algorithm allows the system to optimize for global trip efficiency (reducing overall driver wait times and rider pickup delays) by querying the single best driver first and cascading if they decline."
    },
    {
      component: "Real-time Location Storage",
      optionA: "Disk-backed Database (Postgres with PostGIS) on every update",
      optionB: "In-memory cache (Redis Geo) + Asynchronous batch persistence",
      selected: "In-memory cache (Redis Geo) + Asynchronous batch persistence",
      reason: "Active drivers sending coordinates every 4 seconds creates millions of writes. Directing this directly to a relational disk-based database will lock tables and crash the database. Redis Geo uses Skip Lists in memory, completing geospatial lookup/update operations in O(log(N)) time. Raw tracks are periodically batched and written to Cassandra offline."
    }
  ],
  lowLevelDesign: {
    entities: [
      {
        name: "Trip (Database Table)",
        fields: [
          "trip_id: UUID (Primary Key)",
          "rider_id: UUID",
          "driver_id: UUID (Nullable until matched)",
          "status: VARCHAR (REQUESTED, MATCHED, IN_PROGRESS, COMPLETED, CANCELLED)",
          "pickup_lat: DOUBLE, pickup_long: DOUBLE",
          "drop_lat: DOUBLE, drop_long: DOUBLE",
          "fare: DECIMAL",
          "created_at: TIMESTAMP"
        ]
      },
      {
        name: "DriverState (Redis Schema)",
        fields: [
          "Key: driver:locations (GeoSet)",
          "Member: {driverId}",
          "Value: latitude, longitude",
          "Key: driver:status:{driverId} (String - AVAILABLE, BUSY, OFFLINE)"
        ]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/trip/request",
        request: `{ "riderId": "usr-123", "pickup": [37.7749, -122.4194], "dropoff": [37.7891, -122.4014] }`,
        response: `{ "tripId": "trp-889", "status": "searching", "estimatedFare": 15.50 }`,
        description: "Initiates a new ride request and triggers matching pipeline."
      },
      {
        method: "POST",
        path: "/api/v1/driver/location",
        request: `{ "driverId": "drv-999", "latitude": 37.7750, "longitude": -122.4190, "status": "AVAILABLE" }`,
        response: `{ "status": "ok" }`,
        description: "Updates active driver's current position inside the geospatial engine."
      }
    ]
  },
  code: {
    typescript: `// TypeScript Ride Matcher
interface Coordinate {
  lat: number;
  lng: number;
}

interface Driver {
  id: string;
  location: Coordinate;
  status: 'AVAILABLE' | 'BUSY';
}

export class DispatchService {
  private drivers = new Map<string, Driver>();

  public updateDriverLocation(id: string, lat: number, lng: number, status: 'AVAILABLE' | 'BUSY') {
    this.drivers.set(id, { id, location: { lat, lng }, status });
  }

  // Haversine distance calculator
  private getDistance(c1: Coordinate, c2: Coordinate): number {
    const R = 6371; // Earth radius in km
    const dLat = (c2.lat - c1.lat) * Math.PI / 180;
    const dLng = (c2.lng - c1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  public findClosestDriver(riderLocation: Coordinate): Driver | null {
    let closestDriver: Driver | null = null;
    let minDistance = Infinity;

    for (const [_, driver] of this.drivers) {
      if (driver.status !== 'AVAILABLE') continue;

      const dist = this.getDistance(riderLocation, driver.location);
      if (dist < minDistance) {
        minDistance = dist;
        closestDriver = driver;
      }
    }

    // Only match drivers within a 5km limit
    return minDistance <= 5.0 ? closestDriver : null;
  }
}`,
    python: `# Python Ride Matcher Simulation
import math

class DispatchService:
    def __init__(self):
        self.drivers = {}  # driver_id -> dict(lat, lng, status)

    def update_driver_location(self, driver_id: str, lat: float, lng: float, status: str):
        self.drivers[driver_id] = {
            'lat': lat,
            'lng': lng,
            'status': status
        }

    def _haversine_distance(self, lat1, lng1, lat2, lng2) -> float:
        R = 6371.0 # Earth radius in km
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lng2 - lng1)

        a = math.sin(delta_phi / 2.0) ** 2 + \\
            math.cos(phi1) * math.cos(phi2) * \\
            math.sin(delta_lambda / 2.0) ** 2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R * c

    def find_nearest_driver(self, rider_lat: float, rider_lng: float) -> str:
        closest_driver = None
        min_dist = float('inf')

        for driver_id, data in self.drivers.items():
            if data['status'] != 'AVAILABLE':
                continue
            
            dist = self._haversine_distance(rider_lat, rider_lng, data['lat'], data['lng'])
            if dist < min_dist:
                min_dist = dist
                closest_driver = driver_id
                
        # Limit pickup distance to 5.0 km
        return closest_driver if min_dist <= 5.0 else None`,
    java: `// Java Dispatch Service Implementation
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class DispatchService {
    public static class Location {
        public double lat;
        public double lng;

        public Location(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }
    }

    public static class Driver {
        public String id;
        public Location location;
        public String status; // "AVAILABLE" or "BUSY"

        public Driver(String id, Location location, String status) {
            this.id = id;
            this.location = location;
            this.status = status;
        }
    }

    private final Map<String, Driver> drivers = new ConcurrentHashMap<>();

    public void updateDriver(String id, double lat, double lng, String status) {
        drivers.put(id, new Driver(id, new Location(lat, lng), status));
    }

    private double calculateDistance(Location l1, Location l2) {
        double R = 6371; // Earth radius in km
        double dLat = Math.toRadians(l2.lat - l1.lat);
        double dLng = Math.toRadians(l2.lng - l1.lng);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(l1.lat)) * Math.cos(Math.toRadians(l2.lat)) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public Driver findClosestAvailableDriver(double riderLat, double riderLng) {
        Location riderLoc = new Location(riderLat, riderLng);
        Driver matchedDriver = null;
        double minDistance = Double.MAX_VALUE;

        for (Driver driver : drivers.values()) {
            if (!"AVAILABLE".equals(driver.status)) continue;

            double dist = calculateDistance(riderLoc, driver.location);
            if (dist < minDistance) {
                minDistance = dist;
                matchedDriver = driver;
            }
        }
        return minDistance <= 5.0 ? matchedDriver : null;
    }
}`,
    go: `// Go Ride Sharing Dispatch algorithm
package main

import (
	"math"
	"sync"
)

type Location struct {
	Lat float64
	Lng float64
}

type Driver struct {
	ID       string
	Loc      Location
	Status   string // "AVAILABLE" or "BUSY"
}

type Dispatcher struct {
	mu      sync.RWMutex
	drivers map[string]*Driver
}

func NewDispatcher() *Dispatcher {
	return &Dispatcher{
		drivers: make(map[string]*Driver),
	}
}

func (d *Dispatcher) UpdateDriver(id string, lat float64, lng float64, status string) {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.drivers[id] = &Driver{
		ID:     id,
		Loc:    Location{Lat: lat, Lng: lng},
		Status: status,
	}
}

func haversine(l1, l2 Location) float64 {
	const R = 6371.0 // earth radius in km
	dLat := (l2.Lat - l1.Lat) * math.Pi / 180.0
	dLng := (l2.Lng - l1.Lng) * math.Pi / 180.0
	
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(l1.Lat*math.Pi/180.0)*math.Cos(l2.Lat*math.Pi/180.0)*
			math.Sin(dLng/2)*math.Sin(dLng/2)
	c := 2.0 * math.Atan2(math.sqrt(a), math.sqrt(1.0-a))
	return R * c
}

func (d *Dispatcher) FindClosestDriver(riderLat, riderLng float64) (*Driver, float64) {
	d.mu.RLock()
	defer d.mu.RUnlock()

	riderLoc := Location{Lat: riderLat, Lng: riderLng}
	var closestDriver *Driver
	minDist := math.MaxFloat64

	for _, driver := range d.drivers {
		if driver.Status != "AVAILABLE" {
			continue
		}
		dist := haversine(riderLoc, driver.Loc)
		if dist < minDist {
			minDist = dist
			closestDriver = driver
		}
	}

	if minDist <= 5.0 {
		return closestDriver, minDist
	}
	return nil, -1
}`,
    cpp: `// C++ Geospatial Dispatcher mockup
#include <iostream>
#include <unordered_map>
#include <cmath>
#include <limits>
#include <string>
#include <shared_mutex>

struct Location {
    double lat;
    double lng;
};

struct Driver {
    std::string id;
    Location loc;
    std::string status; // "AVAILABLE" or "BUSY"
};

class Dispatcher {
private:
    std::unordered_map<std::string, Driver> drivers;
    std::shared_mutex rwMtx;

    double haversineDistance(Location l1, Location l2) {
        const double R = 6371.0; // Earth radius in km
        double dLat = (l2.lat - l1.lat) * M_PI / 180.0;
        double dLng = (l2.lng - l1.lng) * M_PI / 180.0;

        double a = std::sin(dLat / 2.0) * std::sin(dLat / 2.0) +
                   std::cos(l1.lat * M_PI / 180.0) * std::cos(l2.lat * M_PI / 180.0) *
                   std::sin(dLng / 2.0) * std::sin(dLng / 2.0);
        double c = 2.0 * std::atan2(std::sqrt(a), std::sqrt(1.0 - a));
        return R * c;
    }

public:
    void updateDriverLocation(const std::string& id, double lat, double lng, const std::string& status) {
        std::unique_lock lock(rwMtx);
        drivers[id] = Driver{id, Location{lat, lng}, status};
    }

    std::string matchDriver(double riderLat, double riderLng) {
        std::shared_lock lock(rwMtx);
        Location riderLoc{riderLat, riderLng};
        std::string matchedId = "";
        double minDist = std::numeric_limits<double>::max();

        for (const auto& [id, driver] : drivers) {
            if (driver.status != "AVAILABLE") continue;

            double dist = haversineDistance(riderLoc, driver.loc);
            if (dist < minDist) {
                minDist = dist;
                matchedId = id;
            }
        }
        return (minDist <= 5.0) ? matchedId : "";
    }
};`
  }
};
