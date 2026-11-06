"use client";

import React from "react";
import {
  TelegramLogEntry,
  TelegramLogStatus,
} from "../types/telegram-log.types";
import {
  Search,
  RefreshCw,
  Trash2,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Radio,
  Layers,
  User,
} from "lucide-react";

interface TelegramLogTableProps {
  logs: TelegramLogEntry[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  statusFilter: TelegramLogStatus | "all";
  search: string;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: TelegramLogStatus | "all") => void;
  onPageChange: (page: number) => void;
  onInspect: (log: TelegramLogEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onRefresh: () => void;
}

export function TelegramLogTable({
  logs,
  loading,
  total,
  page,
  limit,
  statusFilter,
  search,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onInspect,
  onDelete,
  onClearAll,
  onRefresh,
}: TelegramLogTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const getStatusBadge = (status: TelegramLogStatus) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-[2px] bg-[#9ECE9B]/10 text-[#9ECE9B] border border-[#9ECE9B]/30 text-[10px] font-mono uppercase font-bold tracking-[1px]">
            <CheckCircle2 className="w-3 h-3" />
            <span>INGESTED</span>
          </span>
        );
      case "skipped":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-[2px] bg-[#E0AF68]/10 text-[#E0AF68] border border-[#E0AF68]/30 text-[10px] font-mono uppercase font-bold tracking-[1px]">
            <AlertTriangle className="w-3 h-3" />
            <span>SKIPPED</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-[2px] bg-[#F7768E]/10 text-[#F7768E] border border-[#F7768E]/30 text-[10px] font-mono uppercase font-bold tracking-[1px]">
            <XCircle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="border border-[#44423E]/60 bg-[#1C1C1C] rounded-[2px] overflow-hidden flex flex-col font-mono">
      {/* Table Toolbar */}
      <div className="p-3 sm:p-3.5 border-b border-[#44423E]/60 bg-[#171717] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="flex-1 max-w-md w-full relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#73706A]" />
          <input
            type="text"
            placeholder="FILTER BY MESSAGE ID, SENDER, CHANNEL OR TEXT..."
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onPageChange(1);
            }}
            className="w-full bg-[#141414] border border-[#44423E] rounded-[2px] pl-9 pr-3 py-1.5 text-xs text-[#F2F0EA] placeholder-[#73706A] focus:outline-none focus:border-[#9ECE9B] transition-colors"
          />
        </div>

        {/* Center: Status filter tabs */}
        <div className="flex items-center space-x-1 border border-[#44423E]/70 p-0.5 rounded-[2px] bg-[#141414] overflow-x-auto">
          {(["all", "success", "skipped", "failed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                onStatusChange(s);
                onPageChange(1);
              }}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-[1.2px] rounded-[2px] transition-colors shrink-0 ${
                statusFilter === s
                  ? "bg-[#282828] text-[#F2F0EA] border border-[#55534E] font-bold"
                  : "text-[#A7A49E] hover:text-[#F2F0EA] hover:bg-[#1C1C1C]"
              }`}
            >
              {s === "all" ? "ALL LOGS" : s}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-between md:justify-end space-x-2 pt-1 md:pt-0">
          <button
            onClick={onRefresh}
            title="Refresh Ingestion Logs"
            className="p-1.5 text-[#A7A49E] hover:text-[#F2F0EA] border border-[#44423E] rounded-[2px] bg-[#1C1C1C] hover:bg-[#282828] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onClearAll}
            disabled={total === 0}
            className="px-2.5 py-1.5 text-[10px] uppercase tracking-[1px] text-[#F7768E] hover:bg-[#F7768E]/10 border border-[#F7768E]/40 rounded-[2px] transition-colors flex items-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3 h-3" />
            <span>CLEAR ALL</span>
          </button>
        </div>
      </div>

      {/* Mobile Card List (Visible only on < md) */}
      <div className="md:hidden divide-y divide-[#282828]">
        {loading ? (
          <div className="p-8 text-center text-[#73706A]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#9ECE9B] mb-2" />
            <span>LOADING TELEGRAM LOGS...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-[#73706A]">
            <Radio className="w-6 h-6 mx-auto mb-1 text-[#55534E]" />
            <span className="text-xs block">NO TELEGRAM INGESTION LOGS RECORDED</span>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              onClick={() => onInspect(log)}
              className="p-3.5 hover:bg-[#242424] active:bg-[#282828] cursor-pointer space-y-2 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[#F2F0EA] font-bold text-xs">#{log.messageId}</span>
                  <span className="text-[10px] text-[#73706A]">({log.source})</span>
                </div>
                {getStatusBadge(log.status)}
              </div>

              <p className="text-xs font-sans text-[#C8C5BC] line-clamp-2 leading-relaxed">
                {log.rawSnippet || <span className="italic text-[#73706A] font-mono">No text content</span>}
              </p>

              {log.reason && log.status !== "success" && (
                <div className="text-[10px] text-[#E0AF68] bg-[#E0AF68]/10 border border-[#E0AF68]/20 px-2 py-1 rounded-[2px] truncate">
                  {log.reason}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-[#73706A] pt-1">
                <div className="flex items-center space-x-2 truncate max-w-[200px]">
                  <span>{log.chatTitle || "Channel"}</span>
                  <span>&bull;</span>
                  <span>{formatDate(log.createdAt)}</span>
                </div>

                <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onInspect(log)}
                    className="p-1.5 text-[#A7A49E] hover:text-[#9ECE9B] rounded-[2px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(log.id)}
                    className="p-1.5 text-[#A7A49E] hover:text-[#F7768E] rounded-[2px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Main Table (Visible only on md and above) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#44423E]/60 bg-[#141414] text-[10px] uppercase tracking-[1.2px] text-[#A7A49E]">
              <th className="py-2.5 px-4 font-bold">STATUS</th>
              <th className="py-2.5 px-4 font-bold">MESSAGE ID & SOURCE</th>
              <th className="py-2.5 px-4 font-bold">CHAT / AUTHOR</th>
              <th className="py-2.5 px-4 font-bold">CONTENT PREVIEW</th>
              <th className="py-2.5 px-4 font-bold">CHUNKS</th>
              <th className="py-2.5 px-4 font-bold">TIMESTAMP</th>
              <th className="py-2.5 px-4 font-bold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#282828]">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#73706A]">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#9ECE9B]" />
                    <span>LOADING TELEGRAM LOGS...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#73706A]">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Radio className="w-6 h-6 text-[#55534E]" />
                    <span className="text-xs">NO TELEGRAM INGESTION LOGS RECORDED</span>
                    <span className="text-[10px]">
                      Incoming messages via webhook or bot will appear here automatically.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => onInspect(log)}
                  className="hover:bg-[#242424] cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-[#F2F0EA] font-bold">#{log.messageId}</div>
                    <div className="text-[10px] text-[#73706A]">{log.source}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-[#F2F0EA] truncate max-w-[140px]">
                      {log.chatTitle || "Channel"}
                    </div>
                    <div className="text-[10px] text-[#A7A49E] truncate max-w-[140px]">
                      {log.author || "System"}
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs sm:max-w-md">
                    <p className="truncate text-[#C8C5BC] font-sans text-xs">
                      {log.rawSnippet || <span className="italic text-[#73706A] font-mono">No text content</span>}
                    </p>
                    {log.reason && log.status !== "success" && (
                      <p className="text-[10px] text-[#E0AF68] truncate mt-0.5">
                        {log.reason}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {log.chunksCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-[#282828] text-[#9ECE9B] border border-[#55534E] text-[10px]">
                        {log.chunksCount} chunk{log.chunksCount > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-[#73706A] text-[10px]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-[11px] text-[#A7A49E]">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => onInspect(log)}
                        title="View Full Ingestion Details"
                        className="p-1.5 text-[#A7A49E] hover:text-[#9ECE9B] hover:bg-[#282828] rounded-[2px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(log.id)}
                        title="Delete this Log Entry"
                        className="p-1.5 text-[#A7A49E] hover:text-[#F7768E] hover:bg-[#282828] rounded-[2px] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-[#44423E]/60 bg-[#171717] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#A7A49E]">
        <div>
          SHOWING {logs.length > 0 ? (page - 1) * limit + 1 : 0} -{" "}
          {Math.min(page * limit, total)} OF {total.toLocaleString()} LOGS
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="p-1 text-[#A7A49E] hover:text-[#F2F0EA] border border-[#44423E] rounded-[2px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#282828]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            PAGE {page} OF {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            className="p-1 text-[#A7A49E] hover:text-[#F2F0EA] border border-[#44423E] rounded-[2px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#282828]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
