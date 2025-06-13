// src/components/FloatingFaqChat.jsx
import React, { useState } from "react";
import axios from "axios";
import faqList from "../../Server/faq.json"; // Pastikan path ini benar

const FloatingFaqChat = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFaqList, setShowFaqList] = useState(false);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
    if (open) setShowFaqList(false);
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/ai/ask", {
        question,
      });
      setAnswer(res.data.answer);
    } catch (error) {
      console.error("❌ Gagal:", error);
      setAnswer("Terjadi kesalahan saat memproses pertanyaan.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    fab: {
      position: "fixed",
      bottom: 24,
      right: 24,
      width: 60,
      height: 60,
      borderRadius: "50%",
      backgroundColor: "#007BFF",
      color: "#fff",
      border: "none",
      fontSize: "26px",
      cursor: "pointer",
      boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    panel: {
      position: "fixed",
      bottom: 100,
      right: 24,
      width: 340,
      maxHeight: 480,
      backgroundColor: "#fff",
      borderRadius: "12px",
      border: "1px solid #ddd",
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      display: "flex",
      flexDirection: "column",
      zIndex: 1000,
      overflow: "hidden",
    },

    header: {
      backgroundColor: "#007BFF",
      color: "#fff",
      padding: "12px 16px",
      fontSize: "16px",
      fontWeight: "bold",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    closeBtn: {
      background: "none",
      border: "none",
      color: "#fff",
      fontSize: "20px",
      cursor: "pointer",
    },

    content: {
      flex: 1,
      padding: "12px",
      backgroundColor: "#f6f7fb",
      overflowY: "auto",
    },

    inputArea: {
      display: "flex",
      gap: "8px",
      marginBottom: "10px",
    },

    input: {
      flex: 1,
      padding: "10px 14px",
      borderRadius: "20px",
      border: "1px solid #bbb",
      outline: "none",
      fontSize: "14px",
    },

    askBtn: {
      backgroundColor: "#007BFF",
      color: "#fff",
      border: "none",
      borderRadius: "20px",
      padding: "8px 16px",
      cursor: "pointer",
      fontSize: "14px",
    },

    answerBox: {
      backgroundColor: "#fff",
      padding: "10px 14px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      marginTop: "6px",
      fontSize: "14px",
      lineHeight: 1.6,
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    },

    faqToggleBtn: {
      marginTop: "12px",
      backgroundColor: "#28a745",
      color: "#fff",
      border: "none",
      borderRadius: "20px",
      padding: "8px 16px",
      cursor: "pointer",
      fontSize: "14px",
      width: "100%",
    },

    faqList: {
      marginTop: "12px",
    },

    faqItem: {
      backgroundColor: "#fff",
      borderRadius: "10px",
      padding: "10px 12px",
      marginBottom: "10px",
      border: "1px solid #ddd",
    },

    faqQuestion: {
      fontWeight: "bold",
      cursor: "pointer",
    },

    faqAnswer: {
      marginTop: "6px",
      paddingLeft: "12px",
      fontSize: "14px",
      color: "#333",
    },
  };

  return (
    <>
      {/* Tombol FAQ */}
      <button style={styles.fab} onClick={toggleOpen} title="FAQ Chatbot">
        💬
      </button>

      {open && (
        <div style={styles.panel}>
          {/* Header */}
          <div style={styles.header}>
            <span>💬 FAQ Chatbot</span>
            <button style={styles.closeBtn} onClick={toggleOpen}>
              ×
            </button>
          </div>

          {/* Konten */}
          <div style={styles.content}>
            {!showFaqList && (
              <>
                <div style={styles.inputArea}>
                  <input type="text" placeholder="Ketik pertanyaan..." value={question} onChange={(e) => setQuestion(e.target.value)} style={styles.input} onKeyDown={(e) => e.key === "Enter" && handleAsk()} />
                  <button style={styles.askBtn} onClick={handleAsk} disabled={loading}>
                    {loading ? "..." : "Tanya"}
                  </button>
                </div>

                {answer && (
                  <div style={styles.answerBox}>
                    <strong>Jawaban:</strong>
                    <p>{answer}</p>
                  </div>
                )}
              </>
            )}

            {/* Toggle FAQ list */}
            <button style={styles.faqToggleBtn} onClick={() => setShowFaqList((prev) => !prev)}>
              {showFaqList ? "Sembunyikan Semua FAQ" : "Lihat Semua FAQ"}
            </button>

            {showFaqList && (
              <div style={styles.faqList}>
                {faqList.map((faq, idx) => (
                  <div key={idx} style={styles.faqItem}>
                    <details>
                      <summary style={styles.faqQuestion}>{faq.question}</summary>
                      <p style={styles.faqAnswer}>{faq.answer}</p>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingFaqChat;
