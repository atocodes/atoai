"use client";

import React, { useState } from "react";
import {
  LogOut,
  Database,
  ShieldCheck,
  Terminal,
  Settings,
  Radio,
  Menu,
  X,
  Upload,
  User as UserIcon,
  Layers,
} from "lucide-react";

export type AdminTab =
  | "knowledge"
  | "sources"
  | "telegram"
  | "search"
  | "chat"
  | "settings";

interface AdminHeaderProps {
  user: { name?: string; email: string; role?: string } | null;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onOpenIngest: () => void;
  onLogout: () => void;
}

export function AdminHeader({
  user,
  activeTab,
  onTabChange,
  onOpenIngest,
  onLogout,
}: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "knowledge", label: "KNOWLEDGE", icon: Database },
    { id: "sources", label: "SOURCES", icon: Layers },
    { id: "telegram", label: "TELEGRAM", icon: Radio },
    { id: "search", label: "SEARCH", icon: Terminal },
    { id: "chat", label: "RAG CHAT", icon: ShieldCheck },
    { id: "settings", label: "SETTINGS", icon: Settings },
  ];

  const handleTabClick = (tab: AdminTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-[#44423E]/60 bg-[#1C1C1C] sticky top-0 z-40 shrink-0 font-mono">
      {/* Top Navbar Row */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[2px] bg-[#F2F0EA] text-[#141414] font-black text-xs sm:text-sm shadow-inner">
            A
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-bold tracking-[1.5px] text-xs sm:text-sm text-[#F2F0EA]">
                ATOAI
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[1px] px-1 sm:px-1.5 py-0.5 rounded-[2px] border border-[#55534E] text-[#A7A49E] bg-[#282828]">
                ADMIN
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[1px] text-[#73706A] hidden xs:block">
              Knowledge Ledger & RAG
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on mobile) */}
        <nav className="hidden lg:flex items-center space-x-1 border border-[#44423E]/70 p-0.5 rounded-[2px] bg-[#141414]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-3 py-1.5 text-xs uppercase tracking-[1.2px] rounded-[2px] transition-colors flex items-center space-x-1.5 ${
                  isActive
                    ? "bg-[#282828] text-[#F2F0EA] border border-[#55534E]"
                    : "text-[#A7A49E] hover:text-[#F2F0EA] hover:bg-[#1C1C1C]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.id === "sources" ? "text-[#7AA2F7]" : tab.id === "telegram" ? "text-[#9ECE9B]" : ""}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Ingest + User (Desktop & Mobile) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenIngest}
            className="bg-[#F2F0EA] text-[#141414] hover:bg-white text-[10px] sm:text-[11px] font-bold uppercase tracking-[1px] px-2.5 sm:px-3.5 py-1.5 rounded-[2px] transition-all flex items-center space-x-1"
          >
            <Upload className="w-3 h-3 sm:hidden" />
            <span>+ INGEST</span>
            <span className="hidden sm:inline">CONTENT</span>
          </button>

          {/* Desktop User Profile */}
          {user && (
            <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-[#44423E]/70">
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-[#F2F0EA] truncate max-w-[120px] lg:max-w-[160px]">
                  {user.name || user.email}
                </span>
                <span className="text-[9px] text-[#9ECE9B] uppercase tracking-wider">
                  {user.role || "ADMIN"}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 border border-[#44423E] hover:bg-[#282828] text-[#A7A49E] hover:text-[#DE8C85] rounded-[2px] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 border border-[#44423E] text-[#F2F0EA] rounded-[2px] hover:bg-[#282828] transition-colors"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Quick-Tab Strip (Always visible on mobile for quick 1-tap switching) */}
      <div className="lg:hidden border-t border-[#44423E]/40 px-2 py-1.5 bg-[#141414] flex items-center space-x-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-[1px] rounded-[2px] transition-colors shrink-0 flex items-center space-x-1 ${
                isActive
                  ? "bg-[#282828] text-[#F2F0EA] border border-[#55534E] font-bold"
                  : "text-[#A7A49E] hover:text-[#F2F0EA]"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Slide-down Full Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#44423E] bg-[#181818] px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
          {/* User profile info on mobile */}
          {user && (
            <div className="p-3 bg-[#141414] border border-[#44423E] rounded-[2px] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-[2px] bg-[#282828] border border-[#55534E] flex items-center justify-center text-[#9ECE9B]">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#F2F0EA] font-bold truncate max-w-[180px]">
                    {user.name || user.email}
                  </span>
                  <span className="text-[9px] text-[#9ECE9B] uppercase tracking-wider">
                    ROLE: {user.role || "ADMIN"}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="px-2.5 py-1 text-[10px] text-[#DE8C85] border border-[#DE8C85]/40 hover:bg-[#DE8C85]/10 rounded-[2px] flex items-center space-x-1"
              >
                <LogOut className="w-3 h-3" />
                <span>EXIT</span>
              </button>
            </div>
          )}

          {/* Full vertical links */}
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[1.5px] text-[#73706A] block mb-1">
              NAVIGATION
            </span>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full px-3 py-2.5 text-xs uppercase tracking-[1.2px] rounded-[2px] transition-colors flex items-center justify-between ${
                    isActive
                      ? "bg-[#282828] text-[#F2F0EA] border border-[#55534E] font-bold"
                      : "text-[#A7A49E] hover:text-[#F2F0EA] hover:bg-[#242424]"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-[#9ECE9B]" />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#9ECE9B]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
