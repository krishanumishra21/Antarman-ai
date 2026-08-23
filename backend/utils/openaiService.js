const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function getChatCompletion(systemPrompt, history, userMessage) {
  const messages = [
    { role: "system",    content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user",      content: userMessage },
  ];

  try {
    const response = await openai.chat.completions.create({
      model:       process.env.OPENAI_MODEL || "openai/gpt-oss-20b",
      messages,
      max_tokens:  1024,
      temperature: 0.85,
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("Groq API error:", err?.status, err?.message);
    if (err?.error?.message) console.error("Detail:", err.error.message);
    throw err;
  }
}

module.exports = { getChatCompletion };