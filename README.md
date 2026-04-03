<div align="center">

<br/>

```
 █████╗ ███╗   ██╗████████╗ █████╗ ██████╗ ███╗   ███╗ █████╗ ███╗   ██╗
██╔══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔══██╗████╗ ████║██╔══██╗████╗  ██║
███████║██╔██╗ ██║   ██║   ███████║██████╔╝██╔████╔██║███████║██╔██╗ ██║
██╔══██║██║╚██╗██║   ██║   ██╔══██║██╔══██╗██║╚██╔╝██║██╔══██║██║╚██╗██║
██║  ██║██║ ╚████║   ██║   ██║  ██║██║  ██║██║ ╚═╝ ██║██║  ██║██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
```

### `// DYNAMIC PERSONALITY SIMULATOR`

**Create · Customize · Converse · Evolve**

AI personalities that think, feel, and grow — shaped by traits you define.

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/krishanumishra21/Antarman-ai?style=flat-square&color=7c3aed&label=⭐%20Stars)](https://github.com/krishanumishra21/Antarman-ai)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square&color=0891b2)](./LICENSE)
[![Stack](https://img.shields.io/badge/stack-MERN%20%2B%20AI-green?style=flat-square&color=16a34a)](https://github.com/krishanumishra21/Antarman-ai)
[![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)](https://github.com/krishanumishra21/Antarman-ai)

<br/>

</div>

---

## 🧠 What is AntarMan?

**AntarMan AI** is a full-stack MERN application powered by AI that lets you build, interact with, and evolve custom AI personalities. Rather than generic chatbots, AntarMan gives each persona a distinct behavioral fingerprint — defined by traits like confidence, empathy, aggression, and humor — and watches that personality grow with every conversation.

> *"Not just a chatbot. A character engine."*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎭 **Persona Builder** | Design custom AI personalities using trait sliders |
| 🧠 **Trait Simulation** | Confidence, empathy, aggression & humor shape every response |
| 💬 **Real-time Chat** | Live conversations with your AI persona |
| 🔄 **Evolution Engine** | Traits shift dynamically based on interaction patterns |
| 🧩 **Modular System** | Prompt builder + evolution engine as separate composable modules |
| 🎨 **Modern UI** | Clean, responsive Tailwind CSS interface |

---

## 🎛️ The Personality Engine

Traits aren't just labels — they're prompt modifiers that directly shape how your AI communicates.

```
Confidence  ████████░░  82   →  assertive, direct phrasing
Empathy     █████░░░░░  55   →  moderate warmth and listening
Aggression  ██░░░░░░░░  28   →  low friction, avoids conflict
Humor       ███████░░░  70   →  witty, playful, light-hearted
```

A high-confidence, low-empathy persona responds very differently from a warm, humorous one — and after 50 conversations, both will have drifted in new directions.

---

## 🏗️ How It Works

```
① Define Traits        →   Persona Builder sets the behavioral profile
         ↓
② Prompt Engineering   →   Traits convert to structured system prompts
         ↓
③ Real-time Chat       →   AI responds through its personality lens
         ↓
④ Evolution Engine     →   Interaction patterns feed back into trait scores
```

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React** (Vite)
- 🎨 **Tailwind CSS**

### Backend
- 🟢 **Node.js**
- 🚂 **Express.js**
- 🍃 **MongoDB** (Mongoose)

### AI Layer
- 🤖 **OpenAI API** (GPT-4 / GPT-3.5)
- ⚡ **Groq** (optional — faster inference)

---

## 📁 Project Structure

```
antarman-ai/
│
├── backend/
│   ├── models/          # Mongoose schemas (Persona, Conversation)
│   ├── routes/          # API endpoints
│   ├── utils/           # Prompt builder + evolution engine
│   ├── middleware/       # Auth, error handling
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # UI components
    │   ├── pages/       # Home, Chat, Builder
    │   └── hooks/       # Custom React hooks
    └── index.html
```

---

## ⚙️ Setup

### 1. Clone the repo

```bash
git clone https://github.com/krishanumishra21/Antarman-ai
cd antarman-ai
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_url
OPENAI_API_KEY=your_openai_api_key
PORT=5000
```

Start the server:

```bash
npm start
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## 🔐 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `PORT` | Backend server port (default: 5000) | Optional |

See `.env.example` for a complete template.

---

## 🌐 Roadmap

- [ ] 🎙️ Voice-based interaction
- [ ] 😶 Mood detection system
- [ ] 🗣️ Multi-persona conversations
- [ ] 🎬 Scenario simulations (interview, debate, therapy)
- [ ] 📊 Personality analytics dashboard
- [ ] 🌍 Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push and open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built with 🧠 by [Krishanu Mishra](https://github.com/krishanumishra21)**

*If AntarMan sparks something in you — give it a ⭐*

[![Star this repo](https://img.shields.io/badge/⭐%20Star%20on%20GitHub-7c3aed?style=for-the-badge)](https://github.com/krishanumishra21/Antarman-ai)

</div>
