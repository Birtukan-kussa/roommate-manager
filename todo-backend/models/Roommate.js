import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const RoommateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member",
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

RoommateSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

RoommateSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export const Roommate = mongoose.model("Roommate", RoommateSchema);