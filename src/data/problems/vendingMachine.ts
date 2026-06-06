export const vendingMachineDetail = {
  problemStatement: `Design a vending machine system using the State pattern. The machine transitions through Idle, ItemSelected, HasMoney, and Dispensing states. It manages an inventory of products, accepts payments in standard coin denominations, computes change, and returns refunds upon cancellation.`,
  useCases: [
    "Display available products along with their prices and stock count.",
    "Select a product from the inventory and validate its availability.",
    "Insert coins of various denominations to accumulate the balance.",
    "Dispense the selected product and return precise change when payment is sufficient.",
    "Cancel a transaction at any point, returning a full refund of all inserted coins."
  ],
  highLevelDesign: `### High Level System Architecture

1. **Client Interface / Vending Machine UI**:
   - Accepts button presses for product selection, coin inputs, and cancel requests.
2. **VendingMachine (Singleton Context)**:
   - Maintains the current active state, the inventory tracking instance, the currently selected product, and the running balance.
3. **State Engine Interface**:
   - Represents the various behavior rules depending on current operations:
     - **IdleState**: Waiting for selection. Coins are rejected.
     - **ItemSelectedState**: Product picked. Waiting for coins.
     - **HasMoneyState**: Checking total inserted amount against product price.
     - **DispensingState**: Decrementing inventory, issuing change, and returning to IdleState.
4. **Inventory Subsystem**:
   - A storage mapping tracking product details (name, price, quantity).`,
  tradeoffs: [
    {
      component: "State Transition Control",
      optionA: "State classes trigger context transitions",
      optionB: "VendingMachine context handles state transitions",
      selected: "State classes trigger context transitions",
      reason: "Allowing state objects to transition the context keeps the main VendingMachine controller decoupled from state-specific rule chains. Introducing new states (e.g. Maintenance or OutOfService) requires adding a class rather than modifying multiple context functions."
    },
    {
      component: "Payment Extensibility",
      optionA: "Direct addition of coin values in simple variables",
      optionB: "Strategy Pattern for Payment Handling",
      selected: "Strategy Pattern for Payment Handling",
      reason: "While simple addition is sufficient for basic coin counts, utilizing a PaymentStrategy (CashPayment, CardPayment, NFCPage) decouples the machine states from the payment method itself, making it easy to upgrade to card readers or mobile pay without rebuilding state machines."
    }
  ],
  lowLevelDesign: {
    entities: [
      {
        name: "State (Enum)",
        fields: ["IDLE", "SELECTED", "HAS_MONEY", "DISPENSING"]
      },
      {
        name: "Product (Data Model)",
        fields: ["name: string", "price: number", "qty: number"]
      },
      {
        name: "VendingMachine (Singleton)",
        fields: ["state: State", "inventory: Map<string, Product>", "selected: Product | null", "balance: number"]
      }
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/vending/select",
        request: `{ "productName": "Pepsi" }`,
        response: `{ "status": "SUCCESS", "nextState": "SELECTED", "price": 1.50 }`,
        description: "Checks inventory availability, sets selectedProduct, and transitions from IDLE to SELECTED."
      },
      {
        method: "POST",
        path: "/api/v1/vending/insert-coin",
        request: `{ "amount": 0.25 }`,
        response: `{ "status": "SUCCESS", "currentBalance": 1.25, "nextState": "HAS_MONEY" }`,
        description: "Adds cash to the balance counter, transitioning the machine state to HAS_MONEY."
      },
      {
        method: "POST",
        path: "/api/v1/vending/dispense",
        request: `{}`,
        response: `{ "status": "SUCCESS", "product": "Pepsi", "change": 0.25 }`,
        description: "Dispenses the product, deducts inventory, resets balance to 0, and returns to IDLE state."
      },
      {
        method: "POST",
        path: "/api/v1/vending/cancel",
        request: `{}`,
        response: `{ "status": "SUCCESS", "refund": 1.25 }`,
        description: "Issues a full refund of any inserted balance and resets the machine back to IDLE."
      }
    ]
  },
  code: {
    typescript: `export enum State {
  IDLE = 'IDLE',
  SELECTED = 'SELECTED',
  HAS_MONEY = 'HAS_MONEY',
  DISPENSING = 'DISPENSING'
}

export interface Product {
  name: string;
  price: number;
  qty: number;
}

export class VendingMachine {
  private static instance: VendingMachine | null = null;
  private state: State = State.IDLE;
  private inventory: Map<string, Product> = new Map();
  private selectedProduct: Product | null = null;
  private balance: number = 0;

  private constructor() {}

  public static getInstance(): VendingMachine {
    if (!VendingMachine.instance) {
      VendingMachine.instance = new VendingMachine();
    }
    return VendingMachine.instance;
  }

  public addProduct(name: string, price: number, qty: number): void {
    this.inventory.set(name, { name, price, qty });
  }

  public selectProduct(name: string): void {
    if (this.state !== State.IDLE) {
      throw new Error("Invalid state: Machine must be IDLE to select products.");
    }
    const product = this.inventory.get(name);
    if (!product || product.qty <= 0) {
      throw new Error("Out of stock or product not found.");
    }
    this.selectedProduct = product;
    this.state = State.SELECTED;
  }

  public insertCoin(amount: number): void {
    if (this.state !== State.SELECTED && this.state !== State.HAS_MONEY) {
      throw new Error("Invalid state: Select a product before inserting money.");
    }
    this.balance += amount;
    this.state = State.HAS_MONEY;
  }

  public dispense(): { product: string; change: number } {
    if (this.state !== State.HAS_MONEY) {
      throw new Error("Invalid state: Insufficient steps to dispense.");
    }
    if (!this.selectedProduct) {
      throw new Error("No product selected.");
    }
    if (this.balance < this.selectedProduct.price) {
      throw new Error("Insufficient funds: Insert more coins.");
    }

    this.state = State.DISPENSING;
    const change = this.balance - this.selectedProduct.price;
    this.selectedProduct.qty--;
    const productName = this.selectedProduct.name;

    // Reset context
    this.selectedProduct = null;
    this.balance = 0;
    this.state = State.IDLE;

    return { product: productName, change };
  }

  public cancel(): number {
    const refund = this.balance;
    this.balance = 0;
    this.selectedProduct = null;
    this.state = State.IDLE;
    return refund;
  }

  public getState(): State {
    return this.state;
  }

  public getBalance(): number {
    return this.balance;
  }
}`,
    python: `from enum import Enum
from typing import Dict, Tuple

class State(Enum):
    IDLE = "IDLE"
    SELECTED = "SELECTED"
    HAS_MONEY = "HAS_MONEY"
    DISPENSING = "DISPENSING"

class Product:
    def __init__(self, name: str, price: float, qty: int):
        self.name = name
        self.price = price
        self.qty = qty

class VendingMachine:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        if VendingMachine._instance is not None:
            raise Exception("This class is a singleton! Use get_instance().")
        self.state: State = State.IDLE
        self.inventory: Dict[str, Product] = {}
        self.selected_product: Product = None
        self.balance: float = 0.0

    def add_product(self, name: str, price: float, qty: int) -> None:
        self.inventory[name] = Product(name, price, qty)

    def select_product(self, name: str) -> None:
        if self.state != State.IDLE:
            raise ValueError("Machine must be IDLE to select products")
        product = self.inventory.get(name)
        if not product or product.qty <= 0:
            raise ValueError("Product is out of stock")
        self.selected_product = product
        self.state = State.SELECTED

    def insert_coin(self, amount: float) -> None:
        if self.state not in (State.SELECTED, State.HAS_MONEY):
            raise ValueError("Select a product first before depositing money")
        self.balance += amount
        self.state = State.HAS_MONEY

    def dispense(self) -> Tuple[str, float]:
        if self.state != State.HAS_MONEY:
            raise ValueError("State incorrect for dispensing")
        if not self.selected_product:
            raise ValueError("No product selected")
        if self.balance < self.selected_product.price:
            raise ValueError("Insufficient funds")

        self.state = State.DISPENSING
        change = self.balance - self.selected_product.price
        self.selected_product.qty -= 1
        product_name = self.selected_product.name

        self.selected_product = None
        self.balance = 0.0
        self.state = State.IDLE

        return product_name, change

    def cancel(self) -> float:
        refund = self.balance
        self.balance = 0.0
        self.selected_product = None
        self.state = State.IDLE
        return refund`,
    java: `import java.util.*;

public enum State {
    IDLE, SELECTED, HAS_MONEY, DISPENSING
}

public class Product {
    private final String name;
    private final double price;
    private int qty;

    public Product(String name, double price, int qty) {
        this.name = name;
        this.price = price;
        this.qty = qty;
    }

    public String getName() { return name; }
    public double getPrice() { return price; }
    public int getQty() { return qty; }
    public void decrementQty() { this.qty--; }
}

public class VendingMachine {
    private static VendingMachine instance = null;
    private State state = State.IDLE;
    private final Map<String, Product> inventory = new HashMap<>();
    private Product selectedProduct = null;
    private double balance = 0.0;

    private VendingMachine() {}

    public static synchronized VendingMachine getInstance() {
        if (instance == null) {
            instance = new VendingMachine();
        }
        return instance;
    }

    public void addProduct(String name, double price, int qty) {
        inventory.put(name, new Product(name, price, qty));
    }

    public synchronized void selectProduct(String name) {
        if (state != State.IDLE) {
            throw new IllegalStateException("Machine is not IDLE");
        }
        Product product = inventory.get(name);
        if (product == null || product.getQty() <= 0) {
            throw new IllegalArgumentException("Product out of stock or invalid");
        }
        selectedProduct = product;
        state = State.SELECTED;
    }

    public synchronized void insertCoin(double amount) {
        if (state != State.SELECTED && state != State.HAS_MONEY) {
            throw new IllegalStateException("Select a product first");
        }
        balance += amount;
        state = State.HAS_MONEY;
    }

    public synchronized DispenseResult dispense() {
        if (state != State.HAS_MONEY) {
            throw new IllegalStateException("Must insert money first");
        }
        if (selectedProduct == null) {
            throw new IllegalStateException("No product selected");
        }
        if (balance < selectedProduct.getPrice()) {
            throw new IllegalStateException("Insufficient funds");
        }

        state = State.DISPENSING;
        double change = balance - selectedProduct.getPrice();
        selectedProduct.decrementQty();
        String name = selectedProduct.getName();

        selectedProduct = null;
        balance = 0.0;
        state = State.IDLE;

        return new DispenseResult(name, change);
    }

    public synchronized double cancel() {
        double refund = balance;
        balance = 0.0;
        selectedProduct = null;
        state = State.IDLE;
        return refund;
    }

    public static class DispenseResult {
        public final String productName;
        public final double change;

        public DispenseResult(String productName, double change) {
            this.productName = productName;
            this.change = change;
        }
    }
}`,
    go: `package main

import (
	"errors"
	"sync"
)

type State string

const (
	IdleState       State = "IDLE"
	SelectedState   State = "SELECTED"
	HasMoneyState   State = "HAS_MONEY"
	DispensingState State = "DISPENSING"
)

type Product struct {
	Name  string
	Price float64
	Qty   int
}

type VendingMachine struct {
	state           State
	inventory       map[string]*Product
	selectedProduct *Product
	balance         float64
	mu              sync.Mutex
}

var instance *VendingMachine
var once sync.Once

func GetVendingMachineInstance() *VendingMachine {
	once.Do(func() {
		instance = &VendingMachine{
			state:     IdleState,
			inventory: make(map[string]*Product),
		}
	})
	return instance
}

func (m *VendingMachine) AddProduct(name string, price float64, qty int) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.inventory[name] = &Product{Name: name, Price: price, Qty: qty}
}

func (m *VendingMachine) SelectProduct(name string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.state != IdleState {
		return errors.New("machine must be idle to select products")
	}

	p, exists := m.inventory[name]
	if !exists || p.Qty <= 0 {
		return errors.New("product is out of stock")
	}

	m.selectedProduct = p
	m.state = SelectedState
	return nil
}

func (m *VendingMachine) InsertCoin(amount float64) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.state != SelectedState && m.state != HasMoneyState {
		return errors.New("select a product first before inserting coins")
	}

	m.balance += amount
	m.state = HasMoneyState
	return nil
}

func (m *VendingMachine) Dispense() (string, float64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.state != HasMoneyState {
		return "", 0, errors.New("state must be HAS_MONEY to dispense")
	}
	if m.selectedProduct == nil {
		return "", 0, errors.New("no product selected")
	}
	if m.balance < m.selectedProduct.Price {
		return "", 0, errors.New("insufficient funds")
	}

	m.state = DispensingState
	change := m.balance - m.selectedProduct.Price
	m.selectedProduct.Qty--
	productName := m.selectedProduct.Name

	m.selectedProduct = nil
	m.balance = 0.0
	m.state = IdleState

	return productName, change, nil
}

func (m *VendingMachine) Cancel() float64 {
	m.mu.Lock()
	defer m.mu.Unlock()

	refund := m.balance
	m.balance = 0.0
	m.selectedProduct = nil
	m.state = IdleState
	return refund
}`,
    cpp: `#include <iostream>
#include <string>
#include <unordered_map>
#include <mutex>
#include <stdexcept>

enum class State {
    IDLE, SELECTED, HAS_MONEY, DISPENSING
};

struct Product {
    std::string name;
    double price;
    int qty;
};

class VendingMachine {
private:
    static VendingMachine* instance;
    static std::mutex mtx;
    State state = State::IDLE;
    std::unordered_map<std::string, Product> inventory;
    Product* selectedProduct = nullptr;
    double balance = 0.0;

    VendingMachine() {}
public:
    static VendingMachine* getInstance() {
        std::lock_guard<std::mutex> lock(mtx);
        if (instance == nullptr) {
            instance = new VendingMachine();
        }
        return instance;
    }

    void addProduct(std::string name, double price, int qty) {
        std::lock_guard<std::mutex> lock(mtx);
        inventory[name] = {name, price, qty};
    }

    void selectProduct(const std::string& name) {
        std::lock_guard<std::mutex> lock(mtx);
        if (state != State::IDLE) {
            throw std::runtime_error("Machine must be IDLE");
        }
        auto it = inventory.find(name);
        if (it == inventory.end() || it->second.qty <= 0) {
            throw std::invalid_argument("Product out of stock");
        }
        selectedProduct = &(it->second);
        state = State::SELECTED;
    }

    void insertCoin(double amount) {
        std::lock_guard<std::mutex> lock(mtx);
        if (state != State::SELECTED && state != State::HAS_MONEY) {
            throw std::runtime_error("Select a product first");
        }
        balance += amount;
        state = State::HAS_MONEY;
    }

    std::pair<std::string, double> dispense() {
        std::lock_guard<std::mutex> lock(mtx);
        if (state != State::HAS_MONEY) {
            throw std::runtime_error("Insufficient steps to dispense");
        }
        if (selectedProduct == nullptr) {
            throw std::runtime_error("No product selected");
        }
        if (balance < selectedProduct->price) {
            throw std::runtime_error("Insufficient funds");
        }

        state = State::DISPENSING;
        double change = balance - selectedProduct->price;
        selectedProduct->qty--;
        std::string productName = selectedProduct->name;

        selectedProduct = nullptr;
        balance = 0.0;
        state = State::IDLE;

        return {productName, change};
    }

    double cancel() {
        std::lock_guard<std::mutex> lock(mtx);
        double refund = balance;
        balance = 0.0;
        selectedProduct = nullptr;
        state = State::IDLE;
        return refund;
    }
};

// Static initializers (would go in a source file, but inline here for simplicity)
// VendingMachine* VendingMachine::instance = nullptr;
// std::mutex VendingMachine::mtx;`
  }
};
