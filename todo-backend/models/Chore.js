import mongoose from "mongoose";

const ChoreSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Not Started", "In Progress", "Completed"],
    default: "Not Started",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roommate",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roommate",
  },
  dueDate: {
    type: Date,
  },
  recurring: {
    type: String,
    enum: ["None", "Daily", "Weekly", "Monthly"],
    default: "None",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Chore = mongoose.model("Chore", ChoreSchema);