// models/Otp.js
// Stores temporary OTP codes for email verification during registration

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  // Hashed OTP (never store plain text)
  otp: {
    type: String,
    required: true,
  },

  // Auto-delete after 5 minutes via MongoDB TTL index
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    index: { expires: 0 },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash OTP before saving
OtpSchema.pre("save", async function (next) {
  if (!this.isModified("otp")) return next();
  this.otp = await bcrypt.hash(this.otp, 10);
  next();
});

// Compare OTP method
OtpSchema.methods.compareOtp = async function (enteredOtp) {
  return await bcrypt.compare(enteredOtp, this.otp);
};

module.exports = mongoose.model("Otp", OtpSchema);
