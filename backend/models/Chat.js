// models/Chat.js
// Stores the conversation history between a user and a specific persona

const mongoose = require("mongoose");

// Individual message schema — reused inside the messages array
const MessageSchema = new mongoose.Schema(
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

    // Snapshot of the persona's traits AT THE TIME this message was sent.
    // Useful to audit how the persona evolved over the conversation.
    traitSnapshot: {
      confidence: Number,
      empathy: Number,
      aggression: Number,
      humor: Number,
    },

    timestamp: { type: Date, default: Date.now },
  },
  { _id: false } // No separate _id per message keeps things lean
);

const ChatSchema = new mongoose.Schema(
  {
    // Reference to which persona this chat belongs to
    personaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Persona",
      required: true,
      index: true,
    },
    // Add this field inside ChatSchema, after personaId field:
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  index: true,
},

    // Ordered list of all messages in this session
    messages: [MessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
