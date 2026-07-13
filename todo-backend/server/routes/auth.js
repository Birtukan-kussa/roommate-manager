import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Roommate } from "../../models/Roommate.js";
import { Invite } from "../../models/Invite.js";

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "30d" }
  );
};

// Route to generate an invite link (Admin only)
router.post(
  "/invite",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized. Admin access required." });
      }

      // Generate a secure random token
      const token = crypto.randomBytes(16).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const invite = await Invite.create({
        token,
        expiresAt,
      });

      res.status(201).json({
        token: invite.token,
        expiresAt: invite.expiresAt,
        // Send absolute invite URL
        inviteUrl: `${req.protocol}://${req.get("host").replace("9000", "3000")}/signup?invite=${invite.token}`,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, color, inviteToken } = req.body;

    const userExists = await Roommate.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const userCount = await Roommate.countDocuments();
    let invite = null;

    // Enforce invite token if this is not the first user
    if (userCount > 0) {
      if (!inviteToken) {
        return res.status(400).json({ message: "Invite token is required to register" });
      }

      invite = await Invite.findOne({ token: inviteToken });
      if (!invite) {
        return res.status(400).json({ message: "Invalid invite token" });
      }
      if (invite.used) {
        return res.status(400).json({ message: "Invite token has already been used" });
      }
      if (invite.expiresAt < new Date()) {
        return res.status(400).json({ message: "Invite token has expired" });
      }
    }

    // First user ever becomes admin
    const role = userCount === 0 ? "admin" : "member";

    const user = await Roommate.create({ name, email, password, color, role });

    if (user) {
      // Mark token as used if an invite was required
      if (invite) {
        invite.used = true;
        invite.usedBy = user._id;
        await invite.save();
      }

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
