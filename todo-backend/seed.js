import mongoose from "mongoose";
import dotenv from "dotenv";
import { Roommate } from "./models/Roommate.js";
import { Chore } from "./models/Chore.js";
import { Expense } from "./models/Expense.js";
import { ShoppingItem } from "./models/ShoppingItem.js";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("Error: MONGO_URL environment variable is not defined.");
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGO_URL);
    console.log("Database connected. Cleaning up existing data...");

    // Clear existing data
    await Roommate.deleteMany({});
    await Chore.deleteMany({});
    await Expense.deleteMany({});
    await ShoppingItem.deleteMany({});

    console.log("Seeding roommates (Ethiopian youth names)...");
    
    // Note: Roommate model has a pre("save") hook that automatically hashes the password.
    // We will use Roommate.create() to trigger this hook.
    
    // 1. Create Roommates
    const abel = await Roommate.create({
      name: "Abel Tesfaye",
      email: "abel@smartsplit.com",
      password: "password123",
      role: "admin",
      color: "#E2993C" // Gold
    });

    const bethel = await Roommate.create({
      name: "Bethel Yosef",
      email: "bethel@smartsplit.com",
      password: "password123",
      role: "member",
      color: "#3498db" // Blue
    });

    const dawit = await Roommate.create({
      name: "Dawit Alemayehu",
      email: "dawit@smartsplit.com",
      password: "password123",
      role: "member",
      color: "#2ecc71" // Green
    });

    const helina = await Roommate.create({
      name: "Helina Samuel",
      email: "helina@smartsplit.com",
      password: "password123",
      role: "member",
      color: "#e74c3c" // Red
    });

    const yosef = await Roommate.create({
      name: "Yosef Birhanu",
      email: "yosef@smartsplit.com",
      password: "password123",
      role: "member",
      color: "#9b59b6" // Purple
    });

    console.log("Roommates seeded successfully!");

    // 2. Create Chores
    console.log("Seeding chores...");
    await Chore.create([
      {
        title: "Clean Common Gibi (Yard)",
        description: "Sweep the main courtyard and water the plants.",
        status: "In Progress",
        assignedTo: dawit._id,
        createdBy: abel._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        recurring: "Weekly"
      },
      {
        title: "Buy Fresh Injera & Buna (Coffee)",
        description: "Get 30 fresh injeras from the local bakery and Buna beans from Tomoca.",
        status: "Completed",
        assignedTo: helina._id,
        createdBy: bethel._id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        recurring: "Daily"
      },
      {
        title: "Pay Internet Bill (Ethio Telecom)",
        description: "Use Telebirr to renew our unlimited broadband connection.",
        status: "Not Started",
        assignedTo: abel._id,
        createdBy: abel._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        recurring: "Monthly"
      },
      {
        title: "Wash Dishes & Kitchen Cleanup",
        description: "Clean up all pots and dishes after dinner preparation.",
        status: "Not Started",
        assignedTo: yosef._id,
        createdBy: dawit._id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        recurring: "Daily"
      }
    ]);
    console.log("Chores seeded successfully!");

    // 3. Create Expenses (balances should show who owes whom)
    console.log("Seeding expenses...");
    await Expense.create([
      {
        title: "Internet Subscription (Telebirr)",
        amount: 2500, // Ethiopian Birr
        paidBy: abel._id,
        splitBetween: [abel._id, bethel._id, dawit._id, helina._id, yosef._id],
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Shoa Supermarket Grocery Run",
        amount: 3500,
        paidBy: bethel._id,
        splitBetween: [abel._id, bethel._id, dawit._id, helina._id, yosef._id],
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Meat (Siga) & Injera for Holiday",
        amount: 4000,
        paidBy: dawit._id,
        splitBetween: [abel._id, bethel._id, dawit._id, helina._id],
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Electricity Prepaid Meter refill",
        amount: 500,
        paidBy: yosef._id,
        splitBetween: [abel._id, bethel._id, dawit._id, helina._id, yosef._id],
        date: new Date(Date.now())
      }
    ]);
    console.log("Expenses seeded successfully!");

    // 4. Create Shopping Items
    console.log("Seeding shopping list...");
    await ShoppingItem.create([
      {
        name: "Berbere (1kg)",
        addedBy: helina._id,
        purchased: false
      },
      {
        name: "Shiro Powder (Special)",
        addedBy: abel._id,
        purchased: false
      },
      {
        name: "Injera (30 pieces)",
        addedBy: dawit._id,
        purchased: true
      },
      {
        name: "Kolo (Snacks)",
        addedBy: bethel._id,
        purchased: false
      },
      {
        name: "Olive Oil / Zeýt",
        addedBy: yosef._id,
        purchased: false
      }
    ]);
    console.log("Shopping list seeded successfully!");

    console.log("All seed data created successfully!");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
