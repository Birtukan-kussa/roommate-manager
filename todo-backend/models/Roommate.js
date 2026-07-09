import mongoose from "mongoose";

const RoommateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  color: {
    type: String,
    default: "#3498db",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Roommate = mongoose.model("Roommate", RoommateSchema);