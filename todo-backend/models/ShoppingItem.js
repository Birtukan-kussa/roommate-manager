import mongoose from "mongoose";

const ShoppingItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roommate",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roommate",
  },
  purchased: {
    type: Boolean,
    default: false,
  },
  household: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Household",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ShoppingItem = mongoose.model("ShoppingItem", ShoppingItemSchema);