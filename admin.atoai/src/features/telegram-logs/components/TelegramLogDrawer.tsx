"use client";

import React from "react";
import { TelegramLogEntry } from "../types/telegram-log.types";
import {
  X,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Calendar,
  User,
  Radio,
  Layers,
  FileText,
} from "lucide-react";

interface TelegramLogDrawerProps {
  log: TelegramLogEntry | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onInspectDocument?: (documentId: string) => void;
}

export function TelegramLogDrawer({
  log,
  onClose,
  onDelete,
  onInspectDocument,
}: TelegramLogDrawerProps) {
  if (!log) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusHeader = () => {
    switch (log.status) {
      case "success":
        return (
          <div className="flex items-center space-x-2 text-[#9ECE9B] bg-[#9ECE9B]/10 border border-[#9ECE9B]/30 px-3 py-1.5 rounded-[2px] font-mono text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>INGESTION SUCCESSFUL</span>
          </div>
        );
      case "skipped":
        return (
          <div className="flex items-center space-x-2 text-[#E0AF68] bg-[#E0AF68]/10 border border-[#E0AF68]/30 px-3 py-1.5 rounded-[2px] font-mono text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>MESSAGE SKIPPED</span>
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center space-x-2 text-[#F7768E] bg-[#F7768E]/10 border border-[#F7768E]/30 px-3 py-1.5 rounded-[2px] font-mono text-xs font-bold">
            <XCircle className="w-4 h-4" />
            <span>INGESTION FAILED</span>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#1C1C1C] border-l border-[#44423E] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#44423E]/60 flex items-center justify-between bg-[#171717]">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-[#9ECE9B]" />
            <span className="font-mono text-xs font-bold uppercase tracking-[1.5px] text-[#F2F0EA]">
              TELEGRAM LOG #{log.messageId}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#A7A49E] hover:text-[#F2F0EA] rounded-[2px] hover:bg-[#282828] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 font-mono text-xs">
          {/* Status banner */}
          {getStatusHeader()}

          {/* Quick Details Grid */}
          <div className="grid grid-cols-2 gap-2 border border-[#44423E]/60 bg-[#141414] p-3 rounded-[2px]">
            <div>
              <span className="text-[10px] text-[#73706A] uppercase block">SOURCE EVENT</span>
              <span className="text-[#F2F0EA] font-bold">{log.source}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#73706A] uppercase block">CATEGORY</span>
              <span className="text-[#9ECE9B] uppercase font-bold">{log.contentType || "N/A"}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#73706A] uppercase block">CHAT / CHANNEL</span>
              <span className="text-[#F2F0EA]">{log.chatTitle || "Channel"}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#73706A] uppercase block">AUTHOR</span>
              <span className="text-[#F2F0EA]">{log.author || "System"}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#73706A] uppercase block">VECTOR CHUNKS</span>
              <span className="text-[#F2F0EA]">{log.chunksCount} chunks generated</span>
            </div>
            <div>
              <span className="text-[10px] text-[#73706A] uppercase block">TIMESTAMP</span>
              <span className="text-[#A7A49E]">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Processing Note / Reason / Error Stack */}
          {log.reason && (
            <div className="space-y-1">
              <span className="text-[10px] text-[#A7A49E] uppercase tracking-[1.2px] block">
                {log.status === "failed" ? "ERROR DETAILS" : "PROCESSING REASON"}
              </span>
              <div
                className={`p-3 rounded-[2px] border ${
                  log.status === "failed"
                    ? "bg-[#F7768E]/10 border-[#F7768E]/30 text-[#F7768E]"
                    : "bg-[#282828] border-[#44423E] text-[#E0AF68]"
                } text-[11px] font-mono whitespace-pre-wrap break-words`}
              >
                {log.reason}
              </div>
            </div>
          )}

          {/* Ingested Document Link */}
          {log.documentId && (
            <div className="space-y-1">
              <span className="text-[10px] text-[#A7A49E] uppercase tracking-[1.2px] block">
                CORRESPONDING KNOWLEDGE DOCUMENT
              </span>
              <div className="flex items-center justify-between p-3 rounded-[2px] bg-[#141414] border border-[#44423E]">
                <div className="flex items-center space-x-2 text-[#9ECE9B]">
                  <FileText className="w-4 h-4" />
                  <span className="truncate max-w-xs">{log.documentId}</span>
                </div>
                {onInspectDocument && (
                  <button
                    onClick={() => {
                      onClose();
                      onInspectDocument(log.documentId!);
                    }}
                    className="px-2 py-1 text-[10px] bg-[#282828] hover:bg-[#333] border border-[#55534E] text-[#F2F0EA] rounded-[2px] flex items-center space-x-1 transition-colors"
                  >
                    <span>OPEN DOCUMENT</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Message Content Snippet */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#A7A49E] uppercase tracking-[1.2px]">
                MESSAGE RAW TEXT CONTENT
              </span>
              {log.rawSnippet && (
                <button
                  onClick={() => copyToClipboard(log.rawSnippet!)}
                  className="text-[10px] text-[#73706A] hover:text-[#F2F0EA] flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>COPY</span>
                </button>
              )}
            </div>
            <div className="bg-[#141414] border border-[#44423E] p-3 rounded-[2px] font-sans text-xs text-[#F2F0EA] whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
              {log.rawSnippet || <span className="italic text-[#73706A] font-mono">No text content</span>}
            </div>
          </div>

          {/* Metadata JSON */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-[#A7A49E] uppercase tracking-[1.2px] block">
                METADATA PAYLOAD
              </span>
              <pre className="bg-[#141414] border border-[#44423E] p-3 rounded-[2px] text-[10px] text-[#A7A49E] overflow-x-auto max-h-40">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-[#44423E]/60 bg-[#171717] flex items-center justify-between font-mono text-xs">
          <button
            onClick={() => {
              if (confirm("Delete this Telegram log entry?")) {
                onDelete(log.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 text-[11px] text-[#F7768E] hover:bg-[#F7768E]/10 border border-[#F7768E]/40 rounded-[2px] flex items-center space-x-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>DELETE LOG</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[11px] bg-[#282828] hover:bg-[#333] border border-[#55534E] text-[#F2F0EA] rounded-[2px] transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
