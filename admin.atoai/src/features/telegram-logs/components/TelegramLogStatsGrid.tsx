"use client";

import React from "react";
import { TelegramLogStats } from "../types/telegram-log.types";
import { Radio, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

interface TelegramLogStatsGridProps {
  stats: TelegramLogStats | null;
  loading: boolean;
}

export function TelegramLogStatsGrid({ stats, loading }: TelegramLogStatsGridProps) {
  const cards = [
    {
      label: "TOTAL MESSAGES",
      value: stats?.total ?? 0,
      icon: Radio,
      color: "text-[#F2F0EA]",
      sub: "Processed via bot / webhook",
    },
    {
      label: "INGESTED (SUCCESS)",
      value: stats?.success ?? 0,
      icon: CheckCircle2,
      color: "text-[#9ECE9B]",
      sub: "Embedded & indexed in vector db",
    },
    {
      label: "SKIPPED / DUPLICATES",
      value: stats?.skipped ?? 0,
      icon: AlertTriangle,
      color: "text-[#E0AF68]",
      sub: "Already existed or forwarded",
    },
    {
      label: "FAILED / ERRORS",
      value: stats?.failed ?? 0,
      icon: XCircle,
      color: "text-[#F7768E]",
      sub: "Parser or embedding exceptions",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="border border-[#44423E]/60 bg-[#1C1C1C] p-4 rounded-[2px] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[1.5px] text-[#A7A49E]">
                {card.label}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>

            <div className="mt-3">
              {loading ? (
                <div className="h-8 w-20 bg-[#282828] animate-pulse rounded-[2px]" />
              ) : (
                <div className={`text-2xl font-black font-mono tracking-tight ${card.color}`}>
                  {card.value.toLocaleString()}
                </div>
              )}
              <p className="text-[10px] text-[#73706A] font-mono mt-1">{card.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
