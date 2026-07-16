import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roommate",
    required: true,
  },
  splitBetween: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roommate",
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  household: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Household",
    required: true,
  },
});

export const Expense = mongoose.model("Expense", ExpenseSchema);