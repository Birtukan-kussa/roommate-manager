import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Roommate } from "../../models/Roommate.js";

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "30d" }
  );
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, color } = req.body;

    const userExists = await Roommate.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // First user ever becomes admin
    const userCount = await Roommate.countDocuments();
    const role = userCount === 0 ? "admin" : "member";

    const user = await Roommate.create({ name, email, password, color, role });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message });

    req.login(user, { session: false }, (err) => {
      if (err) return next(err);
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    });
  })(req, res, next);
});

export default router;
