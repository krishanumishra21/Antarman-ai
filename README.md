# 🔮 PersonaForge AI — Dynamic Personality Simulator

> Create, customize, and chat with AI personalities that evolve as you talk to them.

---

## 📁 Folder Structure

```
personaforge/
│
├── backend/                     # Node.js + Express API
│   ├── models/
│   │   ├── Persona.js           # Mongoose schema for personas
│   │   └── Chat.js              # Mongoose schema for chat sessions
│   ├── routes/
│   │   ├── persona.js           # CRUD endpoints for personas
│   │   └── chat.js              # Chat + evolution endpoints
│   ├── utils/
│   │   ├── promptBuilder.js     # Converts traits → system prompt
│   │   ├── evolutionEngine.js   # Analyses user tone → adjusts traits
│   │   └── openaiService.js     # OpenAI API wrapper
│   ├── server.js                # Express entry point
│   ├── .env.example             # Environment variable template
│   └── package.json
│
├── frontend/                    # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx           # Nav bar + page wrapper
│   │   │   ├── PersonaBuilder.jsx   # Trait sliders + create form
│   │   │   ├── PersonaCard.jsx      # Persona preview card
│   │   │   ├── MessageBubble.jsx    # Individual chat message
│   │   │   ├── TypingIndicator.jsx  # Animated "AI is thinking" dots
│   │   │   ├── TraitSlider.jsx      # Single trait slider with label
│   │   │   └── TraitEvolutionPanel.jsx  # Live trait evolution display
│   │   ├── pages/
│   │   │   ├── HomePage.jsx     # Persona builder + list
│   │   │   └── ChatPage.jsx     # Full chat interface
│   │   ├── utils/
│   │   │   └── api.js           # Axios API helper functions
│   │   ├── App.jsx              # Router setup
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Tailwind + global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md                    # ← You are here
```

---

## 🚀 How to Run the Project

### Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18 or later
- [MongoDB](https://www.mongodb.com/try/download/community) (local) OR a free [MongoDB Atlas](https://cloud.mongodb.com/) cluster
- An [OpenAI API key](https://platform.openai.com/api-keys)

---

### Step 1 — Set up the Backend

```bash
cd backend
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/personaforge
OPENAI_API_KEY=sk-...your-key-here...
OPENAI_MODEL=gpt-4o
```

Start the backend:

```bash
# Development (auto-restarts on file changes)
npm run dev

# OR production
npm start
```

You should see:
```
✅  MongoDB connected
🚀  PersonaForge API running on http://localhost:5000
```

---

### Step 2 — Set up the Frontend

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint                    | Description                          |
|--------|-----------------------------|--------------------------------------|
| POST   | `/persona/create`           | Create a new persona                 |
| GET    | `/persona/all`              | List all personas                    |
| GET    | `/persona/:id`              | Get a single persona                 |
| DELETE | `/persona/:id`              | Delete a persona                     |
| POST   | `/chat/:personaId`          | Send a message, get AI reply         |
| GET    | `/chat/:personaId/history`  | Get all chat sessions for a persona  |
| GET    | `/chat/session/:chatId`     | Get a specific chat session          |
| GET    | `/health`                   | Server + DB health check             |

---

## 🧠 How the AI Personality Engine Works

### Trait → Prompt Mapping

Each trait slider (0–100) produces different language in the system prompt:

| Trait      | Low (0–25)         | High (75–100)            |
|------------|--------------------|--------------------------|
| Confidence | Hesitant, uncertain | Bold, declarative, direct |
| Empathy    | Cold, fact-focused  | Warm, emotionally attuned |
| Aggression | Gentle, peaceful    | Blunt, confrontational    |
| Humor      | Completely serious  | Witty, joke-heavy         |

### Evolution Logic

After each user message, the backend analyses the user's tone with keyword detection:

- **Aggressive language** → aggression +3, empathy -2
- **Logical reasoning** → aggression -2, confidence +2  
- **Kind words** → empathy +3, aggression -2, humor +1
- **Humor / laughing** → humor +3, aggression -1
- **Negativity** → empathy +2, confidence -1

Changes are small (1–4 points) so evolution feels gradual and natural. The frontend sidebar shows live deltas with `+N` / `-N` indicators.

### Memory Window

The last **10 messages** are included in every OpenAI API call so the persona remembers the recent conversation context.

---

## ⚙️ Configuration

| Variable        | Default                                   | Description              |
|-----------------|-------------------------------------------|--------------------------|
| `PORT`          | `5000`                                    | Backend server port      |
| `MONGODB_URI`   | `mongodb://localhost:27017/personaforge`  | MongoDB connection string |
| `OPENAI_API_KEY`| —                                         | Your OpenAI API key      |
| `OPENAI_MODEL`  | `gpt-4o`                                  | Model to use             |

---

## 💡 Tips

- **MongoDB Atlas** (free tier): Replace `MONGODB_URI` with your Atlas connection string.
- **GPT-3.5**: Change `OPENAI_MODEL=gpt-3.5-turbo` to reduce API costs during development.
- **Production**: Set `VITE_API_BASE_URL=https://your-backend.com` in `frontend/.env` and update CORS origins in `server.js`.
