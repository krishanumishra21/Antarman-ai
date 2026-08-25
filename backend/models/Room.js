// models/Room.js
// Stores group chat sessions involving multiple AI personas

const mongoose = require("mongoose");

const RoomMessageSchema = new mongoose.Schema(
  {
    // "user" = human, "assistant" = AI persona
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    // The actual text content
    content: {
      type: String,
      required: true,
    },

    // If role is assistant, references which persona said it
    personaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Persona",
      default: null,
    },

    // Display name of the sender (e.g. "You" or persona name)
    senderName: {
      type: String,
      required: true,
    },

    // Snapshot of the persona's traits AT THE TIME this message was sent.
    traitSnapshot: {
      confidence: Number,
      empathy: Number,
      aggression: Number,
      humor: Number,
    },

    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const RoomSchema = new mongoose.Schema(
  {
    // Display name of the group room
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      maxlength: [100, "Room name cannot exceed 100 characters"],
    },

    // User who created the room
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // List of personas added to this room (minimum 2 recommended)
    personaIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Persona",
        required: true,
      },
    ],

    // Message history of this group room
    messages: [RoomMessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", RoomSchema);
