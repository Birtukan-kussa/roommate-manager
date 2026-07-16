import mongoose from "mongoose";

const HouseholdSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Household = mongoose.model("Household", HouseholdSchema);
