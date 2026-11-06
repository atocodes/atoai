"use client";

import React, { useState } from "react";
import { Source } from "../types/source.types";
import {
  X,
  Radio,
  Globe,
  Layers,
  ExternalLink,
  Power,
  Edit3,
  Trash2,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Code,
  Info,
} from "lucide-react";

interface SourceDrawerProps {
  source: Source | null;
  onClose: () => void;
  onEdit: (source: Source) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SourceDrawer({
  source,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
}: SourceDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!source) return null;

  const isActive = source.status === "ACTIVE";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs font-mono animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#1C1C1C] border-l border-[#44423E] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[#44423E]/60 flex items-center justify-between bg-[#141414]">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-[2px] bg-[#282828] border border-[#44423E] text-[#9ECE9B]">
                {source.type === "TELEGRAM" ? (
                  <Radio className="w-4 h-4 text-[#7AA2F7]" />
                ) : (
                  <Globe className="w-4 h-4 text-[#BB9AF7]" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-[#73706A] block">
                  SOURCE INSPECTOR
                </span>
                <h3 className="text-sm font-bold text-[#F2F0EA] truncate max-w-xs sm:max-w-md">
                  {source.name || source.username || source.channelId || "Source Details"}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 border border-[#44423E] text-[#73706A] hover:text-[#F2F0EA] hover:bg-[#282828] rounded-[2px] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Action Bar */}
            <div className="p-3 bg-[#141414] border border-[#44423E]/70 rounded-[2px] flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[2px] text-xs font-bold uppercase tracking-wider ${
                    isActive
                      ? "bg-[#9ECE9B]/15 text-[#9ECE9B] border border-[#9ECE9B]/40"
                      : "bg-[#E0AF68]/15 text-[#E0AF68] border border-[#E0AF68]/40"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-[#9ECE9B] animate-pulse" : "bg-[#E0AF68]"
                    }`}
                  />
                  <span>{source.status}</span>
                </span>
                <span className="text-[10px] text-[#73706A]">
                  {isActive ? "Ingestion Enabled" : "Ingestion Paused"}
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => onToggleStatus(source.id)}
                  className={`px-2.5 py-1 text-xs uppercase tracking-wider rounded-[2px] border flex items-center space-x-1 transition-colors ${
                    isActive
                      ? "border-[#E0AF68]/50 text-[#E0AF68] hover:bg-[#E0AF68]/10"
                      : "border-[#9ECE9B]/50 text-[#9ECE9B] hover:bg-[#9ECE9B]/10"
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{isActive ? "PAUSE" : "ENABLE"}</span>
                </button>
                <button
                  onClick={() => onEdit(source)}
                  className="px-2.5 py-1 text-xs uppercase tracking-wider rounded-[2px] border border-[#44423E] hover:border-[#55534E] text-[#F2F0EA] hover:bg-[#282828] flex items-center space-x-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>EDIT</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to permanently delete this source?")) {
                      onDelete(source.id);
                      onClose();
                    }
                  }}
                  className="p-1 border border-[#44423E] hover:border-[#DE8C85] text-[#A7A49E] hover:text-[#DE8C85] hover:bg-[#DE8C85]/10 rounded-[2px] transition-colors"
                  title="Delete Source"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Key Properties Grid */}
            <div className="border border-[#44423E]/60 bg-[#141414] p-4 rounded-[2px] space-y-3">
              <span className="text-[10px] uppercase tracking-[1.5px] text-[#A7A49E] font-bold block">
                SOURCE ATTRIBUTES
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#73706A] block">SOURCE TYPE</span>
                  <span className="text-[#F2F0EA] font-bold">{source.type}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#73706A] block">TELEGRAM USERNAME</span>
                  {source.username ? (
                    <div className="flex items-center space-x-1 text-[#9ECE9B]">
                      <span>@{source.username}</span>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#73706A] hover:text-[#F2F0EA]"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#73706A]">None</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-[#73706A] block">CHANNEL ID</span>
                  <span className="text-[#F2F0EA] font-mono">
                    {source.channelId || "Auto-detect / None"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#73706A] block">SOURCE ID</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-[#A7A49E] font-mono truncate max-w-[140px]">
                      {source.id}
                    </span>
                    <button
                      onClick={() => copyToClipboard(source.id)}
                      title="Copy Source ID"
                      className="text-[#73706A] hover:text-[#F2F0EA]"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-[#9ECE9B]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {source.url && (
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-[#73706A] block">PUBLIC URL</span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#7AA2F7] hover:underline flex items-center space-x-1 truncate"
                    >
                      <span>{source.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}

                {source.description && (
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-[#73706A] block">DESCRIPTION / NOTES</span>
                    <p className="text-xs text-[#F2F0EA] leading-relaxed mt-0.5">
                      {source.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Telegram Ingestion Guide */}
            {source.type === "TELEGRAM" && (
              <div className="border border-[#7AA2F7]/30 bg-[#7AA2F7]/5 p-4 rounded-[2px] space-y-2">
                <div className="flex items-center space-x-2 text-[#7AA2F7] text-xs font-bold uppercase tracking-wider">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>How Ingestion Works</span>
                </div>
                <ol className="text-[11px] text-[#A7A49E] space-y-1.5 list-decimal list-inside leading-relaxed pl-1">
                  <li>
                    Add your ATOAI Telegram Bot as an <strong className="text-[#F2F0EA]">Administrator</strong> in the channel.
                  </li>
                  <li>
                    Whenever a new channel message or update is posted, the bot receives it via webhook.
                  </li>
                  <li>
                    ATOAI validates the channel against your active sources list, runs smart semantic chunking, and generates vector embeddings.
                  </li>
                  <li>
                    You can pause ingestion at any time by toggling this channel to <strong className="text-[#E0AF68]">PAUSED</strong>.
                  </li>
                </ol>
              </div>
            )}

            {/* Timestamp Information */}
            <div className="border border-[#44423E]/40 p-3 bg-[#141414] rounded-[2px] flex items-center justify-between text-[10px] text-[#73706A]">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>CREATED: {new Date(source.createdAt).toLocaleString()}</span>
              </div>
              <div>UPDATED: {new Date(source.updatedAt).toLocaleString()}</div>
            </div>

            {/* Raw JSON Toggle */}
            <div className="space-y-2">
              <button
                onClick={() => setShowJson(!showJson)}
                className="text-[10px] uppercase tracking-wider text-[#A7A49E] hover:text-[#F2F0EA] flex items-center space-x-1"
              >
                <Code className="w-3 h-3" />
                <span>{showJson ? "HIDE RAW JSON" : "VIEW RAW DATABASE JSON"}</span>
              </button>

              {showJson && (
                <pre className="p-3 bg-[#141414] border border-[#44423E] rounded-[2px] text-[10px] text-[#9ECE9B] overflow-x-auto">
                  {JSON.stringify(source, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
