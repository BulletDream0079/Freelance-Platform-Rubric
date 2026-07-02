import { useEffect, useRef, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function MessageThread({ jobId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  async function load() {
    try {
      const { data } = await api.get(`/messages/job/${jobId}`);
      setMessages(data);
      setError("");
    } catch (e) {
      setError(e.response?.data?.error || "Couldn't load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [jobId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/job/${jobId}`, { body: body.trim() });
      setMessages((m) => [...m, data]);
      setBody("");
    } catch (e) {
      setError(e.response?.data?.error || "Couldn't send message");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="card"><p className="muted">Loading messages…</p></div>;

  if (error && messages.length === 0) {
    return (
      <div className="card">
        <h3 className="card-title">Messages</h3>
        <p className="muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="card msg-card">
      <h3 className="card-title">Messages</h3>
      <div className="msg-list">
        {messages.length === 0 ? (
          <p className="muted small">No messages yet. Say hello 👋</p>
        ) : (
          messages.map((m) => {
            const mine = (m.sender?.id || m.sender) === user?.id;
            return (
              <div key={m.id} className={`msg-row ${mine ? "msg-mine" : ""}`}>
                {!mine && <Avatar user={m.sender} size={30} />}
                <div className="msg-bubble">
                  {!mine && <div className="msg-sender">{m.sender?.name}</div>}
                  <div className="msg-body">{m.body}</div>
                  <div className="msg-time">
                    {new Date(m.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: 10 }}>{error}</div>}

      <form className="msg-form" onSubmit={send}>
        <input
          className="input"
          placeholder="Type a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
        />
        <button className="btn btn-dark" disabled={sending || !body.trim()}>
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
