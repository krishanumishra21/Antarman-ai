// routes/auth.js
const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const crypto  = require("crypto");
const User    = require("../models/User");
const Otp     = require("../models/Otp");
const { sendOtpEmail } = require("../utils/emailService");

// Helper to generate JWT token
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// Generate a 6-digit numeric OTP
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

// ── POST /auth/send-otp ────────────────────────────────────────────────────────
// Sends a 6-digit OTP to the given email for registration verification
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Check if email is already registered
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    // Rate limit: max 5 OTP requests per email in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await Otp.countDocuments({
      email: email.toLowerCase().trim(),
      createdAt: { $gte: oneHourAgo },
    });
    if (recentCount >= 5) {
      return res.status(429).json({ error: "Too many OTP requests. Please try again later." });
    }

    // Delete any existing OTPs for this email
    await Otp.deleteMany({ email: email.toLowerCase().trim() });

    // Generate and store OTP
    const otp = generateOtp();
    await Otp.create({ email: email.toLowerCase().trim(), otp });

    // Send email
    try {
      await sendOtpEmail(email.toLowerCase().trim(), otp);
    } catch (emailErr) {
      // Clean up OTP record on sending failure so database is not cluttered with unusable records
      await Otp.deleteMany({ email: email.toLowerCase().trim() });
      throw emailErr;
    }

    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("Send OTP error:", err);
    if (err.message && err.message.startsWith("SMTP_ERROR:")) {
      return res.status(502).json({
        error: "Email delivery failed. Please verify that your SMTP/Gmail App Password environment variables are set correctly on Render.",
        details: err.message.replace("SMTP_ERROR: ", ""),
      });
    }
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
});

// ── POST /auth/verify-otp ──────────────────────────────────────────────────────
// Verifies the OTP entered by the user
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase().trim() })
      .sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ error: "OTP expired or not found. Please request a new one." });
    }

    const isMatch = await otpRecord.compareOtp(otp.toString());
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid OTP. Please check and try again." });
    }

    // OTP verified — delete it so it can't be reused
    await Otp.deleteMany({ email: email.toLowerCase().trim() });

    res.json({ verified: true, message: "Email verified successfully!" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "Server error during OTP verification." });
  }
});

// ── POST /auth/register ──────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration." });
  }
});

// ── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Logged in successfully!",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login." });
  }
});

// ── GET /auth/me ─────────────────────────────────────────────────────────────
// Returns current logged in user's info (used on page refresh)
router.get("/me", require("../middleware/auth"), async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
});

module.exports = router;