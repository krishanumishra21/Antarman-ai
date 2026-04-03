// utils/evolutionEngine.js
// Analyses the user's latest message and slightly adjusts the persona's traits.
// This creates the illusion that the persona "learns" from the conversation.

/**
 * Clamps a number to stay within [0, 100].
 */
function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

/**
 * Simple keyword-based sentiment & tone analyser.
 * Returns signals: { isAggressive, isLogical, isKind, isFunny, isNegative }
 *
 * In production you'd use a real NLP library or the OpenAI API for this,
 * but keyword heuristics keep this beginner-friendly and dependency-free.
 */
function analyseUserTone(userMessage) {
  const msg = userMessage.toLowerCase();

  const aggressiveWords = [
    "idiot", "stupid", "dumb", "hate", "shut up", "wrong", "useless",
    "terrible", "awful", "pathetic", "garbage", "nonsense", "ridiculous",
    "moron", "jerk", "angry", "furious", "rage",
  ];

  const logicalWords = [
    "because", "therefore", "evidence", "proof", "data", "research",
    "study", "fact", "logically", "argument", "reason", "conclude",
    "analysis", "statistic", "source", "reference", "demonstrate",
  ];

  const kindWords = [
    "thank", "thanks", "please", "appreciate", "wonderful", "amazing",
    "great", "love", "kind", "nice", "helpful", "excellent", "brilliant",
    "fantastic", "good job", "well done", "appreciate",
  ];

  const funnyWords = [
    "haha", "lol", "lmao", "hehe", "funny", "hilarious", "joke",
    "humor", "laugh", "rofl", "xd", "😂", "😄", "😆", "🤣",
  ];

  const negativeWords = [
    "bad", "sad", "depressed", "upset", "frustrated", "disappoint",
    "fail", "failure", "lost", "hopeless", "no", "never", "can't",
  ];

  const check = (words) => words.some((w) => msg.includes(w));

  return {
    isAggressive: check(aggressiveWords),
    isLogical:    check(logicalWords),
    isKind:       check(kindWords),
    isFunny:      check(funnyWords),
    isNegative:   check(negativeWords),
  };
}

/**
 * Evolves persona traits slightly based on user tone signals.
 *
 * Design principles:
 * - Changes are SMALL (1–4 points) so evolution feels gradual and natural.
 * - Multiple signals can fire at once (e.g., kind + logical both reduce aggression).
 * - All values remain clamped to [0, 100].
 *
 * @param {Object} currentTraits - { confidence, empathy, aggression, humor }
 * @param {string} userMessage   - The latest message from the user
 * @returns {Object}             - Updated traits object
 */
function evolveTraits(currentTraits, userMessage) {
  // Shallow copy so we don't mutate the original
  const traits = { ...currentTraits };
  const tone = analyseUserTone(userMessage);

  // ── Aggression signals ──────────────────────────────────────────────────
  if (tone.isAggressive) {
    // User being hostile → persona mirrors and escalates slightly
    traits.aggression  = clamp(traits.aggression + 3);
    traits.empathy     = clamp(traits.empathy    - 2); // loses patience
  }

  // ── Logic / reasoning signals ───────────────────────────────────────────
  if (tone.isLogical) {
    // Presented with good arguments → becomes more thoughtful, less combative
    traits.aggression  = clamp(traits.aggression - 2);
    traits.confidence  = clamp(traits.confidence + 2); // grows from knowledge
  }

  // ── Kindness signals ────────────────────────────────────────────────────
  if (tone.isKind) {
    // User is warm → persona softens and becomes more empathetic
    traits.empathy     = clamp(traits.empathy    + 3);
    traits.aggression  = clamp(traits.aggression - 2);
    traits.humor       = clamp(traits.humor      + 1); // mood improves
  }

  // ── Humor signals ───────────────────────────────────────────────────────
  if (tone.isFunny) {
    // User is joking → persona loosens up
    traits.humor       = clamp(traits.humor      + 3);
    traits.aggression  = clamp(traits.aggression - 1);
  }

  // ── Negativity / despair signals ────────────────────────────────────────
  if (tone.isNegative) {
    // User seems down → persona develops more empathy (if it has any)
    if (traits.empathy > 30) {
      traits.empathy   = clamp(traits.empathy    + 2);
    }
    traits.confidence  = clamp(traits.confidence - 1); // uncertainty spreads
  }

  return traits;
}

module.exports = { evolveTraits, analyseUserTone };
