import mongoose from "mongoose";

const InviteSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    // Automatically delete documents from MongoDB when expiresAt date is reached
    index: { expires: 0 }
  },
  used: {
    type: Boolean,
    default: false,
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roommate",
    default: null,
  },
  household: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Household",
    required: true,
  },
});

export const Invite = mongoose.model("Invite", InviteSchema);
