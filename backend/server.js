// server.js
// Entry point for the PersonaForge AI backend server

require("dotenv").config(); // Load .env variables FIRST

const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");

// Route handlers
const personaRoutes = require("./routes/persona");
const chatRoutes    = require("./routes/chat");

const app  = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

// Allow requests from the React frontend (adjust origin in production)
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

// Parse incoming JSON bodies
app.use(express.json());

// Simple request logger for development
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────
app.use("/auth",    require("./routes/auth"));
app.use("/persona", personaRoutes);
app.use("/chat",    chatRoutes);
// Add this line with the other routes:


// Health-check endpoint (useful for uptime monitors)
app.get("/health", (_req, res) => {
  res.json({
    status:    "ok",
    timestamp: new Date().toISOString(),
    db:        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MongoDB Connection → then start server
// ─────────────────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅  MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀  PersonaForge API running on http://localhost:${PORT}`);
      console.log(`🤖  Using model: ${process.env.OPENAI_MODEL || "gpt-4o"}`);
    });
  })
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1); // Don't start the server without a DB
  });
