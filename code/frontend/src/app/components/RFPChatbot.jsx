import { useState, useRef, useEffect } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Change this if your FastAPI runs on a different port
const API_BASE = "http://localhost:8000";

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function RFPChatbot({ authToken, onComplete }) {
  /**
   * Props:
   *   authToken  - the JWT token from your login (stored in localStorage / context)
   *   onComplete - callback called when BidRequest is created, receives { bid_request_id, order }
   */

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! 👋 I'm here to help you find the right service. What kind of service are you looking for today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const userText = input.trim();
    if (!userText || loading || done) return;

    // Add user message to chat immediately
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat/rfp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          // Send the full conversation every time (skip the initial greeting)
          conversation: newMessages.slice(1),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      // Add AI reply to chat
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.message },
      ]);

      // If the request is complete, notify the parent component
      if (data.status === "complete") {
        setDone(true);
        if (onComplete) {
          onComplete({
            bid_request_id: data.bid_request_id,
            order: data.order,
          });
        }
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "⚠️ Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span>🤖</span>
        <span style={{ marginLeft: 8, fontWeight: 600 }}>Syncro Assistant</span>
      </div>

      {/* Message list */}
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              ...(msg.role === "user" ? styles.userBubble : styles.aiBubble),
            }}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.bubble, ...styles.aiBubble, opacity: 0.6 }}>
            Typing…
          </div>
        )}

        {done && (
          <div style={styles.doneBanner}>
            ✅ Your request has been sent to sellers! Check your bids soon.
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          type="text"
          placeholder={done ? "Request submitted!" : "Type your message…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || done}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: loading || done || !input.trim() ? 0.5 : 1,
          }}
          onClick={sendMessage}
          disabled={loading || done || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: 480,
    height: 520,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
    fontFamily: "sans-serif",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  header: {
    background: "#6c63ff",
    color: "#fff",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    fontSize: 15,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 16,
    background: "#f8f9fc",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  bubble: {
    maxWidth: "78%",
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  userBubble: {
    alignSelf: "flex-end",
    background: "#6c63ff",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: "flex-start",
    background: "#fff",
    color: "#1a202c",
    border: "1px solid #e2e8f0",
    borderBottomLeftRadius: 4,
  },
  doneBanner: {
    alignSelf: "center",
    background: "#c6f6d5",
    color: "#276749",
    padding: "10px 16px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    textAlign: "center",
  },
  inputRow: {
    display: "flex",
    borderTop: "1px solid #e2e8f0",
    background: "#fff",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    outline: "none",
    fontSize: 14,
  },
  sendBtn: {
    padding: "12px 20px",
    background: "#6c63ff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
};
