// routes/chat.js
const express               = require("express");
const router                = express.Router();
const Persona               = require("../models/Persona");
const Chat                  = require("../models/Chat");
const auth                  = require("../middleware/auth");
const { buildSystemPrompt } = require("../utils/promptBuilder");
const { evolveTraits }      = require("../utils/evolutionEngine");
const { getChatCompletion } = require("../utils/openaiService");

const MEMORY_WINDOW = 10;

// All chat routes require login
router.use(auth);

// POST /chat/:personaId
router.post("/:personaId", async (req, res) => {
  try {
    const { message, chatId } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message cannot be empty." });

    // Only allow access to user's own persona
    const persona = await Persona.findOne({ _id: req.params.personaId, userId: req.user._id });
    if (!persona) return res.status(404).json({ error: "Persona not found." });

    let chat;
    if (chatId) chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat)  chat = new Chat({ personaId: persona._id, userId: req.user._id, messages: [] });

    const systemPrompt  = buildSystemPrompt(persona);
    const recentHistory = chat.messages.slice(-MEMORY_WINDOW);
    const aiReply       = await getChatCompletion(systemPrompt, recentHistory, message.trim());
    const updatedTraits = evolveTraits(persona.traits, message);

    persona.traits = updatedTraits;
    await persona.save();

    const traitSnapshot = { ...updatedTraits };
    chat.messages.push({ role: "user",      content: message.trim(), traitSnapshot });
    chat.messages.push({ role: "assistant", content: aiReply,        traitSnapshot });
    await chat.save();

    res.json({ reply: aiReply, chatId: chat._id, updatedTraits });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Something went wrong while processing your message." });
  }
});

// GET /chat/:personaId/history
router.get("/:personaId/history", async (req, res) => {
  try {
    const chats = await Chat.find({ personaId: req.params.personaId, userId: req.user._id })
      .sort({ updatedAt: -1 }).limit(20);
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;