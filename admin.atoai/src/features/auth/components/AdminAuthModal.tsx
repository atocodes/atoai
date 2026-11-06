"use client";

import React, { useState } from "react";
import { Lock, Mail, User, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

interface AdminAuthModalProps {
  hasAdmin: boolean;
  onLogin: (credentials: { email: string; password: string }) => Promise<any>;
  onSetup: (data: { name: string; email: string; password: string }) => Promise<any>;
}

export function AdminAuthModal({ hasAdmin, onLogin, onSetup }: AdminAuthModalProps) {
  const [isSetup, setIsSetup] = useState(!hasAdmin);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSetup) {
        await onSetup({ name, email, password });
      } else {
        await onLogin({ email, password });
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1C1C1C] border border-[#44423E] rounded-[2px] shadow-2xl p-7 font-mono">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#44423E]/50">
          <div className="w-9 h-9 rounded-[2px] bg-[#F2F0EA] text-[#141414] flex items-center justify-center font-black text-base">
            A
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-[1.5px] uppercase text-[#F2F0EA]">
              {isSetup ? "INITIALIZE ADMIN ACCOUNT" : "ADMINISTRATOR LOGIN"}
            </h2>
            <p className="text-[11px] text-[#A7A49E] mt-0.5">
              {isSetup
                ? "Bootstrap the primary system administrator"
                : "Enter credentials to access the knowledge ledger"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-[2px] bg-[#DE8C85]/10 border border-[#DE8C85]/40 text-[#DE8C85] text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSetup && (
            <div>
              <label className="block text-[10px] font-bold tracking-[1.2px] uppercase text-[#A7A49E] mb-1.5">
                Admin Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#73706A] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Master Admin"
                  className="w-full bg-[#141414] border border-[#44423E] focus:border-[#F2F0EA] text-[#F2F0EA] rounded-[2px] pl-9 pr-3 py-2 text-xs outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold tracking-[1.2px] uppercase text-[#A7A49E] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#73706A] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@atoai.com"
                className="w-full bg-[#141414] border border-[#44423E] focus:border-[#F2F0EA] text-[#F2F0EA] rounded-[2px] pl-9 pr-3 py-2 text-xs outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-[1.2px] uppercase text-[#A7A49E] mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#73706A] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#141414] border border-[#44423E] focus:border-[#F2F0EA] text-[#F2F0EA] rounded-[2px] pl-9 pr-3 py-2 text-xs outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#F2F0EA] hover:bg-white text-[#141414] font-bold text-xs uppercase tracking-[1.5px] py-2.5 rounded-[2px] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{isSetup ? "CREATE SYSTEM ADMIN" : "AUTHENTICATE"}</span>
              </>
            )}
          </button>
        </form>

        {!hasAdmin && (
          <div className="mt-4 pt-3 border-t border-[#44423E]/40 text-center">
            <button
              onClick={() => setIsSetup(!isSetup)}
              className="text-[11px] text-[#A7A49E] hover:text-[#F2F0EA] underline uppercase tracking-wider"
            >
              {isSetup ? "Already setup? Switch to Login" : "No admin yet? Setup First Admin"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
