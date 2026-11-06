"use client";

import React from "react";
import { Source, SourceStatus, SourceType } from "../types/source.types";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Radio,
  Globe,
  Layers,
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  PauseCircle,
  Clock,
  Loader2,
  Power,
} from "lucide-react";

interface SourceTableProps {
  sources: Source[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  statusFilter: SourceStatus | "all";
  typeFilter: SourceType | "all";
  search: string;
  onSearchChange: (val: string) => void;
  onStatusChange: (status: SourceStatus | "all") => void;
  onTypeChange: (type: SourceType | "all") => void;
  onPageChange: (page: number) => void;
  onInspect: (source: Source) => void;
  onEdit: (source: Source) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onOpenCreate: () => void;
  onRefresh: () => void;
}

export function SourceTable({
  sources,
  loading,
  total,
  page,
  limit,
  statusFilter,
  typeFilter,
  search,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onPageChange,
  onInspect,
  onEdit,
  onDelete,
  onToggleStatus,
  onOpenCreate,
  onRefresh,
}: SourceTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const getTypeBadge = (type: SourceType) => {
    switch (type) {
      case "TELEGRAM":
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono uppercase tracking-wider bg-[#7AA2F7]/10 text-[#7AA2F7] border border-[#7AA2F7]/30">
            <Radio className="w-2.5 h-2.5" />
            <span>TELEGRAM</span>
          </span>
        );
      case "WEBSITE":
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono uppercase tracking-wider bg-[#BB9AF7]/10 text-[#BB9AF7] border border-[#BB9AF7]/30">
            <Globe className="w-2.5 h-2.5" />
            <span>WEBSITE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono uppercase tracking-wider bg-[#A7A49E]/10 text-[#A7A49E] border border-[#55534E]">
            <Layers className="w-2.5 h-2.5" />
            <span>{type}</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: SourceStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono uppercase tracking-wider bg-[#9ECE9B]/10 text-[#9ECE9B] border border-[#9ECE9B]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9ECE9B] animate-pulse" />
            <span>ACTIVE</span>
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono uppercase tracking-wider bg-[#E0AF68]/10 text-[#E0AF68] border border-[#E0AF68]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E0AF68]" />
            <span>PAUSED</span>
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono uppercase tracking-wider bg-[#73706A]/20 text-[#A7A49E] border border-[#55534E]">
            <span>ARCHIVED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono uppercase tracking-wider bg-[#F7768E]/10 text-[#F7768E] border border-[#F7768E]/30">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="border border-[#44423E]/60 bg-[#1C1C1C] rounded-[2px] flex flex-col font-mono shadow-sm">
      {/* Table Toolbar */}
      <div className="p-3 sm:p-4 border-b border-[#44423E]/60 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#181818]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#73706A]" />
          <input
            type="text"
            placeholder="Search channel name, @handle, ID, URL..."
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onPageChange(1);
            }}
            className="w-full bg-[#141414] border border-[#44423E] pl-8 pr-3 py-1.5 rounded-[2px] text-xs text-[#F2F0EA] placeholder-[#73706A] focus:outline-none focus:border-[#9ECE9B] transition-colors"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center space-x-1 bg-[#141414] border border-[#44423E] px-2 py-1 rounded-[2px]">
            <span className="text-[10px] uppercase text-[#73706A]">TYPE:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                onTypeChange(e.target.value as any);
                onPageChange(1);
              }}
              className="bg-transparent text-xs text-[#F2F0EA] focus:outline-none cursor-pointer"
            >
              <option value="all">ALL TYPES</option>
              <option value="TELEGRAM">TELEGRAM</option>
              <option value="WEBSITE">WEBSITE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-[#141414] border border-[#44423E] px-2 py-1 rounded-[2px]">
            <span className="text-[10px] uppercase text-[#73706A]">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                onStatusChange(e.target.value as any);
                onPageChange(1);
              }}
              className="bg-transparent text-xs text-[#F2F0EA] focus:outline-none cursor-pointer"
            >
              <option value="all">ALL STATUSES</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">PAUSED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Refresh Sources"
            className="p-1.5 border border-[#44423E] bg-[#141414] hover:bg-[#282828] text-[#A7A49E] hover:text-[#F2F0EA] rounded-[2px] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#9ECE9B]" : ""}`} />
          </button>

          {/* Add Channel Button */}
          <button
            onClick={onOpenCreate}
            className="bg-[#9ECE9B] text-[#141414] hover:bg-[#AEE0AB] font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-[2px] flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ ADD SOURCE</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto min-h-[300px] flex-1">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#44423E]/60 bg-[#141414] text-[10px] uppercase tracking-wider text-[#A7A49E]">
              <th className="py-2.5 px-3 sm:px-4 font-semibold">SOURCE / CHANNEL</th>
              <th className="py-2.5 px-3 font-semibold">TYPE</th>
              <th className="py-2.5 px-3 font-semibold">IDENTIFIER / HANDLE</th>
              <th className="py-2.5 px-3 font-semibold">STATUS</th>
              <th className="py-2.5 px-3 font-semibold text-center">INGESTION</th>
              <th className="py-2.5 px-3 font-semibold hidden md:table-cell">CREATED</th>
              <th className="py-2.5 px-3 sm:px-4 font-semibold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#44423E]/30">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#A7A49E]">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#9ECE9B]" />
                    <span>LOADING CHANNELS & SOURCES...</span>
                  </div>
                </td>
              </tr>
            ) : sources.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#73706A]">
                  <div className="flex flex-col items-center justify-center space-x-1 space-y-2">
                    <Radio className="w-8 h-8 text-[#55534E]" />
                    <p className="text-xs text-[#A7A49E]">NO SOURCES OR CHANNELS FOUND</p>
                    <p className="text-[10px] text-[#73706A] max-w-sm">
                      Add a Telegram channel to start auto-ingesting knowledge documents or adjust your filters.
                    </p>
                    <button
                      onClick={onOpenCreate}
                      className="mt-2 text-[10px] uppercase tracking-wider px-3 py-1 bg-[#282828] hover:bg-[#323232] text-[#9ECE9B] border border-[#9ECE9B]/40 rounded-[2px]"
                    >
                      + Add Your First Channel
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              sources.map((src) => {
                const isActive = src.status === "ACTIVE";
                const dateStr = new Date(src.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <tr
                    key={src.id}
                    className="hover:bg-[#242424]/60 transition-colors group"
                  >
                    {/* Source Name & Description */}
                    <td className="py-3 px-3 sm:px-4 max-w-[200px] sm:max-w-xs">
                      <div className="flex items-start space-x-2">
                        <div className="mt-0.5 p-1 rounded-[2px] bg-[#282828] border border-[#44423E] text-[#A7A49E]">
                          {src.type === "TELEGRAM" ? (
                            <Radio className="w-3.5 h-3.5 text-[#7AA2F7]" />
                          ) : (
                            <Globe className="w-3.5 h-3.5 text-[#BB9AF7]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => onInspect(src)}
                            className="font-bold text-[#F2F0EA] hover:text-[#9ECE9B] transition-colors truncate block text-left"
                            title={src.name || "Unnamed Source"}
                          >
                            {src.name || src.username || src.channelId || "Unnamed Source"}
                          </button>
                          {src.description && (
                            <p className="text-[10px] text-[#73706A] truncate max-w-[180px] sm:max-w-xs">
                              {src.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-3">{getTypeBadge(src.type)}</td>

                    {/* Identifier / Handle */}
                    <td className="py-3 px-3 max-w-[180px] truncate">
                      <div className="flex flex-col space-y-0.5">
                        {src.username && (
                          <div className="flex items-center space-x-1">
                            <span className="text-[#9ECE9B] font-bold">@{src.username}</span>
                            {src.url && (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                title="Open channel link"
                                className="text-[#73706A] hover:text-[#F2F0EA] transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                        {src.channelId && (
                          <span className="text-[10px] text-[#A7A49E] font-mono">
                            ID: {src.channelId}
                          </span>
                        )}
                        {!src.username && !src.channelId && src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#7AA2F7] hover:underline text-[11px] truncate block"
                          >
                            {src.url}
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">{getStatusBadge(src.status)}</td>

                    {/* Quick Toggle Button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onToggleStatus(src.id)}
                        title={isActive ? "Pause ingestion from this source" : "Resume ingestion from this source"}
                        className={`px-2 py-1 rounded-[2px] text-[10px] font-mono uppercase tracking-wider transition-all flex items-center justify-center space-x-1 mx-auto ${
                          isActive
                            ? "bg-[#9ECE9B]/10 hover:bg-[#9ECE9B]/20 text-[#9ECE9B] border border-[#9ECE9B]/40"
                            : "bg-[#282828] hover:bg-[#333333] text-[#A7A49E] border border-[#55534E]"
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          {isActive ? "ENABLED" : "PAUSED"}
                        </span>
                      </button>
                    </td>

                    {/* Created Date */}
                    <td className="py-3 px-3 hidden md:table-cell text-[10px] text-[#73706A]">
                      {dateStr}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onInspect(src)}
                          title="Inspect Details"
                          className="p-1 border border-[#44423E] hover:border-[#55534E] text-[#A7A49E] hover:text-[#F2F0EA] hover:bg-[#282828] rounded-[2px] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(src)}
                          title="Edit Source"
                          className="p-1 border border-[#44423E] hover:border-[#55534E] text-[#A7A49E] hover:text-[#9ECE9B] hover:bg-[#282828] rounded-[2px] transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete source "${src.name || src.username || src.id}"?`
                              )
                            ) {
                              onDelete(src.id);
                            }
                          }}
                          title="Delete Source"
                          className="p-1 border border-[#44423E] hover:border-[#DE8C85] text-[#A7A49E] hover:text-[#DE8C85] hover:bg-[#DE8C85]/10 rounded-[2px] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="p-3 sm:p-4 border-t border-[#44423E]/60 bg-[#181818] flex items-center justify-between text-xs text-[#A7A49E]">
        <div>
          <span>TOTAL: </span>
          <span className="font-bold text-[#F2F0EA]">{total}</span>
          <span className="hidden sm:inline"> SOURCES</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="px-2.5 py-1 border border-[#44423E] bg-[#141414] hover:bg-[#282828] text-[#F2F0EA] disabled:opacity-30 disabled:pointer-events-none rounded-[2px] transition-colors"
          >
            PREV
          </button>
          <span className="text-[11px] px-2 text-[#73706A]">
            PAGE {page} OF {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            className="px-2.5 py-1 border border-[#44423E] bg-[#141414] hover:bg-[#282828] text-[#F2F0EA] disabled:opacity-30 disabled:pointer-events-none rounded-[2px] transition-colors"
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
}
