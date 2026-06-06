export const elevatorSystemDetail = {
  problemStatement: `Design an elevator dispatch system for a multi-elevator building. Elevators should use a SCAN-style algorithm with separate up/down queues (or stops) to serve requests in the current direction before reversing. A group dispatcher assigns floor requests to the optimal elevator using a nearest-compatible strategy.`,
  useCases: [
    "Accept floor requests from panels inside the elevator cars and hall panels outside.",
    "Dispatch requests dynamically to the optimal elevator matching current direction and distance.",
    "Move elevators floor-by-floor, stopping at requested floors to let passengers enter/exit.",
    "Implement the SCAN algorithm: process all requests in the current direction before reversing.",
    "Support multiple concurrent elevators working inside a single building fleet."
  ],
  highLevelDesign: `### High Level System Architecture

1. **Hall / Cabin Buttons**:
   - Hall panels request an elevator going UP or DOWN. Cabin panels request destinations.
2. **Elevator System Controller**:
   - Orchestrates the elevator fleet, passes scheduling steps, and interfaces with the Dispatcher.
3. **Dispatcher Engine (Nearest-Compatible Strategy)**:
   - Evaluates all elevators: position, current direction, and current queues.
   - Selects the best candidate based on:
     - Priority 1: An idle elevator already on the target floor.
     - Priority 2: An elevator moving toward the requested floor in the same direction.
     - Priority 3: The closest idle elevator on another floor.
4. **Elevator State Machine**:
   - Encapsulates directional sets (\`upStops\`, \`downStops\`) and processes movements using the SCAN logic.`,
  tradeoffs: [
    {
      component: "Elevator Scheduling Algorithm",
      optionA: "First-Come-First-Served (FCFS)",
      optionB: "SCAN (Elevator Algorithm) with directional queues",
      selected: "SCAN (Elevator Algorithm) with directional queues",
      reason: "FCFS causes the elevator to move randomly across floors, wasting energy and leading to high passenger wait times. SCAN serves requests in one direction sequentially before reversing, minimizing total travel distance and stabilizing wait times."
    },
    {
      component: "Dispatch Selection Strategy",
      optionA: "Round-Robin Assignment",
      optionB: "Nearest Compatible Elevator (Distance + Direction alignment)",
      selected: "Nearest Compatible Elevator (Distance + Direction alignment)",
      reason: "Nearest compatible assignment evaluates direction compatibility and floor distance to choose the most efficient elevator. Round-Robin is naive and results in poor coordination, with distant elevators being selected even when an idle elevator is already on the requested floor."
    }
  ],
  lowLevelDesign: {
    entities: [
      {
        name: "Direction (Enum)",
        fields: ["UP", "DOWN", "IDLE"]
      },
      {
        name: "Elevator",
        fields: ["id: number", "currentFloor: number", "direction: Direction", "upStops: Set<number>", "downStops: Set<number>"]
      },
      {
        name: "Dispatcher",
        fields: ["elevators: Elevator[]"]
      },
      {
        name: "ElevatorSystem",
        fields: ["elevators: Elevator[]", "dispatcher: Dispatcher"]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/elevator/request/external",
        request: `{ "floor": 5, "direction": "UP" }`,
        response: `{ "status": "SUCCESS", "assignedElevatorId": 2 }`,
        description: "Dispatches the optimal elevator to floor 5 for an up call."
      },
      {
        method: "POST",
        path: "/api/v1/elevator/request/internal",
        request: `{ "elevatorId": 2, "floor": 10 }`,
        response: `{ "status": "SUCCESS", "message": "Floor 10 added to stops queue" }`,
        description: "Registers a passenger destination button selection inside the elevator cab."
      },
      {
        method: "POST",
        path: "/api/v1/elevator/step",
        request: `{ "elevatorId": 2 }`,
        response: `{ "status": "SUCCESS", "currentFloor": 4, "direction": "UP", "isStopping": false }`,
        description: "Simulates a single clock step for an elevator (moves it up/down or opens/closes doors)."
      }
    ]
  },
  code: {
    typescript: `export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  IDLE = 'IDLE'
}

export class Elevator {
  public id: number;
  public currentFloor: number = 0;
  public direction: Direction = Direction.IDLE;
  private upStops: Set<number> = new Set();
  private downStops: Set<number> = new Set();

  constructor(id: number) {
    this.id = id;
  }

  public addRequest(floor: number): void {
    if (floor > this.currentFloor) {
      this.upStops.add(floor);
    } else if (floor < this.currentFloor) {
      this.downStops.add(floor);
    }
  }

  public step(): void {
    if (this.direction === Direction.UP || (this.direction === Direction.IDLE && this.upStops.size > 0)) {
      this.direction = Direction.UP;
      this.currentFloor++;
      if (this.upStops.has(this.currentFloor)) {
        this.upStops.delete(this.currentFloor);
      }
      if (this.upStops.size === 0) {
        this.direction = this.downStops.size > 0 ? Direction.DOWN : Direction.IDLE;
      }
    } else if (this.direction === Direction.DOWN || (this.direction === Direction.IDLE && this.downStops.size > 0)) {
      this.direction = Direction.DOWN;
      this.currentFloor--;
      if (this.downStops.has(this.currentFloor)) {
        this.downStops.delete(this.currentFloor);
      }
      if (this.downStops.size === 0) {
        this.direction = this.upStops.size > 0 ? Direction.UP : Direction.IDLE;
      }
    }
  }

  public isIdle(): boolean {
    return this.upStops.size === 0 && this.downStops.size === 0;
  }

  public getUpStops(): Set<number> {
    return this.upStops;
  }

  public getDownStops(): Set<number> {
    return this.downStops;
  }
}

export class Dispatcher {
  constructor(private elevators: Elevator[]) {}

  public dispatch(floor: number, direction: Direction): Elevator {
    let bestElevator: Elevator | null = null;
    let minDistance = Infinity;

    for (const elevator of this.elevators) {
      const distance = Math.abs(elevator.currentFloor - floor);
      
      const isCompatible = 
        elevator.direction === Direction.IDLE ||
        (direction === Direction.UP && elevator.direction === Direction.UP && elevator.currentFloor <= floor) ||
        (direction === Direction.DOWN && elevator.direction === Direction.DOWN && elevator.currentFloor >= floor);

      if (isCompatible && distance < minDistance) {
        minDistance = distance;
        bestElevator = elevator;
      }
    }

    if (!bestElevator) {
      for (const elevator of this.elevators) {
        const distance = Math.abs(elevator.currentFloor - floor);
        if (distance < minDistance) {
          minDistance = distance;
          bestElevator = elevator;
        }
      }
    }

    if (bestElevator) {
      bestElevator.addRequest(floor);
      return bestElevator;
    }

    throw new Error("No elevators available.");
  }
}

export class ElevatorSystem {
  private elevators: Elevator[] = [];
  private dispatcher: Dispatcher;

  constructor(numElevators: number) {
    for (let i = 0; i < numElevators; i++) {
      this.elevators.push(new Elevator(i + 1));
    }
    this.dispatcher = new Dispatcher(this.elevators);
  }

  public requestElevator(floor: number, direction: Direction): number {
    const elevator = this.dispatcher.dispatch(floor, direction);
    return elevator.id;
  }

  public step(): void {
    for (const elevator of this.elevators) {
      elevator.step();
    }
  }

  public getElevators(): Elevator[] {
    return this.elevators;
  }
}`,
    python: `from enum import Enum
from typing import List, Set

class Direction(Enum):
    UP = "UP"
    DOWN = "DOWN"
    IDLE = "IDLE"

class Elevator:
    def __init__(self, elevator_id: int):
        self.id = elevator_id
        self.current_floor = 0
        self.direction = Direction.IDLE
        self.up_stops: Set[int] = set()
        self.down_stops: Set[int] = set()

    def add_request(self, floor: int) -> None:
        if floor > self.current_floor:
            self.up_stops.add(floor)
        elif floor < self.current_floor:
            self.down_stops.add(floor)

    def step(self) -> None:
        if self.direction == Direction.UP or (self.direction == Direction.IDLE and self.up_stops):
            self.direction = Direction.UP
            self.current_floor += 1
            if self.current_floor in self.up_stops:
                self.up_stops.remove(self.current_floor)
            if not self.up_stops:
                self.direction = Direction.DOWN if self.down_stops else Direction.IDLE
        elif self.direction == Direction.DOWN or (self.direction == Direction.IDLE and self.down_stops):
            self.direction = Direction.DOWN
            self.current_floor -= 1
            if self.current_floor in self.down_stops:
                self.down_stops.remove(self.current_floor)
            if not self.down_stops:
                self.direction = Direction.UP if self.up_stops else Direction.IDLE

    def is_idle(self) -> bool:
        return not self.up_stops and not self.down_stops

class Dispatcher:
    def __init__(self, elevators: List[Elevator]):
        self.elevators = elevators

    def dispatch(self, floor: int, direction: Direction) -> Elevator:
        best_elevator = None
        min_distance = float('inf')

        for elevator in self.elevators:
            distance = abs(elevator.current_floor - floor)
            is_compatible = (
                elevator.direction == Direction.IDLE or
                (direction == Direction.UP and elevator.direction == Direction.UP and elevator.current_floor <= floor) or
                (direction == Direction.DOWN and elevator.direction == Direction.DOWN and elevator.current_floor >= floor)
            )
            if is_compatible and distance < min_distance:
                min_distance = distance
                best_elevator = elevator

        if not best_elevator:
            for elevator in self.elevators:
                distance = abs(elevator.current_floor - floor)
                if distance < min_distance:
                    min_distance = distance
                    best_elevator = elevator

        if best_elevator:
            best_elevator.add_request(floor)
            return best_elevator
        raise RuntimeError("No elevators found")`,
    java: `import java.util.*;

public enum Direction {
    UP, DOWN, IDLE
}

public class Elevator {
    private final int id;
    private int currentFloor = 0;
    private Direction direction = Direction.IDLE;
    private final Set<Integer> upStops = new HashSet<>();
    private final Set<Integer> downStops = new HashSet<>();

    public Elevator(int id) {
        this.id = id;
    }

    public int getId() { return id; }
    public int getCurrentFloor() { return currentFloor; }
    public Direction getDirection() { return direction; }

    public void addRequest(int floor) {
        if (floor > currentFloor) {
            upStops.add(floor);
        } else if (floor < currentFloor) {
            downStops.add(floor);
        }
    }

    public void step() {
        if (direction == Direction.UP || (direction == Direction.IDLE && !upStops.isEmpty())) {
            direction = Direction.UP;
            currentFloor++;
            upStops.remove(currentFloor);
            if (upStops.isEmpty()) {
                direction = !downStops.isEmpty() ? Direction.DOWN : Direction.IDLE;
            }
        } else if (direction == Direction.DOWN || (direction == Direction.IDLE && !downStops.isEmpty())) {
            direction = Direction.DOWN;
            currentFloor--;
            downStops.remove(currentFloor);
            if (downStops.isEmpty()) {
                direction = !upStops.isEmpty() ? Direction.UP : Direction.IDLE;
            }
        }
    }

    public boolean isIdle() {
        return upStops.isEmpty() && downStops.isEmpty();
    }
}

public class Dispatcher {
    private final List<Elevator> elevators;

    public Dispatcher(List<Elevator> elevators) {
        this.elevators = elevators;
    }

    public Elevator dispatch(int floor, Direction direction) {
        Elevator bestElevator = null;
        int minDistance = Integer.MAX_VALUE;

        for (Elevator elevator : elevators) {
            int distance = Math.abs(elevator.getCurrentFloor() - floor);
            boolean isCompatible = 
                elevator.getDirection() == Direction.IDLE ||
                (direction == Direction.UP && elevator.getDirection() == Direction.UP && elevator.getCurrentFloor() <= floor) ||
                (direction == Direction.DOWN && elevator.getDirection() == Direction.DOWN && elevator.getCurrentFloor() >= floor);

            if (isCompatible && distance < minDistance) {
                minDistance = distance;
                bestElevator = elevator;
            }
        }

        if (bestElevator == null) {
            for (Elevator elevator : elevators) {
                int distance = Math.abs(elevator.getCurrentFloor() - floor);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestElevator = elevator;
                }
            }
        }

        if (bestElevator != null) {
            bestElevator.addRequest(floor);
            return bestElevator;
        }

        throw new IllegalStateException("No elevators configured.");
    }
}`,
    go: `package main

import (
	"errors"
	"math"
)

type Direction string

const (
	UpDir   Direction = "UP"
	DownDir Direction = "DOWN"
	IdleDir Direction = "IDLE"
)

type Elevator struct {
	ID           int
	CurrentFloor int
	Direction    Direction
	UpStops      map[int]bool
	DownStops    map[int]bool
}

func NewElevator(id int) *Elevator {
	return &Elevator{
		ID:        id,
		Direction: IdleDir,
		UpStops:   make(map[int]bool),
		DownStops: make(map[int]bool),
	}
}

func (e *Elevator) AddRequest(floor int) {
	if floor > e.CurrentFloor {
		e.UpStops[floor] = true
	} else if floor < e.CurrentFloor {
		e.DownStops[floor] = true
	}
}

func (e *Elevator) Step() {
	if e.Direction == UpDir || (e.Direction == IdleDir && len(e.UpStops) > 0) {
		e.Direction = UpDir
		e.CurrentFloor++
		delete(e.UpStops, e.CurrentFloor)
		if len(e.UpStops) == 0 {
			if len(e.DownStops) > 0 {
				e.Direction = DownDir
			} else {
				e.Direction = IdleDir
			}
		}
	} else if e.Direction == DownDir || (e.Direction == IdleDir && len(e.DownStops) > 0) {
		e.Direction = DownDir
		e.CurrentFloor--
		delete(e.DownStops, e.CurrentFloor)
		if len(e.DownStops) == 0 {
			if len(e.UpStops) > 0 {
				e.Direction = UpDir
			} else {
				e.Direction = IdleDir
			}
		}
	}
}

type Dispatcher struct {
	elevators []*Elevator
}

func (d *Dispatcher) Dispatch(floor int, dir Direction) (*Elevator, error) {
	var bestElevator *Elevator
	minDistance := math.MaxInt32

	for _, e := range d.elevators {
		distance := int(math.Abs(float64(e.CurrentFloor - floor)))
		isCompatible := e.Direction == IdleDir ||
			(dir == UpDir && e.Direction == UpDir && e.CurrentFloor <= floor) ||
			(dir == DownDir && e.Direction == DownDir && e.CurrentFloor >= floor)

		if isCompatible && distance < minDistance {
			minDistance = distance
			bestElevator = e
		}
	}

	if bestElevator == nil {
		for _, e := range d.elevators {
			distance := int(math.Abs(float64(e.CurrentFloor - floor)))
			if distance < minDistance {
				minDistance = distance
				bestElevator = e
			}
		}
	}

	if bestElevator != nil {
		bestElevator.AddRequest(floor)
		return bestElevator, nil
	}

	return nil, errors.New("no elevators found")
}`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_set>
#include <cmath>
#include <stdexcept>
#include <limits>

enum class Direction {
    UP, DOWN, IDLE
};

class Elevator {
private:
    int id;
    int currentFloor = 0;
    Direction direction = Direction::IDLE;
    std::unordered_set<int> upStops;
    std::unordered_set<int> downStops;
public:
    Elevator(int elevatorId) : id(elevatorId) {}

    int getId() const { return id; }
    int getCurrentFloor() const { return currentFloor; }
    Direction getDirection() const { return direction; }

    void addRequest(int floor) {
        if (floor > currentFloor) {
            upStops.insert(floor);
        } else if (floor < currentFloor) {
            downStops.insert(floor);
        }
    }

    void step() {
        if (direction == Direction::UP || (direction == Direction::IDLE && !upStops.empty())) {
            direction = Direction::UP;
            currentFloor++;
            upStops.erase(currentFloor);
            if (upStops.empty()) {
                direction = !downStops.empty() ? Direction::DOWN : Direction::IDLE;
            }
        } else if (direction == Direction::DOWN || (direction == Direction::IDLE && !downStops.empty())) {
            direction = Direction::DOWN;
            currentFloor--;
            downStops.erase(currentFloor);
            if (downStops.empty()) {
                direction = !upStops.empty() ? Direction::UP : Direction::IDLE;
            }
        }
    }

    bool isIdle() const {
        return upStops.empty() && downStops.empty();
    }
};

class Dispatcher {
private:
    std::vector<Elevator*> elevators;
public:
    Dispatcher(const std::vector<Elevator*>& list) : elevators(list) {}

    Elevator* dispatch(int floor, Direction direction) {
        Elevator* bestElevator = nullptr;
        int minDistance = std::numeric_limits<int>::max();

        for (auto elevator : elevators) {
            int distance = std::abs(elevator->getCurrentFloor() - floor);
            bool isCompatible = 
                elevator->getDirection() == Direction::IDLE ||
                (direction == Direction::UP && elevator->getDirection() == Direction::UP && elevator->getCurrentFloor() <= floor) ||
                (direction == Direction::DOWN && elevator->getDirection() == Direction::DOWN && elevator->getCurrentFloor() >= floor);

            if (isCompatible && distance < minDistance) {
                minDistance = distance;
                bestElevator = elevator;
            }
        }

        if (bestElevator == nullptr) {
            for (auto elevator : elevators) {
                int distance = std::abs(elevator->getCurrentFloor() - floor);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestElevator = elevator;
                }
            }
        }

        if (bestElevator != nullptr) {
            bestElevator->addRequest(floor);
            return bestElevator;
        }

        throw std::runtime_error("No elevators configured.");
    }
};`
  }
};
