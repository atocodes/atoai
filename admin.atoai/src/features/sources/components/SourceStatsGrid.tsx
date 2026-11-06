"use client";

import React from "react";
import { SourceStats } from "../types/source.types";
import { Radio, CheckCircle2, PauseCircle, Globe } from "lucide-react";

interface SourceStatsGridProps {
  stats: SourceStats | null;
  loading: boolean;
}

export function SourceStatsGrid({ stats, loading }: SourceStatsGridProps) {
  const cards = [
    {
      label: "TOTAL SOURCES",
      value: stats?.total ?? 0,
      icon: Radio,
      color: "text-[#F2F0EA]",
      sub: "Configured channels & feeds",
    },
    {
      label: "ACTIVE INGESTION",
      value: stats?.active ?? 0,
      icon: CheckCircle2,
      color: "text-[#9ECE9B]",
      sub: "Currently accepting updates",
    },
    {
      label: "PAUSED / INACTIVE",
      value: (stats?.inactive ?? 0) + (stats?.archived ?? 0),
      icon: PauseCircle,
      color: "text-[#E0AF68]",
      sub: "Temporarily blocked or archived",
    },
    {
      label: "TELEGRAM CHANNELS",
      value: stats?.telegramCount ?? 0,
      icon: Radio,
      color: "text-[#7AA2F7]",
      sub: "Connected Telegram channels",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="border border-[#44423E]/60 bg-[#1C1C1C] p-4 rounded-[2px] flex flex-col justify-between shadow-sm"
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
