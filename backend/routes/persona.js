// routes/persona.js
const express  = require("express");
const router   = express.Router();
const Persona  = require("../models/Persona");
const auth     = require("../middleware/auth");

// All persona routes require login
router.use(auth);

// POST /persona/create
router.post("/create", async (req, res) => {
  try {
    const { name, description, traits } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: "Persona name is required." });
    }
    const persona = new Persona({
      userId: req.user._id,   // ← attach to logged in user
      name: name.trim(),
      description: description?.trim() || "",
      traits: {
        confidence: traits?.confidence ?? 50,
        empathy:    traits?.empathy    ?? 50,
        aggression: traits?.aggression ?? 20,
        humor:      traits?.humor      ?? 40,
      },
    });
    await persona.save();
    res.status(201).json({ message: "Persona created!", persona });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while creating persona." });
  }
});

// GET /persona/all  — only returns THIS user's personas
router.get("/all", async (req, res) => {
  try {
    const personas = await Persona.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ personas });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// GET /persona/:id
router.get("/:id", async (req, res) => {
  try {
    const persona = await Persona.findOne({ _id: req.params.id, userId: req.user._id });
    if (!persona) return res.status(404).json({ error: "Persona not found." });
    res.json({ persona });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// DELETE /persona/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await Persona.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!result) return res.status(404).json({ error: "Persona not found." });
    res.json({ message: "Persona deleted." });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;