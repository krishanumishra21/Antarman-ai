// models/Persona.js
// Defines the schema for an AI persona with its personality traits

const mongoose = require("mongoose");

const PersonaSchema = new mongoose.Schema(
  {
    // Display name of the persona (e.g., "Alex the Mentor")
    name: {
      type: String,
      required: [true, "Persona name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
// Add this field inside PersonaSchema, after the name field:
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  index: true,
},
    // Short description / backstory for the persona
    description: {
      type: String,
      default: "",
      maxlength: [300, "Description cannot exceed 300 characters"],
    },

    // Personality traits — all values 0–100
    traits: {
      // How self-assured and decisive the persona sounds
      confidence: { type: Number, default: 50, min: 0, max: 100 },

      // How emotionally warm and supportive the persona is
      empathy: { type: Number, default: 50, min: 0, max: 100 },

      // How blunt, confrontational, or heated the persona can get
      aggression: { type: Number, default: 20, min: 0, max: 100 },

      // How often the persona cracks jokes or uses wit
      humor: { type: Number, default: 40, min: 0, max: 100 },
    },

    // Timestamp
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Persona", PersonaSchema);
