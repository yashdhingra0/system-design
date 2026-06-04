export interface SolidPrinciple {
  id: string;
  shortName: string;
  fullName: string;
  definition: string;
  explanation: string[];
  violationCode: string;
  solutionCode: string;
  umlExplanation: string;
}

export const solidPrinciples: SolidPrinciple[] = [
  {
    id: "srp",
    shortName: "SRP",
    fullName: "Single Responsibility Principle",
    definition: "A class should have one, and only one, reason to change.",
    explanation: [
      "Every module, class, or function should be responsible for a single part of the functionality.",
      "By isolating responsibilities, we limit the blast radius of code changes.",
      "If a class handles database access, data validation, and PDF formatting, any change in database schema or PDF design requires modifying the same file, increasing merge conflicts and regression bugs."
    ],
    violationCode: `// VIOLATION: User class manages user data, database queries, and email reports.
class UserManager {
  private userId: string;
  private email: string;

  constructor(userId: string, email: string) {
    this.userId = userId;
    this.email = email;
  }

  // Reason to change 1: Database persistence changes
  public saveToDatabase() {
    console.log(\`Saving user \${this.userId} to Database\`);
    // DB raw query logic...
  }

  // Reason to change 2: Report template changes
  public generateUserReport(): string {
    return \`<html><body>User Report: \${this.email}</body></html>\`;
  }

  // Reason to change 3: Notification system changes
  public sendWelcomeEmail() {
    console.log(\`Sending welcome email to \${this.email}\`);
    // SMTP connection logic...
  }
}`,
    solutionCode: `// SOLUTION: Split into separate classes, each with a single responsibility.
class User {
  constructor(public readonly userId: string, public readonly email: string) {}
}

class UserDatabase {
  public save(user: User) {
    console.log(\`Saving user \${user.userId} to Database\`);
  }
}

class UserReportGenerator {
  public generateHtmlReport(user: User): string {
    return \`<html><body>User Report: \${user.email}</body></html>\`;
  }
}

class EmailService {
  public sendEmail(to: string, subject: string, body: string) {
    console.log(\`Sending email to \${to}: \${subject}\`);
  }
}

// Coordinator logic (clean and decoupled)
class SignUpController {
  constructor(
    private db: UserDatabase,
    private emailService: EmailService
  ) {}

  public execute(userId: string, email: string) {
    const user = new User(userId, email);
    this.db.save(user);
    this.emailService.sendEmail(email, "Welcome", "Glad to have you!");
  }
}`,
    umlExplanation: "UserManager [Violation] -> User, UserDatabase, UserReportGenerator, EmailService [Solution]"
  },
  {
    id: "ocp",
    shortName: "OCP",
    fullName: "Open-Closed Principle",
    definition: "Software entities (classes, modules, functions) should be open for extension, but closed for modification.",
    explanation: [
      "You should be able to extend a class's behavior without modifying its existing source code.",
      "This is typically achieved through abstraction, interfaces, and polymorphism.",
      "Adding a new payment option (e.g., ApplePay) should not involve modifying the core checkout engine switch-statement; instead, the checkout engine should interact with a generic payment interface."
    ],
    violationCode: `// VIOLATION: If we add a new payment method, we must modify the processPayment method.
class PaymentProcessor {
  public processPayment(paymentType: string, amount: number) {
    if (paymentType === 'stripe') {
      console.log(\`Processing Stripe payment of \$\${amount}\`);
    } else if (paymentType === 'paypal') {
      console.log(\`Processing PayPal payment of \$\${amount}\`);
    } else if (paymentType === 'applepay') {
      console.log(\`Processing ApplePay payment of \$\${amount}\`);
    } else {
      throw new Error("Payment method not supported");
    }
  }
}`,
    solutionCode: `// SOLUTION: Define a Payment interface and extend it for new methods.
interface PaymentMethod {
  pay(amount: number): void;
}

class StripePayment implements PaymentMethod {
  pay(amount: number): void {
    console.log(\`Processing Stripe payment of \$\${amount}\`);
  }
}

class PayPalPayment implements PaymentMethod {
  pay(amount: number): void {
    console.log(\`Processing PayPal payment of \$\${amount}\`);
  }
}

class ApplePayPayment implements PaymentMethod {
  pay(amount: number): void {
    console.log(\`Processing ApplePay payment of \$\${amount}\`);
  }
}

// core engine is now CLOSED to modification, but OPEN to new methods!
class OCPPaymentProcessor {
  public process(paymentMethod: PaymentMethod, amount: number) {
    paymentMethod.pay(amount);
  }
}`,
    umlExplanation: "PaymentProcessor has direct conditionals [Violation] -> PaymentProcessor uses PaymentMethod interface -> StripePayment, PayPalPayment, ApplePayPayment [Solution]"
  },
  {
    id: "lsp",
    shortName: "LSP",
    fullName: "Liskov Substitution Principle",
    definition: "Subtypes must be substitutable for their base types without altering the correctness of the program.",
    explanation: [
      "Derived classes must inherit the base class behavior in a way that doesn't break the base class expectations.",
      "Do not override parent methods with empty operations or throw UnsupportedOperationException.",
      "The classic example: A Square subclassing Rectangle. A Square cannot satisfy the rectangle's contract of independent width/height modification, leading to unexpected behavior in clients."
    ],
    violationCode: `// VIOLATION: Ostrich is a Bird but cannot fly, throwing an error and breaking client code.
class Bird {
  public fly() {
    console.log("Flying high!");
  }
}

class Eagle extends Bird {}

class Ostrich extends Bird {
  public fly() {
    throw new Error("I cannot fly! Ostrich LSP Violation.");
  }
}

function launchBirds(birds: Bird[]) {
  birds.forEach(bird => {
    bird.fly(); // Will crash when Ostrich is passed!
  });
}`,
    solutionCode: `// SOLUTION: Separate behaviors into dedicated interfaces.
class Bird {
  // Common bird properties (e.g., layEggs, feathers)
  public layEggs() {
    console.log("Laying eggs...");
  }
}

interface FlyingBird {
  fly(): void;
}

class Eagle extends Bird implements FlyingBird {
  public fly() {
    console.log("Eagle flying high!");
  }
}

class Ostrich extends Bird {
  // Ostrich only has base Bird behaviors, does not implement FlyingBird
  public run() {
    console.log("Running at 70km/h!");
  }
}

// Client logic only invokes actions on valid contracts
function migrateFlyingBirds(birds: FlyingBird[]) {
  birds.forEach(bird => bird.fly());
}`,
    umlExplanation: "Ostrich extends Bird (overriding fly to crash) [Violation] -> Bird, Eagle extends Bird implements FlyingBird, Ostrich extends Bird [Solution]"
  },
  {
    id: "isp",
    shortName: "ISP",
    fullName: "Interface Segregation Principle",
    definition: "Clients should not be forced to depend on methods they do not use.",
    explanation: [
      "It is better to have many small, specific interfaces rather than a single bloated, general-purpose interface.",
      "Bloated interfaces force classes to write boilerplate empty overrides for methods they don't care about.",
      "For example, a smart printer interface shouldn't bundle print, scan, fax, and photocopy into one interface if simple printers only support printing."
    ],
    violationCode: `// VIOLATION: SimplePrinter is forced to implement scan and fax methods.
interface MultiFunctionDevice {
  print(): void;
  scan(): void;
  fax(): void;
}

class SmartOfficePrinter implements MultiFunctionDevice {
  print() { console.log("Printing document..."); }
  scan() { console.log("Scanning document..."); }
  fax() { console.log("Faxing document..."); }
}

class SimpleHomePrinter implements MultiFunctionDevice {
  print() {
    console.log("Printing document...");
  }

  // Forced empty methods or error throws!
  scan() {
    throw new Error("Scan function not supported by this device!");
  }
  fax() {
    throw new Error("Fax function not supported by this device!");
  }
}`,
    solutionCode: `// SOLUTION: Segregate the bloated interface into specific roles.
interface Printer {
  print(): void;
}

interface Scanner {
  scan(): void;
}

interface FaxMachine {
  fax(): void;
}

// Simple printer only depends on Printer
class SimpleHomePrinter implements Printer {
  print() {
    console.log("Printing document...");
  }
}

// Multi-function printer implements what it supports
class SmartOfficePrinter implements Printer, Scanner, FaxMachine {
  print() { console.log("Printing..."); }
  scan() { console.log("Scanning..."); }
  fax() { console.log("Faxing..."); }
}`,
    umlExplanation: "SimplePrinter forced to override scan/fax from MultiFunctionDevice [Violation] -> Printer, Scanner, Fax interfaces segregated [Solution]"
  },
  {
    id: "dip",
    shortName: "DIP",
    fullName: "Dependency Inversion Principle",
    definition: "High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions.",
    explanation: [
      "Depend on interfaces or abstract classes rather than concrete implementations.",
      "This decouples software modules, allowing low-level details (like shifting from MySQL to MongoDB) to change without modifying high-level business logic.",
      "A PasswordReminder class shouldn't instantiate MySQLConnection directly; instead, it should accept a DatabaseConnection interface."
    ],
    violationCode: `// VIOLATION: High-level Car class directly instantiates and depends on concrete V8Engine.
class V8Engine {
  public start() {
    console.log("V8 engine roaring to life!");
  }
}

class Car {
  private engine: V8Engine;

  constructor() {
    this.engine = new V8Engine(); // Tight coupling! Cannot swap to ElectricEngine easily.
  }

  public drive() {
    this.engine.start();
    console.log("Car is moving...");
  }
}`,
    solutionCode: `// SOLUTION: High-level Car depends on Engine interface, injected via Constructor.
interface Engine {
  start(): void;
}

class V8Engine implements Engine {
  start() {
    console.log("V8 engine roaring...");
  }
}

class ElectricEngine implements Engine {
  start() {
    console.log("Electric engine silent hum...");
  }
}

class Car {
  // Car depends on abstract Engine, NOT concrete details
  constructor(private engine: Engine) {}

  public drive() {
    this.engine.start();
    console.log("Car moving...");
  }
}

// Usage
const combustionCar = new Car(new V8Engine());
const electricCar = new Car(new ElectricEngine());`,
    umlExplanation: "Car -> V8Engine [Violation] -> Car -> Engine Interface <- V8Engine, ElectricEngine [Solution]"
  }
];
