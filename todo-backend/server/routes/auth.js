import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Roommate } from "../../models/Roommate.js";
import { Invite } from "../../models/Invite.js";
import { Household } from "../../models/Household.js";

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

      const token = crypto.randomBytes(16).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const invite = await Invite.create({
        token,
        expiresAt,
        household: req.user.household, // Link invite to admin's household
      });

      const clientOrigin = process.env.CLIENT_URL || `${req.protocol}://${req.get("host").replace("9000", "3000")}`;

      res.status(201).json({
        token: invite.token,
        expiresAt: invite.expiresAt,
        inviteUrl: `${clientOrigin}/signup?invite=${invite.token}`,
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

    let household;
    let role;
    let invite = null;

    if (inviteToken) {
      // ── Joining an existing household via invite ──────────────────
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

      household = invite.household;
      role = "member";
    } else {
      // ── Starting a brand-new household ────────────────────────────
      household = await Household.create({ name: `${name}'s Household` });
      role = "admin";
    }

    const user = await Roommate.create({ name, email, password, color, role, household });

    if (user) {
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
