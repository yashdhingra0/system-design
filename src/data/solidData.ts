export interface SolidPrinciple {
  id: string;
  shortName: string;
  fullName: string;
  letter: string;
  color: string;
  mnemonic: string;           // Short catchy phrase to remember it
  analogy: string;            // Real-world non-software analogy
  analogyEmoji: string;
  definition: string;
  explanation: string[];
  interviewAnswer: string;    // One-sentence answer for "what is X?"
  commonMistakes: string[];
  violationCode: string;
  solutionCode: string;
  umlExplanation: string;
}

export const solidPrinciples: SolidPrinciple[] = [
  {
    id: "srp",
    shortName: "SRP",
    fullName: "Single Responsibility Principle",
    letter: "S",
    color: "#2dd4bf",
    mnemonic: "One class. One job. One reason to change.",
    analogy: "A surgeon operates — they don't also schedule appointments, handle billing, and clean the OR. Each person on the team has exactly one role.",
    analogyEmoji: "🏥",
    interviewAnswer: "A class should have only one reason to change — it should be responsible for a single part of the functionality, so changes in one concern don't ripple into unrelated code.",
    commonMistakes: [
      "Confusing SRP with \"a class can only have one method\" — it's about one *reason to change*, not one method.",
      "Creating God classes (UserManager that handles DB, email, and PDF) that violate SRP at every layer."
    ],
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
    letter: "O",
    color: "#8b7cf6",
    mnemonic: "Add new code. Don't edit old code.",
    analogy: "A power strip has fixed slots (closed to modification) but you can plug in any new device (open to extension). You don't rewire the strip every time you buy a new appliance.",
    analogyEmoji: "🔌",
    interviewAnswer: "Software entities should be open for extension but closed for modification — you add new behavior by writing new code (subclasses, plugins), not by changing existing tested code.",
    commonMistakes: [
      "Adding a new feature by adding another if/else branch in an existing method — classic OCP violation.",
      "Over-engineering: abstracting everything 'just in case'. OCP applies when you know a dimension of variation, not upfront for everything."
    ],
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
    letter: "L",
    color: "#38bdf8",
    mnemonic: "Children must keep their parent's promises.",
    analogy: "If a recipe calls for 'flour', substituting almond flour should work — your cake still bakes. But substituting sand breaks the recipe entirely. Substitutes must honour the original contract.",
    analogyEmoji: "🎂",
    interviewAnswer: "If S is a subtype of T, anywhere you use T you should be able to swap in S without breaking anything — the subclass must honour every contract its parent established.",
    commonMistakes: [
      "Overriding a parent method to throw NotImplementedException — the child can't be substituted, breaking LSP.",
      "Square extends Rectangle: setting width also changes height, breaking the width/height independence contract Rectangle promises."
    ],
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
    letter: "I",
    color: "#fbbf24",
    mnemonic: "Small focused interfaces over one fat interface.",
    analogy: "A restaurant menu for a vegan shouldn't be a 50-page book including steak cuts and sushi. Give people a focused menu for what they actually need — don't force them to scroll past irrelevant options.",
    analogyEmoji: "🥗",
    interviewAnswer: "Clients shouldn't be forced to depend on methods they don't use — split fat interfaces into smaller, role-specific ones so each class only implements what it actually needs.",
    commonMistakes: [
      "One giant IRepository interface with Save, Delete, Get, GetAll, Search, Paginate — most implementers only need 2 of those methods.",
      "Confusing ISP with SRP: SRP is about classes having one reason to change; ISP is about interfaces being lean and client-specific."
    ],
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
    letter: "D",
    color: "#f87171",
    mnemonic: "Depend on menus (interfaces), not specific restaurants (classes).",
    analogy: "Your TV remote works with any TV brand because both depend on the IR signal standard — not on each other. Swap the TV, the remote still works. That's dependency inversion.",
    analogyEmoji: "📺",
    interviewAnswer: "High-level modules and low-level modules should both depend on abstractions (interfaces), not on each other — this lets you swap implementations (MySQL → MongoDB) without touching business logic.",
    commonMistakes: [
      "Using 'new ConcreteClass()' inside a high-level class instead of injecting via constructor — hardcodes the dependency and prevents testing.",
      "Confusing DIP with Dependency Injection: DI is a *technique* to achieve DIP, not the principle itself."
    ],
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
