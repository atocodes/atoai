"use client";

import React from "react";
import { FileText, Layers, Cpu, Server } from "lucide-react";
import { KnowledgeStats } from "../types/knowledge.types";

interface KnowledgeStatsGridProps {
  stats: KnowledgeStats | null;
  loading: boolean;
}

export function KnowledgeStatsGrid({ stats, loading }: KnowledgeStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div className="bg-[#1C1C1C] border border-[#44423E]/80 p-4 rounded-[2px] shadow-sm">
        <div className="flex items-center justify-between text-[#A7A49E] mb-2">
          <span className="text-[10px] font-bold tracking-[1.5px] uppercase font-mono">
            TOTAL DOCUMENTS
          </span>
          <FileText className="w-4 h-4 text-[#A7A49E]" />
        </div>
        <div className="font-mono text-2xl font-bold text-[#F2F0EA] tabular-nums">
          {loading ? "..." : stats?.totalDocuments.toLocaleString() ?? "0"}
        </div>
        <div className="mt-1 text-[10px] font-mono text-[#73706A] uppercase tracking-wider">
          Ingested into PostgreSQL
        </div>
      </div>

      <div className="bg-[#1C1C1C] border border-[#44423E]/80 p-4 rounded-[2px] shadow-sm">
        <div className="flex items-center justify-between text-[#A7A49E] mb-2">
          <span className="text-[10px] font-bold tracking-[1.5px] uppercase font-mono">
            KNOWLEDGE CHUNKS
          </span>
          <Layers className="w-4 h-4 text-[#9ECE9B]" />
        </div>
        <div className="font-mono text-2xl font-bold text-[#9ECE9B] tabular-nums">
          {loading ? "..." : stats?.totalChunks.toLocaleString() ?? "0"}
        </div>
        <div className="mt-1 text-[10px] font-mono text-[#73706A] uppercase tracking-wider">
          Smart AI semantic chunks
        </div>
      </div>

      <div className="bg-[#1C1C1C] border border-[#44423E]/80 p-4 rounded-[2px] shadow-sm">
        <div className="flex items-center justify-between text-[#A7A49E] mb-2">
          <span className="text-[10px] font-bold tracking-[1.5px] uppercase font-mono">
            PGVECTOR DIMENSIONS
          </span>
          <Cpu className="w-4 h-4 text-[#A7A49E]" />
        </div>
        <div className="font-mono text-2xl font-bold text-[#F2F0EA] tabular-nums">
          768-D
        </div>
        <div className="mt-1 text-[10px] font-mono text-[#73706A] uppercase tracking-wider">
          Cosine Distance (<span className="text-[#9ECE9B]">&lt;=&gt;</span>)
        </div>
      </div>

      <div className="bg-[#1C1C1C] border border-[#44423E]/80 p-4 rounded-[2px] shadow-sm">
        <div className="flex items-center justify-between text-[#A7A49E] mb-2">
          <span className="text-[10px] font-bold tracking-[1.5px] uppercase font-mono">
            SERVER PIPELINE
          </span>
          <Server className="w-4 h-4 text-[#9ECE9B]" />
        </div>
        <div className="flex items-center space-x-2 font-mono text-2xl font-bold text-[#F2F0EA]">
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#9ECE9B] animate-pulse inline-block" />
          <span>PORT 3000</span>
        </div>
        <div className="mt-1 text-[10px] font-mono text-[#73706A] uppercase tracking-wider">
          Modular DDD Architecture
        </div>
      </div>
    </div>
  );
}
