"use client";

import React, { useState, useEffect } from "react";
import {
  CreateSourcePayload,
  Source,
  SourceStatus,
  SourceType,
  UpdateSourcePayload,
} from "../types/source.types";
import { X, Radio, Globe, Layers, AlertCircle, Loader2 } from "lucide-react";

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: Source | null; // null for Create, non-null for Edit
  onSubmit: (payload: CreateSourcePayload | UpdateSourcePayload) => Promise<any>;
}

export function SourceModal({
  isOpen,
  onClose,
  source,
  onSubmit,
}: SourceModalProps) {
  const isEditing = !!source;

  const [name, setName] = useState("");
  const [type, setType] = useState<SourceType>("TELEGRAM");
  const [status, setStatus] = useState<SourceStatus>("ACTIVE");
  const [channelId, setChannelId] = useState("");
  const [username, setUsername] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (source) {
      setName(source.name || "");
      setType(source.type);
      setStatus(source.status);
      setChannelId(source.channelId || "");
      setUsername(source.username || "");
      setUrl(source.url || "");
      setDescription(source.description || "");
    } else {
      setName("");
      setType("TELEGRAM");
      setStatus("ACTIVE");
      setChannelId("");
      setUsername("");
      setUrl("");
      setDescription("");
    }
    setError(null);
  }, [source, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() && !username.trim() && !channelId.trim() && !url.trim()) {
      setError("Please provide at least a Name, @Username, Channel ID, or URL.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateSourcePayload = {
        name: name.trim() || undefined,
        type,
        status,
        channelId: channelId.trim() || null,
        username: username.trim() || null,
        url: url.trim() || null,
        description: description.trim() || null,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save source");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-mono">
      <div className="relative w-full max-w-lg bg-[#1C1C1C] border border-[#44423E] rounded-[2px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#44423E]/60 flex items-center justify-between bg-[#141414]">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-[2px] bg-[#282828] border border-[#44423E] flex items-center justify-center text-[#9ECE9B]">
              {type === "TELEGRAM" ? (
                <Radio className="w-3.5 h-3.5 text-[#7AA2F7]" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-[#BB9AF7]" />
              )}
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[1.5px] text-[#F2F0EA]">
                {isEditing ? "EDIT SOURCE / CHANNEL" : "ADD NEW SOURCE / CHANNEL"}
              </h2>
              <p className="text-[10px] text-[#73706A]">
                {isEditing
                  ? `Updating configuration for ${source?.name || source?.id}`
                  : "Register a Telegram channel or feed for automated ingestion"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#73706A] hover:text-[#F2F0EA] hover:bg-[#282828] rounded-[2px] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#F7768E]/10 border border-[#F7768E]/40 rounded-[2px] text-xs text-[#F7768E] flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Source Type Selector */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#A7A49E] mb-1.5">
              SOURCE TYPE
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "TELEGRAM", label: "TELEGRAM", icon: Radio },
                { id: "WEBSITE", label: "WEBSITE", icon: Globe },
                { id: "OTHER", label: "OTHER", icon: Layers },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as SourceType)}
                    className={`py-2 px-3 text-xs uppercase tracking-wider border rounded-[2px] flex items-center justify-center space-x-1.5 transition-colors ${
                      isSelected
                        ? "bg-[#282828] border-[#9ECE9B] text-[#9ECE9B] font-bold"
                        : "bg-[#141414] border-[#44423E] text-[#A7A49E] hover:border-[#55534E]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name / Title */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#A7A49E] mb-1">
              DISPLAY NAME / TITLE
            </label>
            <input
              type="text"
              placeholder="e.g. ATOAI Community & Announcements"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#141414] border border-[#44423E] px-3 py-2 rounded-[2px] text-xs text-[#F2F0EA] placeholder-[#73706A] focus:outline-none focus:border-[#9ECE9B] transition-colors"
            />
          </div>

          {/* Telegram Specific Fields */}
          {type === "TELEGRAM" && (
            <div className="space-y-3 p-3 bg-[#141414] border border-[#44423E]/60 rounded-[2px]">
              <div className="text-[10px] text-[#7AA2F7] uppercase tracking-wider font-bold">
                TELEGRAM CHANNEL CONFIGURATION
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Username */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#A7A49E] mb-1">
                    CHANNEL @USERNAME
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#73706A] text-xs">
                      @
                    </span>
                    <input
                      type="text"
                      placeholder="channel_handle"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
                      className="w-full bg-[#1C1C1C] border border-[#44423E] pl-6 pr-3 py-1.5 rounded-[2px] text-xs text-[#F2F0EA] placeholder-[#73706A] focus:outline-none focus:border-[#9ECE9B]"
                    />
                  </div>
                </div>

                {/* Channel ID */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#A7A49E] mb-1">
                    TELEGRAM CHAT / CHANNEL ID
                  </label>
                  <input
                    type="text"
                    placeholder="-1001234567890 (optional)"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-[#44423E] px-3 py-1.5 rounded-[2px] text-xs text-[#F2F0EA] placeholder-[#73706A] focus:outline-none focus:border-[#9ECE9B]"
                  />
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#A7A49E] mb-1">
                  PUBLIC CHANNEL URL
                </label>
                <input
                  type="url"
                  placeholder="https://t.me/channel_handle"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#44423E] px-3 py-1.5 rounded-[2px] text-xs text-[#F2F0EA] placeholder-[#73706A] focus:outline-none focus:border-[#9ECE9B]"
                />
              </div>

              <p className="text-[10px] text-[#73706A] leading-relaxed">
                Tip: Add your ATOAI Telegram Bot as an Administrator in your Telegram channel. Incoming channel posts will be verified and automatically indexed.
              </p>
            </div>
          )}

          {/* Web / Other Fields */}
          {type !== "TELEGRAM" && (
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A7A49E] mb-1">
                FEED / WEBSITE URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/blog or feed url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#141414] border border-[#44423E] px-3 py-2 rounded-[2px] text-xs text-[#F2F0EA] placeholder-[#73706A] focus:outline-none focus:border-[#9ECE9B]"
              />
            </div>
          )}

          {/* Status Dropdown */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#A7A49E] mb-1">
              INGESTION STATUS
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SourceStatus)}
              className="w-full bg-[#141414] border border-[#44423E] px-3 py-2 rounded-[2px] text-xs text-[#F2F0EA] focus:outline-none focus:border-[#9ECE9B] cursor-pointer"
            >
              <option value="ACTIVE">ACTIVE (Accepting and indexing new posts)</option>
              <option value="INACTIVE">PAUSED (Temporarily skip incoming updates)</option>
              <option value="ARCHIVED">ARCHIVED (Archived source)</option>
            </select>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#A7A49E] mb-1">
              NOTES / DESCRIPTION
            </label>
            <textarea
              rows={2}
              placeholder="Optional notes about this source..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#141414] border border-[#44423E] px-3 py-2 rounded-[2px] text-xs text-[#F2F0EA] placeholder-[#73706A] focus:outline-none focus:border-[#9ECE9B]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#44423E]/60 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-[#44423E] text-xs uppercase tracking-wider text-[#A7A49E] hover:text-[#F2F0EA] hover:bg-[#282828] rounded-[2px] transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#9ECE9B] text-[#141414] hover:bg-[#AEE0AB] text-xs font-bold uppercase tracking-wider rounded-[2px] flex items-center space-x-1.5 transition-all shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : (
                <span>{isEditing ? "SAVE CHANGES" : "+ CREATE SOURCE"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
