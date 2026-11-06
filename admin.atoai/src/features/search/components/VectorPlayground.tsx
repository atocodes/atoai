"use client";

import React from "react";
import { Search, Terminal, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useVectorSearch } from "../hooks/useVectorSearch";

interface VectorPlaygroundProps {
  onInspectDocument: (id: string) => void;
}

export function VectorPlayground({ onInspectDocument }: VectorPlaygroundProps) {
  const {
    query,
    setQuery,
    limit,
    setLimit,
    results,
    loading,
    searched,
    error,
    search,
  } = useVectorSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search();
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Playground Header */}
      <div className="bg-[#1C1C1C] border border-[#44423E]/80 p-5 rounded-[2px] shadow-sm">
        <div className="flex items-center space-x-2 text-[#F2F0EA] mb-2">
          <Terminal className="w-4 h-4 text-[#9ECE9B]" />
          <h2 className="text-sm font-bold tracking-[1.5px] uppercase">
            VECTOR SIMILARITY SEARCH PLAYGROUND
          </h2>
        </div>
        <p className="text-[#A7A49E] text-[11px] leading-relaxed max-w-2xl">
          Test pgvector cosine distance (<span className="text-[#9ECE9B]">&lt;=&gt;</span>) in real-time.
          Queries are embedded using the active embedding model (768-D) and matched against all knowledge chunks stored in PostgreSQL.
        </p>

        <form onSubmit={handleSearch} className="mt-5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#73706A] absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter semantic query (e.g. 'How does knowledge chunking work?' or 'Prisma adapter details')..."
                className="w-full bg-[#141414] border border-[#44423E] focus:border-[#F2F0EA] text-[#F2F0EA] rounded-[2px] pl-9 pr-3 py-2 text-xs outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#F2F0EA] hover:bg-white text-[#141414] font-bold rounded-[2px] uppercase tracking-wider flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>EMBED & SEARCH</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-4 text-[10px] text-[#A7A49E]">
            <div className="flex items-center space-x-2">
              <span className="uppercase tracking-wider">Top Results:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                className="bg-[#141414] border border-[#44423E] text-[#F2F0EA] rounded-[2px] px-2 py-1 outline-none"
              >
                <option value={3}>Top 3</option>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-[2px] bg-[#DE8C85]/10 border border-[#DE8C85]/40 text-[#DE8C85] flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {searched && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[#A7A49E] text-[10px] uppercase tracking-[1.5px] font-bold pb-1 border-b border-[#44423E]/50">
            <span>SEMANTIC MATCHES ({results.length})</span>
            <span>RANKED BY COSINE SIMILARITY</span>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center bg-[#1C1C1C] border border-[#44423E]/60 text-[#73706A] rounded-[2px]">
              No relevant knowledge chunks found for this query embedding.
            </div>
          ) : (
            results.map((item, index) => (
              <div
                key={item.id}
                className="bg-[#1C1C1C] border border-[#44423E]/80 hover:border-[#55534E] p-4 rounded-[2px] transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#44423E]/30 text-[10px]">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-[2px] bg-[#282828] text-[#9ECE9B] flex items-center justify-center font-bold">
                      #{index + 1}
                    </span>
                    <span className="text-[#A7A49E]">Doc:</span>
                    <span className="text-[#F2F0EA]">#{item.sourceId.substring(0, 16)}</span>
                    <span className="text-[#73706A]">|</span>
                    <span className="text-[#9ECE9B] uppercase font-bold">
                      {item.contentType}
                    </span>
                    <span className="text-[#73706A]">by {item.author}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[#A7A49E]">Distance:</span>
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-[#141414] border border-[#44423E] text-[#9ECE9B] font-mono tabular-nums">
                      {Number(item.distance).toFixed(4)}
                    </span>
                    <button
                      onClick={() => onInspectDocument(item.documentId)}
                      className="px-2 py-0.5 bg-[#282828] hover:bg-[#333333] border border-[#44423E] text-[#F2F0EA] rounded-[2px] uppercase text-[9px]"
                    >
                      VIEW DOC
                    </button>
                  </div>
                </div>

                <p className="text-[#F2F0EA] text-xs leading-relaxed whitespace-pre-wrap select-text">
                  {item.content}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
