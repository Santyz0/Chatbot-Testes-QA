import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import "./App.css";

const API_URL = "http://localhost:3001";

type Message = { role: string; text: string };
type ChatSession = { id: string; title: string; messages: Message[]; loaded: boolean };

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/sessions`)
      .then(r => r.json())
      .then((data: { id: string; title: string }[]) => {
        if (data.length === 0) {
          const blank = { id: crypto.randomUUID(), title: "Nova Conversa", messages: [], loaded: true };
          setSessions([blank]);
          setActiveId(blank.id);
        } else {
          const restored = data.map(s => ({ ...s, messages: [], loaded: false }));
          setSessions(restored);
          setActiveId(restored[0].id);
          loadMessages(restored[0].id);
        }
      })
      .catch(() => {
        const blank = { id: crypto.randomUUID(), title: "Nova Conversa", messages: [], loaded: true };
        setSessions([blank]);
        setActiveId(blank.id);
      });
  }, []);


  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus();
  }, [renamingId]);

  const loadMessages = (sessionId: string) => {
    fetch(`${API_URL}/sessions/${sessionId}/messages`)
      .then(r => r.json())
      .then((data: { role: string; content: string }[]) => {
        setSessions(prev => prev.map(s => {
          if (s.id !== sessionId) return s;
          return { ...s, loaded: true, messages: data.map(m => ({ role: m.role, text: m.content })) };
        }));
      });
  };

  const handleSelectSession = (id: string) => {
    setActiveId(id);
    loadMessages(id);
  };

  const createNewChat = () => {
    const newSession: ChatSession = { id: crypto.randomUUID(), title: "Nova Conversa", messages: [], loaded: true };
    setSessions(prev => [newSession, ...prev]);
    setActiveId(newSession.id);
  };

  // ── Renomear ──────────────────────────────────────────────────────────────────
  const startRenaming = (session: ChatSession) => {
    setRenamingId(session.id);
    setRenameValue(session.title);
  };

  const commitRename = async (sessionId: string) => {
    const newTitle = renameValue.trim();
    setRenamingId(null);

    if (!newTitle) return; 

    
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s));

   
    const target = sessions.find(s => s.id === sessionId);
    const isPersisted = target?.messages.some(m => m.role === "agent") || target?.loaded === false;
    if (isPersisted) {
      await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle })
      });
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, sessionId: string) => {
    if (e.key === "Enter") commitRename(sessionId);
    if (e.key === "Escape") setRenamingId(null); // cancela sem salvar
  };

  // ── Deletar ───────────────────────────────────────────────────────────────────
  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteId) return;
    const idToDelete = confirmDeleteId;
    setConfirmDeleteId(null);

    const target = sessions.find(s => s.id === idToDelete);
    const isPersisted = target?.messages.some(m => m.role === "agent") || target?.loaded === false;
    if (isPersisted) {
      await fetch(`${API_URL}/sessions/${idToDelete}`, { method: "DELETE" });
    }

    const remaining = sessions.filter(s => s.id !== idToDelete);
    setSessions(remaining);

    if (activeId === idToDelete) {
      if (remaining.length > 0) {
        setActiveId(remaining[0].id);
        loadMessages(remaining[0].id);
      } else {
        const blank = { id: crypto.randomUUID(), title: "Nova Conversa", messages: [], loaded: true };
        setSessions([blank]);
        setActiveId(blank.id);
      }
    }
  };

  const activeSession = sessions.find(s => s.id === activeId);
  const confirmSession = sessions.find(s => s.id === confirmDeleteId);

  const sendMessage = async () => {
    if (!message.trim() || !activeSession) return;
    setLoading(true);
    const userText = message;
    setMessage("");

    setSessions(prev => prev.map(s => {
      if (s.id !== activeId) return s;
      const newTitle = s.messages.length === 0 ? userText.substring(0, 30) + "..." : s.title;
      return { ...s, title: newTitle, messages: [...s.messages, { role: "user", text: userText }] };
    }));

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, sessionId: activeSession.id })
      });
      const data = await res.json();

      setSessions(prev => prev.map(s => {
        if (s.id !== activeId) return s;
        return {
          ...s,
          id: data.sessionId,
          title: data.sessionTitle ?? s.title,
          messages: [...s.messages, { role: "agent", text: data.reply }]
        };
      }));

      if (data.sessionId !== activeId) setActiveId(data.sessionId);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) sendMessage();
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <button className="new-chat-btn" onClick={createNewChat}>+ Novo Chat</button>
        <div className="history-list">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`history-item ${session.id === activeId ? "active" : ""}`}
              onClick={() => { if (renamingId !== session.id) handleSelectSession(session.id); }}
            >
              {/* ── Modo edição ou modo leitura ── */}
              {renamingId === session.id ? (
                <input
                  ref={renameInputRef}
                  className="rename-input"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => handleRenameKeyDown(e, session.id)}
                  onBlur={() => commitRename(session.id)}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span className="history-title">{session.title}</span>
              )}

              {/* ── Botões (ocultos durante renomeação) ── */}
              {renamingId !== session.id && (
                <div className="item-actions">
                  <button
                    className="action-btn rename-btn"
                    onClick={e => { e.stopPropagation(); startRenaming(session); }}
                    title="Renomear"
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={e => { e.stopPropagation(); setConfirmDeleteId(session.id); }}
                    title="Excluir"
                  >
                    🗑
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-area">
        <h1>{activeSession?.title ?? "..."}</h1>
        <div className="chat-box">
          {activeSession?.messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.role === "user" ? "user" : "agent"}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="loading">⏳ Processando...</div>}
        </div>
        <div className="input-area">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Adicione uma mensagem..."
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !message.trim()}>Enviar</button>
        </div>
      </main>

      {confirmDeleteId && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Excluir conversa?</h2>
            <p>"{confirmSession?.title}" será excluída permanentemente.</p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
              <button className="modal-confirm" onClick={handleDeleteConfirmed}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;