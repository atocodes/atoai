"use client";

import React from "react";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Quote, Trash2 } from "lucide-react";
import { useRAGChat } from "../hooks/useRAGChat";

export function RAGChatStudio() {
  const {
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
    clearMessages,
  } = useRAGChat();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 bg-[#1C1C1C] border border-[#44423E]/80 rounded-[2px] shadow-sm overflow-hidden font-mono text-xs">
      {/* Studio Header */}
      <div className="p-3.5 border-b border-[#44423E]/60 bg-[#181818] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#9ECE9B]" />
          <span className="font-bold tracking-[1.5px] uppercase text-[#F2F0EA]">
            RAG INFERENCE STUDIO
          </span>
          <span className="text-[10px] uppercase text-[#A7A49E] px-1.5 py-0.5 rounded-[2px] bg-[#141414] border border-[#44423E]">
            POST /api/chat
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-[10px] text-[#73706A] uppercase tracking-wider hidden sm:inline">
            Retrieval-Augmented Generation
          </span>
          <button
            onClick={clearMessages}
            title="Clear Chat History"
            className="p-1 text-[#73706A] hover:text-[#DE8C85] hover:bg-[#DE8C85]/10 rounded-[2px] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area - Fits viewport cleanly */}
      <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center space-x-2 mb-1 text-[10px] text-[#73706A]">
              {m.sender === "user" ? (
                <>
                  <span>{m.timestamp}</span>
                  <span className="text-[#F2F0EA] font-bold">ADMIN</span>
                  <User className="w-3 h-3 text-[#A7A49E]" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-[#9ECE9B]" />
                  <span className="text-[#9ECE9B] font-bold">ATOAI RAG</span>
                  <span>{m.timestamp}</span>
                </>
              )}
            </div>

            <div
              className={`p-3.5 rounded-[2px] max-w-2xl leading-relaxed whitespace-pre-wrap select-text ${
                m.sender === "user"
                  ? "bg-[#282828] text-[#F2F0EA] border border-[#55534E]"
                  : "bg-[#141414] text-[#F2F0EA] border border-[#44423E]"
              }`}
            >
              {m.text}

              {/* Citations / Sources */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#44423E]/50 space-y-2">
                  <div className="text-[10px] font-bold tracking-[1.2px] uppercase text-[#9ECE9B] flex items-center space-x-1">
                    <Quote className="w-3 h-3" />
                    <span>RETRIEVED CONTEXT SOURCES ({m.sources.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {m.sources.map((src, i) => (
                      <div
                        key={i}
                        className="p-2 bg-[#1C1C1C] border border-[#44423E]/60 rounded-[2px] text-[11px]"
                      >
                        <div className="flex items-center justify-between text-[10px] text-[#A7A49E] mb-1">
                          <span className="font-bold text-[#F2F0EA]">
                            #{src.sourceId.substring(0, 16)} • {src.contentType}
                          </span>
                          <span className="text-[#9ECE9B] tabular-nums">
                            dist: {Number(src.distance).toFixed(4)}
                          </span>
                        </div>
                        <p className="text-[#A7A49E] truncate">{src.chunkContent}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-[#9ECE9B] p-2 bg-[#141414] border border-[#44423E] rounded-[2px] w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-[11px]">Generating answer from retrieved vector chunks...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-2 p-2.5 rounded-[2px] bg-[#DE8C85]/10 border border-[#DE8C85]/40 text-[#DE8C85] text-xs flex items-center space-x-2 shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-[#44423E]/60 bg-[#181818] flex items-center space-x-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the knowledge base..."
          className="flex-1 bg-[#141414] border border-[#44423E] focus:border-[#F2F0EA] text-[#F2F0EA] rounded-[2px] px-3.5 py-2.5 text-xs outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 bg-[#F2F0EA] hover:bg-white text-[#141414] font-bold rounded-[2px] uppercase tracking-wider flex items-center space-x-1.5 transition-colors disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          <span>SEND</span>
        </button>
      </form>
    </div>
  );
}
