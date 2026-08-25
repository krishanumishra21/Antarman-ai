// routes/room.js
const express = require("express");
const router = express.Router();
const Persona = require("../models/Persona");
const Room = require("../models/Room");
const auth = require("../middleware/auth");
const { buildSystemPrompt } = require("../utils/promptBuilder");
const { evolveTraits } = require("../utils/evolutionEngine");
const { getChatCompletion } = require("../utils/openaiService");

const MEMORY_WINDOW = 15;

// All room routes require authentication
router.use(auth);

// POST /room/create
router.post("/create", async (req, res) => {
  try {
    const { name, personaIds } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: "Room name is required." });
    }
    if (!personaIds || !Array.isArray(personaIds) || personaIds.length < 2) {
      return res.status(400).json({ error: "At least 2 personas are required for a group room." });
    }

    // Verify all selected personas belong to the user
    const validPersonas = await Persona.find({
      _id: { $in: personaIds },
      userId: req.user._id,
    });

    if (validPersonas.length !== personaIds.length) {
      return res.status(400).json({ error: "One or more invalid personas selected." });
    }

    const room = new Room({
      name: name.trim(),
      userId: req.user._id,
      personaIds: validPersonas.map((p) => p._id),
      messages: [],
    });

    await room.save();
    res.status(201).json({ message: "Persona Room created!", room });
  } catch (err) {
    console.error("Create room error:", err);
    res.status(500).json({ error: "Server error while creating room." });
  }
});

// GET /room/all
router.get("/all", async (req, res) => {
  try {
    const rooms = await Room.find({ userId: req.user._id })
      .populate("personaIds", "name traits description")
      .sort({ updatedAt: -1 });
    res.json({ rooms });
  } catch (err) {
    console.error("Fetch rooms error:", err);
    res.status(500).json({ error: "Server error while fetching rooms." });
  }
});

// GET /room/:roomId
router.get("/:roomId", async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.roomId, userId: req.user._id })
      .populate("personaIds", "name traits description");

    if (!room) {
      return res.status(404).json({ error: "Room not found." });
    }
    res.json({ room });
  } catch (err) {
    console.error("Fetch room error:", err);
    res.status(500).json({ error: "Server error while fetching room details." });
  }
});

// DELETE /room/:roomId
router.delete("/:roomId", async (req, res) => {
  try {
    const result = await Room.findOneAndDelete({ _id: req.params.roomId, userId: req.user._id });
    if (!result) {
      return res.status(404).json({ error: "Room not found." });
    }
    res.json({ message: "Room deleted." });
  } catch (err) {
    console.error("Delete room error:", err);
    res.status(500).json({ error: "Server error while deleting room." });
  }
});

// POST /room/:roomId/message
// User sends a message, and all personas respond sequentially
router.post("/:roomId/message", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    const room = await Room.findOne({ _id: req.params.roomId, userId: req.user._id })
      .populate("personaIds");

    if (!room) {
      return res.status(404).json({ error: "Room not found." });
    }

    // Append User message
    const userMsg = {
      role: "user",
      content: message.trim(),
      senderName: "You",
      personaId: null,
      traitSnapshot: null,
      timestamp: new Date(),
    };
    room.messages.push(userMsg);

    const responses = [];

    // Get sequential responses from all personas
    for (const persona of room.personaIds) {
      // 1. Build custom system prompt indicating group environment
      const basePrompt = buildSystemPrompt(persona);
      const otherNames = room.personaIds
        .filter((p) => p._id.toString() !== persona._id.toString())
        .map((p) => p.name);

      const groupPromptSuffix = `\n\n## Group Chat Rules\n- You are currently in a group chat room named "${room.name}".\n- Other participants in this room: ${otherNames.join(", ")} and the user.\n- Respond naturally to the user or other personas. Avoid repeating things others have already said.\n- Keep your responses concise (under 3-4 sentences) so the chat stays readable.`;
      const systemPrompt = basePrompt + groupPromptSuffix;

      // 2. Format history for OpenAI service
      const recentHistory = room.messages.slice(-MEMORY_WINDOW);
      
      // We pass the history except the very last message as history parameter
      const historyContext = recentHistory.slice(0, -1).map((m) => ({
        role: m.role,
        content: `${m.senderName}: ${m.content}`,
      }));

      // The last message is treated as the direct user prompt for the API call
      const lastMsg = recentHistory[recentHistory.length - 1];
      const directPrompt = `${lastMsg.senderName}: ${lastMsg.content}`;

      // 3. Call AI
      const aiReply = await getChatCompletion(systemPrompt, historyContext, directPrompt);

      // 4. Evolve persona traits based on user's tone
      const plainTraits = persona.traits.toObject ? persona.traits.toObject() : { ...persona.traits };
      const updatedTraits = evolveTraits(plainTraits, message);
      persona.traits = updatedTraits;
      await persona.save();

      // 5. Append AI reply to room messages
      const aiMsg = {
        role: "assistant",
        content: aiReply,
        personaId: persona._id,
        senderName: persona.name,
        traitSnapshot: { ...updatedTraits },
        timestamp: new Date(),
      };
      room.messages.push(aiMsg);

      responses.push({
        personaId: persona._id,
        senderName: persona.name,
        content: aiReply,
        updatedTraits,
      });
    }

    await room.save();
    res.json({ messages: room.messages, newResponses: responses });
  } catch (err) {
    console.error("Room message error:", err);
    res.status(500).json({ error: "Error sending message to the room." });
  }
});

// POST /room/:roomId/interact
// Let personas converse with each other based on the last message in the room
router.post("/:roomId/interact", async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.roomId, userId: req.user._id })
      .populate("personaIds");

    if (!room) {
      return res.status(404).json({ error: "Room not found." });
    }

    if (room.messages.length === 0) {
      return res.status(400).json({ error: "Cannot start a discussion in an empty room." });
    }

    const responses = [];

    // Let each persona speak once sequentially in response to whatever is in the room
    for (const persona of room.personaIds) {
      // 1. Build custom system prompt
      const basePrompt = buildSystemPrompt(persona);
      const otherNames = room.personaIds
        .filter((p) => p._id.toString() !== persona._id.toString())
        .map((p) => p.name);

      const groupPromptSuffix = `\n\n## Group Chat Rules\n- You are currently in a group chat room named "${room.name}".\n- Other participants: ${otherNames.join(", ")} and the user.\n- Respond naturally to the last message in the room. Address other personas by name if relevant.\n- Keep your response brief (2-3 sentences).`;
      const systemPrompt = basePrompt + groupPromptSuffix;

      // 2. Format history
      const recentHistory = room.messages.slice(-MEMORY_WINDOW);
      
      const historyContext = recentHistory.slice(0, -1).map((m) => ({
        role: m.role,
        content: `${m.senderName}: ${m.content}`,
      }));

      const lastMsg = recentHistory[recentHistory.length - 1];
      const directPrompt = `${lastMsg.senderName}: ${lastMsg.content}`;

      // 3. Call AI
      const aiReply = await getChatCompletion(systemPrompt, historyContext, directPrompt);

      // 4. Evolve traits based on the last message in the room
      const plainTraits = persona.traits.toObject ? persona.traits.toObject() : { ...persona.traits };
      const updatedTraits = evolveTraits(plainTraits, lastMsg.content);
      persona.traits = updatedTraits;
      await persona.save();

      // 5. Append reply
      const aiMsg = {
        role: "assistant",
        content: aiReply,
        personaId: persona._id,
        senderName: persona.name,
        traitSnapshot: { ...updatedTraits },
        timestamp: new Date(),
      };
      room.messages.push(aiMsg);

      responses.push({
        personaId: persona._id,
        senderName: persona.name,
        content: aiReply,
        updatedTraits,
      });
    }

    await room.save();
    res.json({ messages: room.messages, newResponses: responses });
  } catch (err) {
    console.error("Room interact error:", err);
    res.status(500).json({ error: "Error during AI interaction session." });
  }
});

module.exports = router;
