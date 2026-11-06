"use client";

import React from "react";
import { Lock, Shield, CheckCircle2, AlertCircle, Loader2, KeyRound, Server, User, Mail } from "lucide-react";
import { useSettings } from "../hooks/useSettings";

interface AdminSettingsViewProps {
  user: { name?: string; email: string; role?: string } | null;
  onUserUpdated?: () => void;
}

export function AdminSettingsView({ user, onUserUpdated }: AdminSettingsViewProps) {
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordLoading,
    passwordError,
    passwordSuccess,
    updatePassword,

    newEmail,
    setNewEmail,
    emailLoading,
    emailError,
    emailSuccess,
    updateEmail,
  } = useSettings(() => {
    if (onUserUpdated) onUserUpdated();
  });

  return (
    <div className="space-y-6 max-w-5xl font-mono text-xs">
      {/* Header */}
      <div className="bg-[#1C1C1C] border border-[#44423E]/80 p-5 rounded-[2px] shadow-sm">
        <div className="flex items-center space-x-2 text-[#F2F0EA] mb-2">
          <Shield className="w-4 h-4 text-[#9ECE9B]" />
          <h2 className="text-sm font-bold tracking-[1.5px] uppercase">
            ADMINISTRATIVE SETTINGS & SECURITY
          </h2>
        </div>
        <p className="text-[#A7A49E] text-[11px] leading-relaxed">
          Manage system administrator credentials, email address, security policies, and session controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Change Email & Change Password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Change Email */}
          <div className="bg-[#1C1C1C] border border-[#44423E]/80 p-5 rounded-[2px] shadow-sm">
            <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-[#44423E]/50">
              <Mail className="w-4 h-4 text-[#9ECE9B]" />
              <h3 className="font-bold tracking-[1.2px] uppercase text-[#F2F0EA]">
                UPDATE ADMIN EMAIL
              </h3>
            </div>

            {emailError && (
              <div className="mb-4 p-3 rounded-[2px] bg-[#DE8C85]/10 border border-[#DE8C85]/40 text-[#DE8C85] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{emailError}</span>
              </div>
            )}

            {emailSuccess && (
              <div className="mb-4 p-3 rounded-[2px] bg-[#9ECE9B]/10 border border-[#9ECE9B]/40 text-[#9ECE9B] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{emailSuccess}</span>
              </div>
            )}

            <form onSubmit={updateEmail} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-[1.2px] uppercase text-[#A7A49E] mb-1.5">
                  Current Email Address
                </label>
                <div className="px-3 py-2 bg-[#141414] border border-[#44423E]/60 rounded-[2px] text-[#A7A49E]">
                  {user?.email || "admin@atoai.com"}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[1.2px] uppercase text-[#A7A49E] mb-1.5">
                  New Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#73706A] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="newadmin@atoai.com"
                    className="w-full bg-[#141414] border border-[#44423E] focus:border-[#F2F0EA] text-[#F2F0EA] rounded-[2px] pl-9 pr-3 py-2 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#44423E]/50 flex justify-end">
                <button
                  type="submit"
                  disabled={emailLoading || !newEmail.trim()}
                  className="px-5 py-2.5 bg-[#F2F0EA] hover:bg-white text-[#141414] font-bold uppercase tracking-[1.2px] rounded-[2px] transition-colors flex items-center space-x-2 disabled:opacity-40"
                >
                  {emailLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>SAVING EMAIL...</span>
                    </>
                  ) : (
                    <span>UPDATE EMAIL</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Change Password */}
          <div className="bg-[#1C1C1C] border border-[#44423E]/80 p-5 rounded-[2px] shadow-sm">
            <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-[#44423E]/50">
              <KeyRound className="w-4 h-4 text-[#F2F0EA]" />
              <h3 className="font-bold tracking-[1.2px] uppercase text-[#F2F0EA]">
                UPDATE ADMIN PASSWORD
              </h3>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 rounded-[2px] bg-[#DE8C85]/10 border border-[#DE8C85]/40 text-[#DE8C85] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-[2px] bg-[#9ECE9B]/10 border border-[#9ECE9B]/40 text-[#9ECE9B] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={updatePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-[1.2px] uppercase text-[#A7A49E] mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#73706A] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#141414] border border-[#44423E] focus:border-[#F2F0EA] text-[#F2F0EA] rounded-[2px] pl-9 pr-3 py-2 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold tracking-[1.2px] uppercase text-[#A7A49E] mb-1.5">
                    New Password (min 8 chars)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#73706A] absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#141414] border border-[#44423E] focus:border-[#F2F0EA] text-[#F2F0EA] rounded-[2px] pl-9 pr-3 py-2 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[1.2px] uppercase text-[#A7A49E] mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#73706A] absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#141414] border border-[#44423E] focus:border-[#F2F0EA] text-[#F2F0EA] rounded-[2px] pl-9 pr-3 py-2 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#44423E]/50 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading || !currentPassword || !newPassword}
                  className="px-5 py-2.5 bg-[#F2F0EA] hover:bg-white text-[#141414] font-bold uppercase tracking-[1.2px] rounded-[2px] transition-colors flex items-center space-x-2 disabled:opacity-40"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>UPDATING CREDENTIALS...</span>
                    </>
                  ) : (
                    <span>CHANGE PASSWORD</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (1 col): Active Profile & System Environment */}
        <div className="space-y-4">
          <div className="bg-[#1C1C1C] border border-[#44423E]/80 p-4 rounded-[2px]">
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-[#44423E]/50 text-[#A7A49E] text-[10px] uppercase font-bold tracking-[1.2px]">
              <User className="w-3.5 h-3.5" />
              <span>ACTIVE PROFILE</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-[10px] text-[#73706A] uppercase">Full Name</div>
                <div className="text-[#F2F0EA] font-bold truncate">{user?.name || "Master Admin"}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#73706A] uppercase">Account Email</div>
                <div className="text-[#F2F0EA] font-bold truncate">{user?.email || "admin@atoai.com"}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#73706A] uppercase">Role</div>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-[2px] bg-[#9ECE9B]/10 border border-[#9ECE9B]/40 text-[#9ECE9B]">
                  {user?.role || "ADMINISTRATOR"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1C] border border-[#44423E]/80 p-4 rounded-[2px]">
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-[#44423E]/50 text-[#A7A49E] text-[10px] uppercase font-bold tracking-[1.2px]">
              <Server className="w-3.5 h-3.5 text-[#9ECE9B]" />
              <span>SYSTEM ENVIRONMENT</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#73706A]">Auth Engine:</span>
                <span className="text-[#F2F0EA]">Better Auth 1.7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#73706A]">Database:</span>
                <span className="text-[#F2F0EA]">PostgreSQL (pgvector)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#73706A]">Server Port:</span>
                <span className="text-[#9ECE9B]">3000 (Ready)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#73706A]">Security:</span>
                <span className="text-[#F2F0EA]">Credential Validation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
