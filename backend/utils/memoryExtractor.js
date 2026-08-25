// utils/memoryExtractor.js
// Analyzes chat interactions to extract key facts about the user for persistent persona memory

const { getChatCompletion } = require("./openaiService");

/**
 * Extracts a key user fact or goal from a single chat turn.
 *
 * @param {string} userMessage - The user's input message
 * @param {string} aiReply - The persona's response
 * @returns {Promise<string|null>} - The extracted memory string or null if none
 */
async function extractMemory(userMessage, aiReply) {
  const prompt = `Analyze the following conversation turn between a User and an AI persona.
Identify if there are any new key personal facts, goals, preferences, or struggles mentioned by the User that should be remembered for long-term context.

Example of things to remember:
- "I'm studying for my software engineering midterms." -> "User is studying for software engineering midterms."
- "I finally ran 5km today!" -> "User completed a 5km run."
- "I hate loud noises when working." -> "User dislikes loud noises while working."
- "My name is John." -> "User's name is John."

Example of things NOT to remember (too general or transactional):
- "Can you write a python script?" -> NONE
- "Thank you so much!" -> NONE
- "What is the capital of France?" -> NONE

If a new long-term personal fact is mentioned, write a concise fact in 1 sentence. (Start with "User...").
If no new long-term facts are mentioned, reply with ONLY the word "NONE".
Do not return any explanation, code blocks, or preamble. Just the fact or "NONE".

Conversation Turn:
User: "${userMessage}"
AI: "${aiReply}"`;

  try {
    const response = await getChatCompletion(
      "You are a helpful memory extraction assistant. You only output a single extracted fact or 'NONE'.",
      [],
      prompt
    );

    const cleaned = response.trim().replace(/^"(.*)"$/, '$1'); // Clean quotes if LLM added them
    if (cleaned.toUpperCase() === "NONE" || cleaned === "") {
      return null;
    }
    return cleaned;
  } catch (err) {
    console.error("Failed to extract memory:", err);
    return null;
  }
}

module.exports = { extractMemory };
