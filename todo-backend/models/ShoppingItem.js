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
  purchased: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ShoppingItem = mongoose.model("ShoppingItem", ShoppingItemSchema);