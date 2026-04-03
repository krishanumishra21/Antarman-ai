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

  const response = await openai.chat.completions.create({
    model:       process.env.OPENAI_MODEL || "llama3-8b-8192",
    messages,
    max_tokens:  500,
    temperature: 0.85,
  });

  return response.choices[0].message.content.trim();
}

module.exports = { getChatCompletion };