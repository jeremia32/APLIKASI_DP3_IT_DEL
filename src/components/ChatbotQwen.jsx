import React, { useState } from "react";
import axios from "axios";
import { Button, Input, Card, Avatar, Typography, Spin, Tooltip, Divider } from "antd";
import { MessageOutlined, CloseOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ChatbotQwen = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setOpen(!open);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setHistory([...history, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/ai/generate", {
        model: "qwen-plus",
        input,
      });

      const botMessage = { role: "bot", content: res.data.result };
      setHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      setHistory((prev) => [...prev, { role: "bot", content: "❌ Gagal menjawab. Coba lagi nanti." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}>
      {open ? (
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar icon={<RobotOutlined />} />
              <Text strong style={{ fontSize: 16 }}>
                JernachoAI
              </Text>
            </div>
          }
          size="small"
          extra={
            <Tooltip title="Tutup">
              <CloseOutlined onClick={toggleChat} style={{ cursor: "pointer" }} />
            </Tooltip>
          }
          style={{ width: 320, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          bodyStyle={{ padding: 12 }}
        >
          <div
            style={{
              maxHeight: 250,
              overflowY: "auto",
              paddingRight: 8,
              marginBottom: 12,
            }}
          >
            {history.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom: 10,
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}
              >
                <Avatar
                  size="small"
                  icon={msg.role === "user" ? <UserOutlined /> : <RobotOutlined />}
                  style={{
                    backgroundColor: msg.role === "user" ? "#1890ff" : "#f5222d",
                    marginInline: 8,
                  }}
                />
                <div
                  style={{
                    background: msg.role === "user" ? "#e6f7ff" : "#fff1f0",
                    padding: "6px 12px",
                    borderRadius: 8,
                    maxWidth: 200,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: "center", margin: 10 }}>
                <Spin size="small" />
              </div>
            )}
          </div>
          <Input.Search placeholder="Ketik pesan..." value={input} onChange={(e) => setInput(e.target.value)} onSearch={sendMessage} enterButton={loading ? "..." : "Kirim"} disabled={loading} />
          <Divider style={{ margin: "8px 0" }}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Create by Kelompok 6 PA 3 TRPL 22
            </Text>
          </Divider>
        </Card>
      ) : (
        <Tooltip title="Tanya JernachoAI">
          <Button type="primary" icon={<MessageOutlined />} onClick={toggleChat} size="large" style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}>
            Tanya JernachoAI
          </Button>
          {/* <Button type="primary" shape="circle" icon={<MessageOutlined />} onClick={toggleChat} size="large" style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }} Tanya JernachoAI /> */}
        </Tooltip>
      )}
    </div>
  );
};

export default ChatbotQwen;
