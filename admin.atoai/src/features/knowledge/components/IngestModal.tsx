"use client";

import React, { useState } from "react";
import { X, Upload, Loader2, CheckCircle2, AlertCircle, Tag } from "lucide-react";
import { IngestDocumentInput } from "../types/knowledge.types";

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngest: (data: IngestDocumentInput) => Promise<any>;
}

const POPULAR_SUGGESTIONS = [
  "technical",
  "tutorial",
  "architecture",
  "release",
  "announcement",
  "showcase",
  "security",
  "opinion",
];

export function IngestModal({ isOpen, onClose, onIngest }: IngestModalProps) {
  const [author, setAuthor] = useState("atocodes");
  const [contentType, setContentType] = useState("technical");
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("architecture, ai, backend");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleContentTypeChange = (val: string) => {
    // Strictly format as dynamic one-word lowercase alphanumeric string
    const sanitized = val.toLowerCase().replace(/[^a-z0-9]/g, "");
    setContentType(sanitized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const finalType = contentType.trim() || "general";
      const tagList = hashtags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      await onIngest({
        author: author.trim() || "atocodes",
        contentType: finalType,
        content,
        source: "admin-console",
        metadata: {
          hashtags: tagList,
          links: [],
          reactions: [],
          hasMedia: false,
        },
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setContent("");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to ingest content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 font-mono">
      <div className="w-full max-w-lg bg-[#1C1C1C] border border-[#44423E] rounded-[2px] shadow-2xl p-4 sm:p-6 text-xs max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#44423E]/60 mb-4 sm:mb-5">
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4 text-[#9ECE9B]" />
            <h3 className="font-bold tracking-[1.5px] uppercase text-[#F2F0EA] text-xs sm:text-sm">
              INGEST KNOWLEDGE DOCUMENT
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-[#44423E] hover:border-[#F2F0EA] text-[#A7A49E] hover:text-[#F2F0EA] rounded-[2px] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-[2px] bg-[#DE8C85]/10 border border-[#DE8C85]/40 text-[#DE8C85] flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-[2px] bg-[#9ECE9B]/10 border border-[#9ECE9B]/40 text-[#9ECE9B] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Document ingested and embedded successfully! Refreshing ledger...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold tracking-[1.2px] uppercase text-[#A7A49E] mb-1">
                Author
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="atocodes"
                className="w-full bg-[#141414] border border-[#44423E] focus:border-[#9ECE9B] text-[#F2F0EA] rounded-[2px] px-3 py-2 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[1.2px] uppercase text-[#A7A49E] mb-1">
                Content Type (One Word String)
              </label>
              <input
                type="text"
                required
                value={contentType}
                onChange={(e) => handleContentTypeChange(e.target.value)}
                placeholder="e.g. architecture, tutorial"
                className="w-full bg-[#141414] border border-[#44423E] focus:border-[#9ECE9B] text-[#9ECE9B] font-bold rounded-[2px] px-3 py-2 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Quick suggestions pills */}
          <div>
            <span className="block text-[9px] uppercase tracking-[1px] text-[#73706A] mb-1.5">
              Quick Suggestions (Tap to apply):
            </span>
            <div className="flex flex-wrap gap-1">
              {POPULAR_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setContentType(tag)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded-[2px] transition-colors ${
                    contentType === tag
                      ? "bg-[#9ECE9B] text-[#141414] font-bold"
                      : "bg-[#141414] text-[#A7A49E] border border-[#44423E] hover:text-[#F2F0EA]"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-[1.2px] uppercase text-[#A7A49E] mb-1">
              Document Content (Will be auto-chunked & vector embedded)
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste knowledge text, technical specification, article, or project update here..."
              className="w-full bg-[#141414] border border-[#44423E] focus:border-[#9ECE9B] text-[#F2F0EA] rounded-[2px] p-3 outline-none resize-none leading-relaxed font-sans text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-[1.2px] uppercase text-[#A7A49E] mb-1">
              Hashtags (comma-separated)
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="architecture, ai, postgres"
              className="w-full bg-[#141414] border border-[#44423E] focus:border-[#9ECE9B] text-[#F2F0EA] rounded-[2px] px-3 py-2 outline-none transition-colors"
            />
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-[#44423E]/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#282828] hover:bg-[#333333] border border-[#55534E] text-[#F2F0EA] rounded-[2px] uppercase tracking-wider text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 sm:py-2 bg-[#F2F0EA] hover:bg-white text-[#141414] font-bold rounded-[2px] uppercase tracking-wider flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>CHUNK & EMBED...</span>
                </>
              ) : (
                <span>INGEST INTO DATABASE</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
