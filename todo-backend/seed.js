import mongoose from "mongoose";
import dotenv from "dotenv";
import { Household } from "./models/Household.js";
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
    console.log("Connected. Cleaning up existing data...");

    await ShoppingItem.deleteMany({});
    await Expense.deleteMany({});
    await Chore.deleteMany({});
    await Roommate.deleteMany({});
    await Household.deleteMany({});

    // ═══════════════════════════════════════════════════════════════
    //  HOUSEHOLD 1 — Bole Villa
    // ═══════════════════════════════════════════════════════════════
    console.log("\nSeeding Household 1: Bole Villa...");
    const boleVilla = await Household.create({ name: "Bole Villa" });

    const abel = await Roommate.create({
      name: "Abel Tesfaye",
      email: "abel@smartsplit.com",
      password: "password123",
      role: "admin",
      color: "#E2993C",
      household: boleVilla._id,
    });

    const bethel = await Roommate.create({
      name: "Bethel Yosef",
      email: "bethel@smartsplit.com",
      password: "password123",
      role: "member",
      color: "#3498db",
      household: boleVilla._id,
    });

    const dawit = await Roommate.create({
      name: "Dawit Alemayehu",
      email: "dawit@smartsplit.com",
      password: "password123",
      role: "member",
      color: "#2ecc71",
      household: boleVilla._id,
    });

    // Bole Villa — Chores
    await Chore.create([
      {
        title: "Clean Common Gibi (Yard)",
        description: "Sweep the main courtyard and water the plants.",
        status: "In Progress",
        assignedTo: dawit._id,
        createdBy: abel._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        recurring: "Weekly",
        household: boleVilla._id,
      },
      {
        title: "Buy Fresh Injera & Buna",
        description: "Get 30 injeras from the local bakery and Buna from Tomoca.",
        status: "Completed",
        assignedTo: bethel._id,
        createdBy: abel._id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        recurring: "Daily",
        household: boleVilla._id,
      },
      {
        title: "Pay Internet Bill (Ethio Telecom)",
        description: "Use Telebirr to renew the unlimited broadband connection.",
        status: "Not Started",
        assignedTo: abel._id,
        createdBy: abel._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        recurring: "Monthly",
        household: boleVilla._id,
      },
    ]);

    // Bole Villa — Expenses
    await Expense.create([
      {
        title: "Internet Subscription (Telebirr)",
        amount: 2500,
        paidBy: abel._id,
        splitBetween: [abel._id, bethel._id, dawit._id],
        household: boleVilla._id,
      },
      {
        title: "Shoa Supermarket Grocery Run",
        amount: 3500,
        paidBy: bethel._id,
        splitBetween: [abel._id, bethel._id, dawit._id],
        household: boleVilla._id,
      },
    ]);

    // Bole Villa — Shopping List
    await ShoppingItem.create([
      { name: "Berbere (1kg)", addedBy: bethel._id, purchased: false, household: boleVilla._id },
      { name: "Shiro Powder (Special)", addedBy: abel._id, purchased: false, household: boleVilla._id },
      { name: "Injera (30 pieces)", addedBy: dawit._id, purchased: true, household: boleVilla._id },
    ]);

    console.log("Bole Villa seeded: Abel (admin), Bethel, Dawit ✓");

    // ═══════════════════════════════════════════════════════════════
    //  HOUSEHOLD 2 — Kazanchis Apartment
    // ═══════════════════════════════════════════════════════════════
    console.log("\nSeeding Household 2: Kazanchis Apartment...");
    const kazanchis = await Household.create({ name: "Kazanchis Apartment" });

    const helina = await Roommate.create({
      name: "Helina Samuel",
      email: "helina@smartsplit.com",
      password: "password123",
      role: "admin",
      color: "#e74c3c",
      household: kazanchis._id,
    });

    const yosef = await Roommate.create({
      name: "Yosef Birhanu",
      email: "yosef@smartsplit.com",
      password: "password123",
      role: "member",
      color: "#9b59b6",
      household: kazanchis._id,
    });

    const meron = await Roommate.create({
      name: "Meron Girma",
      email: "meron@smartsplit.com",
      password: "password123",
      role: "member",
      color: "#1abc9c",
      household: kazanchis._id,
    });

    // Kazanchis — Chores
    await Chore.create([
      {
        title: "Wash Dishes & Kitchen Cleanup",
        description: "Clean up all pots and dishes after dinner.",
        status: "Not Started",
        assignedTo: yosef._id,
        createdBy: helina._id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        recurring: "Daily",
        household: kazanchis._id,
      },
      {
        title: "Take Out Trash (Ziqa)",
        description: "Take the trash bags to the street collection point.",
        status: "Completed",
        assignedTo: meron._id,
        createdBy: helina._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        recurring: "Weekly",
        household: kazanchis._id,
      },
      {
        title: "Pay Electricity Prepaid Meter",
        description: "Refill the electricity prepaid meter using Telebirr.",
        status: "In Progress",
        assignedTo: helina._id,
        createdBy: helina._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        recurring: "Monthly",
        household: kazanchis._id,
      },
    ]);

    // Kazanchis — Expenses
    await Expense.create([
      {
        title: "Meat (Siga) & Injera for Holiday",
        amount: 4000,
        paidBy: helina._id,
        splitBetween: [helina._id, yosef._id, meron._id],
        household: kazanchis._id,
      },
      {
        title: "Electricity Prepaid Meter Refill",
        amount: 500,
        paidBy: yosef._id,
        splitBetween: [helina._id, yosef._id, meron._id],
        household: kazanchis._id,
      },
    ]);

    // Kazanchis — Shopping List
    await ShoppingItem.create([
      { name: "Kolo (Snacks)", addedBy: yosef._id, purchased: false, household: kazanchis._id },
      { name: "Olive Oil / Zeýt", addedBy: helina._id, purchased: false, household: kazanchis._id },
      { name: "Coffee beans (Buna)", addedBy: meron._id, purchased: true, household: kazanchis._id },
    ]);

    console.log("Kazanchis Apartment seeded: Helina (admin), Yosef, Meron ✓");

    console.log(`
══════════════════════════════════════════════
  Seed complete! Two independent households:

  🏠 Bole Villa
     abel@smartsplit.com    (admin)   pw: password123
     bethel@smartsplit.com  (member)  pw: password123
     dawit@smartsplit.com   (member)  pw: password123

  🏠 Kazanchis Apartment
     helina@smartsplit.com  (admin)   pw: password123
     yosef@smartsplit.com   (member)  pw: password123
     meron@smartsplit.com   (member)  pw: password123
══════════════════════════════════════════════
    `);

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
