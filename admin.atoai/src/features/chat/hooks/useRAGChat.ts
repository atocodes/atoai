"use client";

import { useState } from "react";
import { ChatMessage } from "../types/chat.types";
import { chatService } from "../services/chat.service";

export function useRAGChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "bot",
      text: "System initialized. Ask any question about your ingested knowledge base, documents, and technical notes.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    const userMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      sender: "user",
      text: question,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.askRAG(question);
      const botMsg: ChatMessage = {
        id: "msg_bot_" + Date.now(),
        sender: "bot",
        text: response.answer || "No response received.",
        sources: response.sources || [],
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setError(err.message || "Failed to communicate with RAG service");
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        id: "initial",
        sender: "bot",
        text: "Chat cleared. Ready for new questions.",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
    clearMessages,
  };
}
