"use client";

import React, { useMemo, useState } from "react";
import { Search, Trash2, Eye, Filter, Loader2, ChevronLeft, ChevronRight, Layers, Calendar, User, Edit3 } from "lucide-react";
import { KnowledgeDocumentSummary } from "../types/knowledge.types";

interface KnowledgeTableProps {
  documents: KnowledgeDocumentSummary[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  search: string;
  selectedType: string;
  onSearchChange: (search: string) => void;
  onTypeChange: (type: string) => void;
  onPageChange: (page: number) => void;
  onInspect: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: string[]) => void | Promise<void>;
}

export function KnowledgeTable({
  documents,
  loading,
  total,
  page,
  limit,
  search,
  selectedType,
  onSearchChange,
  onTypeChange,
  onPageChange,
  onInspect,
  onDelete,
  onDeleteMany,
}: KnowledgeTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedOnPage = documents.length > 0 && documents.every((doc) => selectedIds.includes(doc.id));
  const toggleSelected = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const totalPages = Math.ceil(total / limit) || 1;

  // Extract unique dynamic types present in the current dataset
  const discoveredTypes = useMemo(() => {
    const types = new Set<string>(["all"]);
    documents.forEach((d) => {
      if (d.contentType && typeof d.contentType === "string") {
        types.add(d.contentType.toLowerCase().trim());
      }
    });
    // Ensure selectedType is represented if set
    if (selectedType && selectedType !== "all") {
      types.add(selectedType.toLowerCase().trim());
    }
    return Array.from(types);
  }, [documents, selectedType]);

  const getTypeColor = (type: string) => {
    const t = (type || "").toLowerCase();
    switch (t) {
      case "technical":
      case "tutorial":
      case "architecture":
        return "border-[#9ECE9B]/60 text-[#9ECE9B] bg-[#9ECE9B]/10";
      case "announcement":
      case "release":
      case "showcase":
        return "border-[#E5C07B]/60 text-[#E5C07B] bg-[#E5C07B]/10";
      case "security":
      case "bugfix":
        return "border-[#F7768E]/60 text-[#F7768E] bg-[#F7768E]/10";
      case "design":
      case "event":
        return "border-[#7AA2F7]/60 text-[#7AA2F7] bg-[#7AA2F7]/10";
      default:
        return "border-[#A7A49E]/40 text-[#A7A49E] bg-[#282828]";
    }
  };

  return (
    <div className="bg-[#1C1C1C] border border-[#44423E]/80 rounded-[2px] shadow-sm overflow-hidden font-mono text-xs">
      {/* Controls Bar */}
      <div className="p-3 sm:p-4 border-b border-[#44423E]/60 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#181818]">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[1px] text-[#A7A49E]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={selectedOnPage} onChange={(event) => setSelectedIds((current) => event.target.checked ? Array.from(new Set([...current, ...documents.map((doc) => doc.id)])) : current.filter((id) => !documents.some((doc) => doc.id === id)))} className="accent-[#9ECE9B]" />
            Select page
          </label>
          {selectedIds.length > 0 && <>
            <span>{selectedIds.length} selected</span>
            <button onClick={async () => { await onDeleteMany(selectedIds); setSelectedIds([]); }} className="inline-flex items-center gap-1 px-2 py-1 border border-[#DE8C85]/50 text-[#DE8C85] hover:bg-[#DE8C85]/10 rounded-[2px]">
              <Trash2 className="w-3 h-3" /> Remove selected
            </button>
            <button onClick={() => setSelectedIds([])} className="text-[#73706A] hover:text-[#F2F0EA]">Clear</button>
          </>}
        </div>
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-[#73706A] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onPageChange(1);
            }}
            placeholder="Search content, author, or source ID..."
            className="w-full bg-[#141414] border border-[#44423E] focus:border-[#9ECE9B] text-[#F2F0EA] rounded-[2px] pl-9 pr-3 py-1.5 text-xs outline-none transition-colors"
          />
        </div>

        {/* Dynamic Type Filter Pills / Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 -mx-1 px-1">
          <Filter className="w-3.5 h-3.5 text-[#73706A] shrink-0" />
          <span className="text-[10px] uppercase tracking-[1.2px] text-[#A7A49E] shrink-0">
            TYPE:
          </span>
          <div className="flex items-center space-x-1 shrink-0">
            {discoveredTypes.slice(0, 7).map((t) => (
              <button
                key={t}
                onClick={() => {
                  onTypeChange(t);
                  onPageChange(1);
                }}
                className={`px-2 py-0.5 rounded-[2px] text-[10px] uppercase tracking-[1px] font-bold transition-colors ${
                  selectedType.toLowerCase() === t
                    ? "bg-[#282828] text-[#9ECE9B] border border-[#9ECE9B]/60"
                    : "text-[#A7A49E] hover:text-[#F2F0EA] border border-transparent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Custom Type filter dropdown for overflow */}
          {discoveredTypes.length > 7 && (
            <select
              value={selectedType}
              onChange={(e) => {
                onTypeChange(e.target.value);
                onPageChange(1);
              }}
              className="bg-[#141414] border border-[#44423E] focus:border-[#9ECE9B] text-[#F2F0EA] rounded-[2px] px-2 py-1 text-[10px] uppercase outline-none"
            >
              {discoveredTypes.map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Mobile Card Layout (Visible only on < md) */}
      <div className="md:hidden divide-y divide-[#44423E]/30">
        {loading ? (
          <div className="p-8 text-center text-[#73706A]">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#9ECE9B] mb-2" />
            <span>SYNCING KNOWLEDGE LEDGER...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-[#73706A]">
            <span>NO KNOWLEDGE DOCUMENTS RECORDED</span>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onInspect(doc.id)}
              className="p-3.5 hover:bg-[#242424] active:bg-[#282828] cursor-pointer space-y-2 transition-colors"
            >
              <div className="flex items-center justify-between">
                <input type="checkbox" checked={selectedIds.includes(doc.id)} onChange={() => toggleSelected(doc.id)} onClick={(e) => e.stopPropagation()} aria-label={`Select document ${doc.sourceId}`} className="accent-[#9ECE9B]" />
                <span className="text-[10px] text-[#A7A49E] font-bold truncate max-w-[150px]">
                  #{doc.sourceId}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-[2px] text-[10px] uppercase font-bold tracking-[1px] border ${getTypeColor(
                    doc.contentType
                  )}`}
                >
                  {doc.contentType || "general"}
                </span>
              </div>

              <p className="text-xs font-sans text-[#F2F0EA] line-clamp-2 leading-relaxed">
                {doc.content || "(No text content)"}
              </p>

              <div className="flex items-center justify-between text-[10px] text-[#73706A] pt-1">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-[#A7A49E]" />
                    <span className="text-[#A7A49E]">{doc.author}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-[#9ECE9B]" />
                    <span className="text-[#9ECE9B]">{doc._count?.chunks ?? 0} chunks</span>
                  </span>
                </div>

                <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onInspect(doc.id)}
                    title="Inspect & Edit Document"
                    className="p-1.5 text-[#A7A49E] hover:text-[#9ECE9B] rounded-[2px]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onInspect(doc.id)}
                    title="Inspect Document"
                    className="p-1.5 text-[#A7A49E] hover:text-[#9ECE9B] rounded-[2px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(doc.id)}
                    title="Delete Document"
                    className="p-1.5 text-[#A7A49E] hover:text-[#DE8C85] rounded-[2px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Ledger Table (Visible on md and above) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#44423E]/60 bg-[#242424] text-[10px] font-bold tracking-[1.5px] uppercase text-[#A7A49E]">
              <th className="py-3 px-4 w-8"></th>
              <th className="py-3 px-4">SOURCE ID</th>
              <th className="py-3 px-4">CONTENT PREVIEW</th>
              <th className="py-3 px-4">TYPE</th>
              <th className="py-3 px-4">AUTHOR</th>
              <th className="py-3 px-4 text-center">CHUNKS</th>
              <th className="py-3 px-4">PUBLISHED</th>
              <th className="py-3 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#44423E]/30 text-xs">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#73706A]">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#9ECE9B]" />
                    <span>SYNCING KNOWLEDGE LEDGER...</span>
                  </div>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#73706A]">
                  NO KNOWLEDGE DOCUMENTS RECORDED
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => onInspect(doc.id)}
                  className="hover:bg-[#242424] cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(doc.id)} onChange={() => toggleSelected(doc.id)} aria-label={`Select document ${doc.sourceId}`} className="accent-[#9ECE9B]" /></td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#A7A49E] whitespace-nowrap">
                    #{doc.sourceId}
                  </td>
                  <td className="py-3.5 px-4 max-w-sm truncate text-[#F2F0EA] font-sans">
                    {doc.content || "(No text content)"}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-[2px] text-[10px] uppercase font-bold tracking-[1px] border ${getTypeColor(
                        doc.contentType
                      )}`}
                    >
                      {doc.contentType || "general"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#A7A49E] whitespace-nowrap">
                    {doc.author}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-[#141414] text-[#9ECE9B] border border-[#44423E] text-[10px]">
                      {doc._count?.chunks ?? 0}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#73706A] whitespace-nowrap text-[11px]">
                    {new Date(doc.publishedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onInspect(doc.id)}
                        title="Edit Document & Chunks"
                        className="p-1.5 text-[#A7A49E] hover:text-[#9ECE9B] hover:bg-[#282828] rounded-[2px] transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onInspect(doc.id)}
                        title="Inspect Document"
                        className="p-1.5 text-[#A7A49E] hover:text-[#9ECE9B] hover:bg-[#282828] rounded-[2px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(doc.id)}
                        title="Delete Document"
                        className="p-1.5 text-[#A7A49E] hover:text-[#DE8C85] hover:bg-[#282828] rounded-[2px] transition-colors"
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
      <div className="p-3 sm:p-4 border-t border-[#44423E]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#A7A49E] bg-[#181818]">
        <div>
          PAGE {page} OF {totalPages} &mdash; TOTAL {total.toLocaleString()} DOCUMENTS
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1 text-[#A7A49E] hover:text-[#F2F0EA] border border-[#44423E] rounded-[2px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#282828]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1 text-[#A7A49E] hover:text-[#F2F0EA] border border-[#44423E] rounded-[2px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#282828]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
