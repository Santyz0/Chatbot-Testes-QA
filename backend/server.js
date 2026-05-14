require("dotenv").config();
const tools = require("./tools");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const Database = require("better-sqlite3");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Banco de dados ────────────────────────────────────────────────────────────
const db = new Database("chat.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );
`);

// Helpers
function getOrCreateSession(sessionId, firstUserMessage) {
  const existing = db.prepare("SELECT * FROM sessions WHERE id = ?").get(sessionId);
  if (existing) return existing;

  const id = sessionId || uuidv4();
  const title = firstUserMessage.substring(0, 30) + (firstUserMessage.length > 30 ? "..." : "");
  db.prepare("INSERT INTO sessions (id, title, created_at) VALUES (?, ?, ?)").run(id, title, Date.now());
  return db.prepare("SELECT * FROM sessions WHERE id = ?").get(id);
}

function getMessages(sessionId) {
  return db.prepare("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC").all(sessionId);
}

function saveMessage(sessionId, role, content) {
  db.prepare("INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)").run(sessionId, role, content, Date.now());
}

const SYSTEM_PROMPT = `
Você é um Agente de IA inteligente.

Você pode:
- Conversar naturalmente
- Usar ferramentas quando necessário

TOOLS DISPONÍVEIS:
1. getTime → retorna horário atual
2. calculate(expression) → faz cálculos

Quando precisar usar uma ferramenta, responda no formato:
TOOL: nome_da_tool | argumento

Exemplo:
TOOL: calculate | 2+2

Caso contrário, responda normalmente.
`;

// ─── Rotas ────────────────────────────────────────────────────────────────────

// Lista todas as sessões (para carregar a sidebar)
app.get("/sessions", (req, res) => {
  const sessions = db.prepare("SELECT * FROM sessions ORDER BY created_at DESC").all();
  res.json(sessions);
});

// Retorna as mensagens de uma sessão (para restaurar o chat ao clicar na sidebar)
app.get("/sessions/:id/messages", (req, res) => {
  const messages = getMessages(req.params.id);
  res.json(messages);
});

// Deleta uma sessão e todas as suas mensagens
app.delete("/sessions/:id", (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM messages WHERE session_id = ?").run(id);
  db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
  res.json({ success: true });
});

// Renomeia uma sessão
app.patch("/sessions/:id", (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "Título inválido" });
  db.prepare("UPDATE sessions SET title = ? WHERE id = ?").run(title.trim(), id);
  res.json({ success: true });
});

// Envio de mensagem
app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  // Garante que a sessão existe no banco
  const session = getOrCreateSession(sessionId || uuidv4(), message);
  const id = session.id;

  // Salva mensagem do usuário
  saveMessage(id, "user", message);

  // Monta histórico para enviar à API (system prompt + mensagens salvas)
  const history = [
    { role: "system", content: SYSTEM_PROMPT },
    ...getMessages(id).map(m => ({ role: m.role === "agent" ? "assistant" : m.role, content: m.content }))
  ];

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      { model: "llama-3.1-8b-instant", messages: history },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" } }
    );

    let reply = response.data.choices[0].message.content;

    if (reply.startsWith("TOOL:")) {
      const [, rest] = reply.split("TOOL:");
      const [toolName, arg] = rest.split("|").map(s => s.trim());

      if (tools[toolName]) {
        const result = tools[toolName](arg);
        reply = `🛠️ Resultado: ${result}`;
        saveMessage(id, "assistant", reply);
      } else {
        reply = "Tool não encontrada";
        saveMessage(id, "assistant", reply);
      }
    } else {
      saveMessage(id, "assistant", reply);
    }

    res.json({ reply, sessionId: id, sessionTitle: session.title });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Erro no agente" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`🤖 Agente rodando em http://localhost:${process.env.PORT}`);
});