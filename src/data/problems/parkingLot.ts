export const parkingLotDetail = {
  problemStatement: `Design a multi-floor parking lot system that supports different vehicle types (Bikes, Cars, and Trucks). The system should assign the nearest available parking spot to a vehicle based on its type. It must support O(1) unparking by utilizing an in-memory license plate lookup, and represent the parking lot as a thread-safe Singleton.`,
  useCases: [
    "Park a vehicle in the nearest available matching spot on the lowest floor.",
    "Unpark a vehicle by license plate in O(1) time.",
    "Support multiple floors with mixed parking spot types (Bike, Car, Truck).",
    "Track real-time occupancy counts per floor and per vehicle type.",
    "Reject parking requests dynamically when no suitable spots are available."
  ],
  highLevelDesign: `### High Level System Architecture

1. **Client / Admin Console**:
   - Represents the terminal CLI, ticketing machine, or entry/exit gates.
2. **ParkingLot Facade (Singleton)**:
   - Global instance representing the entire physical garage. Holds the collections of floors and maintains the fast plate-to-spot lookup indexing.
3. **ParkingFloor Manager**:
   - Manages the individual floors. Organizes spots by vehicle types to assign spots with minimal traversal.
4. **ParkingSpot Unit**:
   - Represents a physical slot, tracking its availability status, floor number, designated vehicle type, and the reference to the parked vehicle.
5. **Vehicle Hierarchy**:
   - Domain classes modeling different vehicles (Bike, Car, Truck) with their corresponding license plates and size classes.`,
  tradeoffs: [
    {
      component: "Spot Allocation Strategy",
      optionA: "Floor-by-Floor Linear Search",
      optionB: "Pre-bucketed Free Lists (per Vehicle Type)",
      selected: "Pre-bucketed Free Lists (per Vehicle Type)",
      reason: "Sequential searching through all spots takes O(N) time where N is total spots. Grouping available spots by vehicle type using a Set or Queue on each floor reduces search time to O(F) where F is the number of floors, making allocation extremely fast."
    },
    {
      component: "Concurrency Mechanism",
      optionA: "Coarse-grained locking on ParkingLot",
      optionB: "Fine-grained locking per ParkingFloor",
      selected: "Fine-grained locking per ParkingFloor",
      reason: "Locking the entire parking lot blocks concurrent entries/exits across all floors. Fine-grained locks on individual floors allow multiple vehicles to enter and exit different floors simultaneously, scaling throughput in busy multi-gate garages."
    }
  ],
  lowLevelDesign: {
    entities: [
      {
        name: "VehicleKind (Enum)",
        fields: ["BIKE", "CAR", "TRUCK"]
      },
      {
        name: "Vehicle (Abstract Base)",
        fields: ["licensePlate: string", "kind: VehicleKind"]
      },
      {
        name: "ParkingSpot",
        fields: ["id: string", "floorNumber: number", "kind: VehicleKind", "occupant: Vehicle | null"]
      },
      {
        name: "ParkingFloor",
        fields: ["floorNumber: number", "spots: ParkingSpot[]"]
      },
      {
        name: "ParkingLot (Singleton)",
        fields: ["floors: ParkingFloor[]", "plateMap: Map<string, ParkingSpot>"]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/parking/park",
        request: `{ "licensePlate": "KA-01-AB-1234", "vehicleKind": "CAR" }`,
        response: `{ "status": "SUCCESS", "spotId": "F1-S12", "floor": 1 }`,
        description: "Finds the nearest available spot for the vehicle type, marks it as occupied, and registers the license plate."
      },
      {
        method: "POST",
        path: "/api/v1/parking/unpark",
        request: `{ "licensePlate": "KA-01-AB-1234" }`,
        response: `{ "status": "SUCCESS", "spotId": "F1-S12", "durationMinutes": 45, "fee": 15.00 }`,
        description: "Looks up the parked spot by license plate, frees it, deletes the plate indexing, and calculates the fee."
      }
    ]
  },
  code: {
    typescript: `export enum VehicleKind {
  BIKE = 'BIKE',
  CAR = 'CAR',
  TRUCK = 'TRUCK'
}

export abstract class Vehicle {
  constructor(public licensePlate: string, public kind: VehicleKind) {}
}

export class Bike extends Vehicle {
  constructor(licensePlate: string) {
    super(licensePlate, VehicleKind.BIKE);
  }
}

export class Car extends Vehicle {
  constructor(licensePlate: string) {
    super(licensePlate, VehicleKind.CAR);
  }
}

export class Truck extends Vehicle {
  constructor(licensePlate: string) {
    super(licensePlate, VehicleKind.TRUCK);
  }
}

export class ParkingSpot {
  private occupant: Vehicle | null = null;

  constructor(
    public id: string,
    public floorNumber: number,
    public kind: VehicleKind
  ) {}

  public isAvailable(): boolean {
    return this.occupant === null;
  }

  public park(vehicle: Vehicle): void {
    if (vehicle.kind !== this.kind) {
      throw new Error(\`Cannot park \${vehicle.kind} in a \${this.kind} spot.\`);
    }
    this.occupant = vehicle;
  }

  public unpark(): void {
    this.occupant = null;
  }

  public getOccupant(): Vehicle | null {
    return this.occupant;
  }
}

export class ParkingFloor {
  private spots: ParkingSpot[] = [];

  constructor(public floorNumber: number) {}

  public addSpot(spot: ParkingSpot): void {
    this.spots.push(spot);
  }

  public getAvailableSpot(kind: VehicleKind): ParkingSpot | null {
    for (const spot of this.spots) {
      if (spot.kind === kind && spot.isAvailable()) {
        return spot;
      }
    }
    return null;
  }
}

export class ParkingLot {
  private static instance: ParkingLot | null = null;
  private floors: ParkingFloor[] = [];
  private plateMap: Map<string, ParkingSpot> = new Map();

  private constructor() {}

  public static getInstance(): ParkingLot {
    if (!ParkingLot.instance) {
      ParkingLot.instance = new ParkingLot();
    }
    return ParkingLot.instance;
  }

  public addFloor(floor: ParkingFloor): void {
    this.floors.push(floor);
  }

  public park(vehicle: Vehicle): ParkingSpot {
    if (this.plateMap.has(vehicle.licensePlate)) {
      throw new Error(\`Vehicle \${vehicle.licensePlate} is already parked.\`);
    }
    for (const floor of this.floors) {
      const spot = floor.getAvailableSpot(vehicle.kind);
      if (spot) {
        spot.park(vehicle);
        this.plateMap.set(vehicle.licensePlate, spot);
        return spot;
      }
    }
    throw new Error(\`No available spots of type \${vehicle.kind}\`);
  }

  public unpark(licensePlate: string): ParkingSpot {
    const spot = this.plateMap.get(licensePlate);
    if (!spot) {
      throw new Error(\`Vehicle \${licensePlate} not found in the parking lot.\`);
    }
    spot.unpark();
    this.plateMap.delete(licensePlate);
    return spot;
  }
}`,
    python: `from enum import Enum
from typing import Dict, List, Optional

class VehicleKind(Enum):
    BIKE = "BIKE"
    CAR = "CAR"
    TRUCK = "TRUCK"

class Vehicle:
    def __init__(self, license_plate: str, kind: VehicleKind):
        self.license_plate = license_plate
        self.kind = kind

class Bike(Vehicle):
    def __init__(self, license_plate: str):
        super().__init__(license_plate, VehicleKind.BIKE)

class Car(Vehicle):
    def __init__(self, license_plate: str):
        super().__init__(license_plate, VehicleKind.CAR)

class Truck(Vehicle):
    def __init__(self, license_plate: str):
        super().__init__(license_plate, VehicleKind.TRUCK)

class ParkingSpot:
    def __init__(self, spot_id: str, floor_number: int, kind: VehicleKind):
        self.id = spot_id
        self.floor_number = floor_number
        self.kind = kind
        self.occupant: Optional[Vehicle] = None

    def is_available(self) -> bool:
        return self.occupant is None

    def park(self, vehicle: Vehicle) -> None:
        if vehicle.kind != self.kind:
            raise ValueError("Vehicle kind mismatch for this parking spot")
        self.occupant = vehicle

    def unpark(self) -> None:
        self.occupant = None

class ParkingFloor:
    def __init__(self, floor_number: int):
        self.floor_number = floor_number
        self.spots: List[ParkingSpot] = []

    def add_spot(self, spot: ParkingSpot) -> None:
        self.spots.append(spot)

    def get_available_spot(self, kind: VehicleKind) -> Optional[ParkingSpot]:
        for spot in self.spots:
            if spot.kind == kind and spot.is_available():
                return spot
        return None

class ParkingLot:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        if ParkingLot._instance is not None:
            raise Exception("This class is a singleton! Use get_instance().")
        self.floors: List[ParkingFloor] = []
        self.plate_map: Dict[str, ParkingSpot] = {}

    def add_floor(self, floor: ParkingFloor) -> None:
        self.floors.append(floor)

    def park(self, vehicle: Vehicle) -> ParkingSpot:
        if vehicle.license_plate in self.plate_map:
            raise ValueError("Vehicle is already parked")
        for floor in self.floors:
            spot = floor.get_available_spot(vehicle.kind)
            if spot:
                spot.park(vehicle)
                self.plate_map[vehicle.license_plate] = spot
                return spot
        raise ValueError(f"No available spots for vehicle kind {vehicle.kind.value}")

    def unpark(self, license_plate: str) -> ParkingSpot:
        spot = self.plate_map.get(license_plate)
        if not spot:
            raise ValueError("Vehicle not found in the parking lot")
        spot.unpark()
        del self.plate_map[license_plate]
        return spot`,
    java: `import java.util.*;

public enum VehicleKind {
    BIKE, CAR, TRUCK
}

public abstract class Vehicle {
    private final String licensePlate;
    private final VehicleKind kind;

    protected Vehicle(String licensePlate, VehicleKind kind) {
        this.licensePlate = licensePlate;
        this.kind = kind;
    }

    public String getLicensePlate() { return licensePlate; }
    public VehicleKind getKind() { return kind; }
}

public class Bike extends Vehicle {
    public Bike(String licensePlate) {
        super(licensePlate, VehicleKind.BIKE);
    }
}

public class Car extends Vehicle {
    public Car(String licensePlate) {
        super(licensePlate, VehicleKind.CAR);
    }
}

public class Truck extends Vehicle {
    public Truck(String licensePlate) {
        super(licensePlate, VehicleKind.TRUCK);
    }
}

public class ParkingSpot {
    private final String id;
    private final int floorNumber;
    private final VehicleKind kind;
    private Vehicle occupant = null;

    public ParkingSpot(String id, int floorNumber, VehicleKind kind) {
        this.id = id;
        this.floorNumber = floorNumber;
        this.kind = kind;
    }

    public String getId() { return id; }
    public int getFloorNumber() { return floorNumber; }
    public VehicleKind getKind() { return kind; }
    public boolean isAvailable() { return occupant == null; }

    public void park(Vehicle vehicle) {
        if (vehicle.getKind() != this.kind) {
            throw new IllegalArgumentException("Vehicle kind mismatch for spot");
        }
        this.occupant = vehicle;
    }

    public void unpark() { this.occupant = null; }
    public Vehicle getOccupant() { return occupant; }
}

public class ParkingFloor {
    private final int floorNumber;
    private final List<ParkingSpot> spots = new ArrayList<>();

    public ParkingFloor(int floorNumber) {
        this.floorNumber = floorNumber;
    }

    public int getFloorNumber() { return floorNumber; }
    public void addSpot(ParkingSpot spot) { spots.add(spot); }

    public ParkingSpot getAvailableSpot(VehicleKind kind) {
        for (ParkingSpot spot : spots) {
            if (spot.getKind() == kind && spot.isAvailable()) {
                return spot;
            }
        }
        return null;
    }
}

public class ParkingLot {
    private static ParkingLot instance = null;
    private final List<ParkingFloor> floors = new ArrayList<>();
    private final Map<String, ParkingSpot> plateMap = new HashMap<>();

    private ParkingLot() {}

    public static synchronized ParkingLot getInstance() {
        if (instance == null) {
            instance = new ParkingLot();
        }
        return instance;
    }

    public void addFloor(ParkingFloor floor) { floors.add(floor); }

    public synchronized ParkingSpot park(Vehicle vehicle) {
        if (plateMap.containsKey(vehicle.getLicensePlate())) {
            throw new IllegalArgumentException("Vehicle already parked");
        }
        for (ParkingFloor floor : floors) {
            ParkingSpot spot = floor.getAvailableSpot(vehicle.getKind());
            if (spot != null) {
                spot.park(vehicle);
                plateMap.put(vehicle.getLicensePlate(), spot);
                return spot;
            }
        }
        throw new IllegalStateException("No available spots for vehicle kind: " + vehicle.getKind());
    }

    public synchronized ParkingSpot unpark(String licensePlate) {
        ParkingSpot spot = plateMap.get(licensePlate);
        if (spot == null) {
            throw new IllegalArgumentException("Vehicle with plate " + licensePlate + " not found");
        }
        spot.unpark();
        plateMap.remove(licensePlate);
        return spot;
    }
}`,
    go: `package main

import (
	"errors"
	"sync"
)

type VehicleKind string

const (
	BikeKind  VehicleKind = "BIKE"
	CarKind   VehicleKind = "CAR"
	TruckKind VehicleKind = "TRUCK"
)

type Vehicle struct {
	LicensePlate string
	Kind         VehicleKind
}

type ParkingSpot struct {
	ID          string
	FloorNumber int
	Kind        VehicleKind
	Occupant    *Vehicle
}

func (s *ParkingSpot) IsAvailable() bool {
	return s.Occupant == nil
}

func (s *ParkingSpot) Park(v *Vehicle) error {
	if v.Kind != s.Kind {
		return errors.New("vehicle kind mismatch")
	}
	s.Occupant = v
	return nil
}

func (s *ParkingSpot) Unpark() {
	s.Occupant = nil
}

type ParkingFloor struct {
	FloorNumber int
	Spots       []*ParkingSpot
}

func (f *ParkingFloor) GetAvailableSpot(kind VehicleKind) *ParkingSpot {
	for _, spot := range f.Spots {
		if spot.Kind == kind && spot.IsAvailable() {
			return spot
		}
	}
	return nil
}

type ParkingLot struct {
	floors   []*ParkingFloor
	plateMap map[string]*ParkingSpot
	mu       sync.Mutex
}

var instance *ParkingLot
var once sync.Once

func GetParkingLotInstance() *ParkingLot {
	once.Do(func() {
		instance = &ParkingLot{
			plateMap: make(map[string]*ParkingSpot),
		}
	})
	return instance
}

func (l *ParkingLot) AddFloor(f *ParkingFloor) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.floors = append(l.floors, f)
}

func (l *ParkingLot) Park(v *Vehicle) (*ParkingSpot, error) {
	l.mu.Lock()
	defer l.mu.Unlock()

	if _, exists := l.plateMap[v.LicensePlate]; exists {
		return nil, errors.New("vehicle already parked")
	}

	for _, floor := range l.floors {
		spot := floor.GetAvailableSpot(v.Kind)
		if spot != nil {
			if err := spot.Park(v); err != nil {
				return nil, err
			}
			l.plateMap[v.LicensePlate] = spot
			return spot, nil
		}
	}
	return nil, errors.New("no available spots")
}

func (l *ParkingLot) Unpark(plate string) (*ParkingSpot, error) {
	l.mu.Lock()
	defer l.mu.Unlock()

	spot, exists := l.plateMap[plate]
	if !exists {
		return nil, errors.New("vehicle not found")
	}
	spot.Unpark()
	delete(l.plateMap, plate)
	return spot, nil
}`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <mutex>
#include <stdexcept>

enum class VehicleKind {
    BIKE, CAR, TRUCK
};

class Vehicle {
private:
    std::string licensePlate;
    VehicleKind kind;
public:
    Vehicle(std::string plate, VehicleKind k) : licensePlate(plate), kind(k) {}
    std::string getLicensePlate() const { return licensePlate; }
    VehicleKind getKind() const { return kind; }
};

class ParkingSpot {
private:
    std::string id;
    int floorNumber;
    VehicleKind kind;
    Vehicle* occupant = nullptr;
public:
    ParkingSpot(std::string spotId, int floor, VehicleKind k) 
        : id(spotId), floorNumber(floor), kind(k) {}
    
    std::string getId() const { return id; }
    VehicleKind getKind() const { return kind; }
    bool isAvailable() const { return occupant == nullptr; }

    void park(Vehicle* vehicle) {
        if (vehicle->getKind() != kind) {
            throw std::invalid_argument("Vehicle kind mismatch");
        }
        occupant = vehicle;
    }

    void unpark() { occupant = nullptr; }
    Vehicle* getOccupant() const { return occupant; }
};

class ParkingFloor {
private:
    int floorNumber;
    std::vector<ParkingSpot*> spots;
public:
    ParkingFloor(int floor) : floorNumber(floor) {}
    ~ParkingFloor() {
        for (auto s : spots) delete s;
    }
    void addSpot(ParkingSpot* spot) { spots.push_back(spot); }
    
    ParkingSpot* getAvailableSpot(VehicleKind kind) {
        for (auto spot : spots) {
            if (spot->getKind() == kind && spot->isAvailable()) {
                return spot;
            }
        }
        return nullptr;
    }
};

class ParkingLot {
private:
    static ParkingLot* instance;
    static std::mutex mtx;
    std::vector<ParkingFloor*> floors;
    std::unordered_map<std::string, ParkingSpot*> plateMap;

    ParkingLot() {}
public:
    static ParkingLot* getInstance() {
        std::lock_guard<std::mutex> lock(mtx);
        if (instance == nullptr) {
            instance = new ParkingLot();
        }
        return instance;
    }

    void addFloor(ParkingFloor* floor) { floors.push_back(floor); }

    ParkingSpot* park(Vehicle* vehicle) {
        std::lock_guard<std::mutex> lock(mtx);
        if (plateMap.find(vehicle->getLicensePlate()) != plateMap.end()) {
            throw std::invalid_argument("Vehicle already parked");
        }
        for (auto floor : floors) {
            ParkingSpot* spot = floor->getAvailableSpot(vehicle->getKind());
            if (spot != nullptr) {
                spot->park(vehicle);
                plateMap[vehicle->getLicensePlate()] = spot;
                return spot;
            }
        }
        throw std::runtime_error("No available spots");
    }

    ParkingSpot* unpark(const std::string& licensePlate) {
        std::lock_guard<std::mutex> lock(mtx);
        auto it = plateMap.find(licensePlate);
        if (it == plateMap.end()) {
            throw std::invalid_argument("Vehicle not found");
        }
        ParkingSpot* spot = it->second;
        spot->unpark();
        plateMap.erase(it);
        return spot;
    }
};

// Static initializers (would go in a source file, but inline here for simplicity)
// ParkingLot* ParkingLot::instance = nullptr;
// std::mutex ParkingLot::mtx;`
  }
};
