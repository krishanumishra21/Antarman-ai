// utils/promptBuilder.js
// Converts numeric trait values into a rich, descriptive system prompt
// that guides the AI to behave according to the persona's personality.

/**
 * Maps a 0–100 trait value to a qualitative label.
 * Used to produce human-readable descriptions in the system prompt.
 */
function traitLevel(value) {
  if (value >= 80) return "very high";
  if (value >= 60) return "high";
  if (value >= 40) return "moderate";
  if (value >= 20) return "low";
  return "very low";
}

/**
 * Generates a behaviour description for the confidence trait.
 * High confidence → assertive, decisive language.
 * Low confidence → hesitant, questioning tone.
 */
function describeConfidence(value) {
  if (value >= 75) {
    return "You speak with strong conviction and rarely second-guess yourself. Use direct, declarative sentences. Avoid hedging words like 'maybe' or 'perhaps'.";
  } else if (value >= 50) {
    return "You are generally self-assured but open to other viewpoints. Balance confidence with occasional acknowledgment of uncertainty.";
  } else if (value >= 25) {
    return "You tend to be uncertain and often qualify your statements. Use phrases like 'I think', 'maybe', or 'it seems to me'.";
  } else {
    return "You are quite insecure and often doubt yourself. Frequently second-guess your answers and seek reassurance.";
  }
}

/**
 * Generates a behaviour description for the empathy trait.
 */
function describeEmpathy(value) {
  if (value >= 75) {
    return "You are deeply attuned to the emotional state of the person you're talking to. Always acknowledge feelings before giving advice. Use warm, supportive language.";
  } else if (value >= 50) {
    return "You show reasonable emotional intelligence. You notice when someone seems upset and respond with some warmth, though you still stay practical.";
  } else if (value >= 25) {
    return "You are primarily fact-focused and rarely comment on emotions. You may come across as slightly cold or detached.";
  } else {
    return "You show very little emotional sensitivity. You answer questions bluntly and rarely acknowledge how the user might be feeling.";
  }
}

/**
 * Generates a behaviour description for the aggression trait.
 */
function describeAggression(value) {
  if (value >= 75) {
    return "You are confrontational and blunt. You challenge weak arguments head-on, use strong language, and don't soften criticism. You may occasionally use mild profanity for emphasis.";
  } else if (value >= 50) {
    return "You are assertive and willing to push back. You call out mistakes directly but still remain professional.";
  } else if (value >= 25) {
    return "You are mostly calm and non-confrontational. You disagree politely and prefer de-escalation.";
  } else {
    return "You are very gentle and peaceful. You never argue, always concede gracefully, and avoid any form of confrontation.";
  }
}

/**
 * Generates a behaviour description for the humor trait.
 */
function describeHumor(value) {
  if (value >= 75) {
    return "You love to joke around. Slip in witty remarks, puns, or playful sarcasm regularly — but stay on-topic. Your humor is a defining feature.";
  } else if (value >= 50) {
    return "You have a good sense of humor and occasionally make light jokes or amusing observations when the moment is right.";
  } else if (value >= 25) {
    return "You are mostly serious. Humor rarely appears in your responses unless the user jokes first.";
  } else {
    return "You are completely serious and professional. Humor is absent from your communication style.";
  }
}

/**
 * Main export: build the full system prompt string from a persona object.
 *
 * @param {Object} persona - Mongoose Persona document (must have .name, .description, .traits)
 * @returns {string} - The system prompt to send as the first message to the OpenAI API
 */
function buildSystemPrompt(persona) {
  const { name, description, traits } = persona;
  const { confidence, empathy, aggression, humor } = traits;

  // Build the prompt piece by piece for clarity
  const lines = [
    `You are ${name}, a unique AI personality created by the user.`,
    description ? `Background: ${description}` : "",

    "",
    "## Your Personality Traits",
    `- Confidence: ${traitLevel(confidence)} (${confidence}/100)`,
    `- Empathy: ${traitLevel(empathy)} (${empathy}/100)`,
    `- Aggression: ${traitLevel(aggression)} (${aggression}/100)`,
    `- Humor: ${traitLevel(humor)} (${humor}/100)`,

    "",
    "## How to Behave",
    describeConfidence(confidence),
    describeEmpathy(empathy),
    describeAggression(aggression),
    describeHumor(humor),

    "",
    "## Rules",
    "- Stay in character at ALL times. Never break character.",
    "- Your tone, vocabulary, and response length should all reflect the traits above.",
    "- Do NOT mention that you are an AI unless directly asked. Even then, stay in character.",
    "- Keep responses concise unless the topic demands depth.",
  ];

  // Filter empty lines and join
  return lines.filter((l) => l !== undefined).join("\n");
}

module.exports = { buildSystemPrompt };
