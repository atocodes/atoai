"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Layers,
  ExternalLink,
  Calendar,
  User,
  Tag,
  Loader2,
  Trash2,
  Edit3,
  RotateCw,
  Check,
  AlertCircle,
  FileText,
  Save,
  Plus,
} from "lucide-react";
import { KnowledgeDetail } from "../types/knowledge.types";
import { knowledgeService } from "../services/knowledge.service";

interface DocumentDrawerProps {
  documentId: string | null;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated?: () => void;
}

const SUGGESTED_TYPES = [
  "technical",
  "tutorial",
  "architecture",
  "announcement",
  "release",
  "changelog",
  "database",
  "general",
];

export function DocumentDrawer({
  documentId,
  onClose,
  onDeleted,
  onUpdated,
}: DocumentDrawerProps) {
  const [doc, setDoc] = useState<KnowledgeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Mode: "inspect" | "edit"
  const [activeMode, setActiveMode] = useState<"inspect" | "edit">("inspect");

  // Document Edit Form
  const [editAuthor, setEditAuthor] = useState("");
  const [editContentType, setEditContentType] = useState("");
  const [editContent, setEditContent] = useState("");
  const [regenerateOnSave, setRegenerateOnSave] = useState(true);
  const [savingDoc, setSavingDoc] = useState(false);

  // Regeneration state
  const [regenerating, setRegenerating] = useState(false);

  // Chunk Inline Edit state
  const [editingChunkId, setEditingChunkId] = useState<string | null>(null);
  const [chunkEditText, setChunkEditText] = useState("");
  const [savingChunk, setSavingChunk] = useState(false);
  const [deletingChunkId, setDeletingChunkId] = useState<string | null>(null);

  // Feedback message
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const loadDocument = (id: string) => {
    setLoading(true);
    knowledgeService
      .getDocument(id)
      .then((data) => {
        setDoc(data);
        setEditAuthor(data.author || "");
        setEditContentType(data.contentType || "general");
        setEditContent(data.content || "");
      })
      .catch((err) => {
        console.error("Error loading document:", err);
        showNotification("error", "Failed to load document details");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!documentId) return;
    setActiveMode("inspect");
    setEditingChunkId(null);
    setNotification(null);
    loadDocument(documentId);
  }, [documentId]);

  if (!documentId) return null;

  // Sanitize content type to single lowercase word
  const sanitizeType = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .split(/[\s_-]+/)[0]
      .replace(/[^a-z0-9]/g, "");
  };

  // Delete entire document
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document and all its chunks?"))
      return;
    setDeleting(true);
    try {
      await knowledgeService.deleteDocument(documentId);
      onDeleted();
      onClose();
    } catch (err: any) {
      alert("Failed to delete document: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Save document metadata/content
  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) {
      showNotification("error", "Document content cannot be empty");
      return;
    }

    setSavingDoc(true);
    try {
      const sanitized = sanitizeType(editContentType) || "general";
      const updatedDoc = await knowledgeService.updateDocument(documentId, {
        author: editAuthor.trim() || "admin",
        contentType: sanitized,
        content: editContent.trim(),
        regenerateChunks: regenerateOnSave,
      });

      setDoc(updatedDoc);
      setActiveMode("inspect");
      showNotification(
        "success",
        regenerateOnSave
          ? "Document saved & chunks regenerated successfully"
          : "Document saved successfully"
      );
      onUpdated?.();
    } catch (err: any) {
      showNotification("error", err.message || "Failed to update document");
    } finally {
      setSavingDoc(false);
    }
  };

  // Regenerate all chunks
  const handleRegenerateChunks = async () => {
    if (
      !confirm(
        "Regenerate and re-embed all chunks for this document? Existing chunks will be replaced."
      )
    )
      return;

    setRegenerating(true);
    try {
      const updatedDoc = await knowledgeService.regenerateChunks(documentId);
      setDoc(updatedDoc);
      showNotification(
        "success",
        `Successfully generated and embedded ${updatedDoc.chunks?.length ?? 0} chunks!`
      );
      onUpdated?.();
    } catch (err: any) {
      showNotification("error", err.message || "Failed to regenerate chunks");
    } finally {
      setRegenerating(false);
    }
  };

  // Start editing a single chunk
  const startEditingChunk = (chunkId: string, currentContent: string) => {
    setEditingChunkId(chunkId);
    setChunkEditText(currentContent);
  };

  // Save single chunk
  const handleSaveChunk = async (chunkId: string) => {
    if (!chunkEditText.trim()) {
      showNotification("error", "Chunk content cannot be empty");
      return;
    }

    setSavingChunk(true);
    try {
      const updatedDoc = await knowledgeService.updateChunk(
        documentId,
        chunkId,
        chunkEditText.trim(),
        true
      );
      setDoc(updatedDoc);
      setEditingChunkId(null);
      showNotification("success", "Chunk updated and re-embedded successfully");
      onUpdated?.();
    } catch (err: any) {
      showNotification("error", err.message || "Failed to update chunk");
    } finally {
      setSavingChunk(false);
    }
  };

  // Delete single chunk
  const handleDeleteChunk = async (chunkId: string) => {
    if (!confirm("Are you sure you want to delete this specific chunk?")) return;

    setDeletingChunkId(chunkId);
    try {
      const updatedDoc = await knowledgeService.deleteChunk(documentId, chunkId);
      setDoc(updatedDoc);
      showNotification("success", "Chunk deleted successfully");
      onUpdated?.();
    } catch (err: any) {
      showNotification("error", err.message || "Failed to delete chunk");
    } finally {
      setDeletingChunkId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl h-full bg-[#1C1C1C] border-l border-[#44423E] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 font-mono">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#44423E]/70 flex items-center justify-between bg-[#181818] shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold tracking-[1.5px] uppercase text-[#F2F0EA]">
              KNOWLEDGE INSPECTOR
            </span>
            <span className="text-[10px] bg-[#141414] px-1.5 py-0.5 rounded-[2px] border border-[#44423E] text-[#A7A49E]">
              #{doc?.sourceId?.substring(0, 14) || documentId.substring(0, 8)}
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center space-x-1 bg-[#141414] p-0.5 border border-[#44423E]/60 rounded-[2px]">
            <button
              onClick={() => setActiveMode("inspect")}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-[2px] transition-colors ${
                activeMode === "inspect"
                  ? "bg-[#282828] text-[#9ECE9B] border border-[#9ECE9B]/40"
                  : "text-[#A7A49E] hover:text-[#F2F0EA]"
              }`}
            >
              INSPECT
            </button>
            <button
              onClick={() => {
                if (doc) {
                  setEditAuthor(doc.author || "");
                  setEditContentType(doc.contentType || "general");
                  setEditContent(doc.content || "");
                }
                setActiveMode("edit");
              }}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-[2px] flex items-center space-x-1 transition-colors ${
                activeMode === "edit"
                  ? "bg-[#282828] text-[#9ECE9B] border border-[#9ECE9B]/40"
                  : "text-[#A7A49E] hover:text-[#F2F0EA]"
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>EDIT DOC</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-[#44423E] hover:border-[#F2F0EA] text-[#A7A49E] hover:text-[#F2F0EA] rounded-[2px] transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div
            className={`px-4 py-2 text-xs flex items-center space-x-2 border-b shrink-0 ${
              notification.type === "success"
                ? "bg-[#9ECE9B]/10 text-[#9ECE9B] border-[#9ECE9B]/30"
                : "bg-[#DE8C85]/10 text-[#DE8C85] border-[#DE8C85]/30"
            }`}
          >
            {notification.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="truncate">{notification.text}</span>
          </div>
        )}

        {/* Drawer Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {loading ? (
            <div className="py-20 text-center text-[#A7A49E]">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#9ECE9B]" />
              <span>Loading document details & chunks...</span>
            </div>
          ) : !doc ? (
            <div className="py-20 text-center text-[#DE8C85]">
              Document details could not be loaded.
            </div>
          ) : activeMode === "edit" ? (
            /* ===== EDIT DOCUMENT VIEW ===== */
            <form onSubmit={handleSaveDoc} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#44423E]/50">
                <div className="flex items-center space-x-1.5 text-[#F2F0EA]">
                  <Edit3 className="w-4 h-4 text-[#9ECE9B]" />
                  <span className="font-bold tracking-wider text-xs">
                    EDIT KNOWLEDGE DOCUMENT
                  </span>
                </div>
                <span className="text-[10px] text-[#A7A49E]">ID: {doc.id}</span>
              </div>

              {/* Author field */}
              <div>
                <label className="block text-[10px] font-bold tracking-[1.5px] uppercase text-[#A7A49E] mb-1">
                  AUTHOR / ATTRIBUTION
                </label>
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  placeholder="e.g. atocodes, admin"
                  className="w-full bg-[#141414] border border-[#44423E] focus:border-[#9ECE9B] text-[#F2F0EA] px-3 py-2 text-xs rounded-[2px] outline-none transition-colors"
                />
              </div>

              {/* Content Type field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#A7A49E]">
                    CONTENT TYPE / CATEGORY (ONE WORD)
                  </label>
                  <span className="text-[9px] text-[#73706A]">
                    letters and numbers only
                  </span>
                </div>
                <input
                  type="text"
                  value={editContentType}
                  onChange={(e) => setEditContentType(e.target.value)}
                  onBlur={() => setEditContentType(sanitizeType(editContentType))}
                  placeholder="e.g. tutorial, architecture, release"
                  className="w-full bg-[#141414] border border-[#44423E] focus:border-[#9ECE9B] text-[#9ECE9B] font-bold px-3 py-2 text-xs rounded-[2px] outline-none transition-colors"
                />

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SUGGESTED_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditContentType(t)}
                      className={`text-[9px] px-2 py-0.5 rounded-[2px] border transition-colors ${
                        editContentType.toLowerCase() === t
                          ? "bg-[#282828] text-[#9ECE9B] border-[#9ECE9B]/60"
                          : "bg-[#141414] text-[#A7A49E] border-[#44423E] hover:text-[#F2F0EA]"
                      }`}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Content textarea */}
              <div>
                <label className="block text-[10px] font-bold tracking-[1.5px] uppercase text-[#A7A49E] mb-1">
                  RAW DOCUMENT BODY (MARKDOWN / TEXT)
                </label>
                <textarea
                  rows={10}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Paste or edit the full document content..."
                  className="w-full bg-[#141414] border border-[#44423E] focus:border-[#9ECE9B] text-[#F2F0EA] p-3 text-xs font-mono rounded-[2px] outline-none transition-colors leading-relaxed"
                />
                <div className="text-right text-[10px] text-[#73706A] mt-1">
                  {editContent.length} characters
                </div>
              </div>

              {/* Automatic chunk regeneration checkbox */}
              <div className="p-3 bg-[#141414] border border-[#44423E]/80 rounded-[2px] flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="regenChunksOnSave"
                  checked={regenerateOnSave}
                  onChange={(e) => setRegenerateOnSave(e.target.checked)}
                  className="mt-0.5 rounded border-[#44423E] text-[#9ECE9B] focus:ring-0 cursor-pointer accent-[#9ECE9B]"
                />
                <label
                  htmlFor="regenChunksOnSave"
                  className="cursor-pointer select-none text-[11px] text-[#A7A49E]"
                >
                  <span className="font-bold text-[#F2F0EA] block">
                    Regenerate chunks & vector embeddings with new content
                  </span>
                  Re-runs AI chunker, clears outdated chunks, and computes 768-D
                  pgvector embeddings for the new body text.
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveMode("inspect")}
                  disabled={savingDoc}
                  className="px-4 py-2 border border-[#44423E] hover:bg-[#282828] text-[#A7A49E] hover:text-[#F2F0EA] rounded-[2px] text-xs uppercase tracking-wider transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={savingDoc}
                  className="px-5 py-2 bg-[#9ECE9B] hover:bg-[#8DBD8A] text-[#141414] font-bold rounded-[2px] text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {savingDoc ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>SAVING & RE-CHUNKING...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>SAVE CHANGES</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ===== INSPECT VIEW ===== */
            <>
              {/* Metadata Badges */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#141414] border border-[#44423E]/60 rounded-[2px]">
                <div className="flex items-center space-x-2 text-[#A7A49E]">
                  <User className="w-3.5 h-3.5 text-[#9ECE9B]" />
                  <span className="text-[#F2F0EA] font-semibold">{doc.author}</span>
                </div>
                <div className="flex items-center space-x-2 text-[#A7A49E]">
                  <Calendar className="w-3.5 h-3.5 text-[#9ECE9B]" />
                  <span>{new Date(doc.publishedAt).toLocaleString()}</span>
                </div>
                <div className="text-[10px] uppercase text-[#A7A49E]">
                  Source: <span className="text-[#F2F0EA] font-bold">{doc.source}</span>
                </div>
                <div className="text-[10px] uppercase text-[#A7A49E]">
                  Type:{" "}
                  <span className="text-[#9ECE9B] font-bold">
                    #{doc.contentType}
                  </span>
                </div>
              </div>

              {/* Document Content View */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#A7A49E] flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-[#9ECE9B]" />
                    <span>RAW DOCUMENT BODY</span>
                  </label>
                  <button
                    onClick={() => setActiveMode("edit")}
                    className="text-[10px] text-[#9ECE9B] hover:underline flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Document</span>
                  </button>
                </div>
                <div className="p-3.5 bg-[#141414] border border-[#44423E] rounded-[2px] whitespace-pre-wrap leading-relaxed text-[#F2F0EA] max-h-56 overflow-y-auto select-text text-xs font-mono">
                  {doc.content}
                </div>
              </div>

              {/* Metadata Tags & Links */}
              {doc.metadata && (
                <div className="space-y-3">
                  {doc.metadata.hashtags?.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-bold tracking-[1.5px] uppercase text-[#A7A49E] mb-1.5 flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>HASHTAGS</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {doc.metadata.hashtags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-[#282828] border border-[#44423E] text-[#F2F0EA] px-2 py-0.5 rounded-[2px] text-[10px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {doc.metadata.links?.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-bold tracking-[1.5px] uppercase text-[#A7A49E] mb-1.5 flex items-center space-x-1">
                        <ExternalLink className="w-3 h-3" />
                        <span>ATTACHED LINKS</span>
                      </label>
                      <div className="space-y-1">
                        {doc.metadata.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-[#9ECE9B] hover:underline text-[11px] truncate bg-[#141414] p-1.5 border border-[#44423E]/50 rounded-[2px]"
                          >
                            {link.label}: {link.url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===== CHUNKS & EMBEDDINGS MANAGEMENT ===== */}
              <div className="pt-2">
                {/* Section Header with Regenerate Chunks button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-[#44423E]/40">
                  <div>
                    <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#A7A49E] flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#9ECE9B]" />
                      <span>
                        EMBEDDED CHUNKS ({doc.chunks?.length ?? 0})
                      </span>
                    </label>
                    <span className="text-[9px] text-[#73706A]">
                      pgvector 768-D semantic partitions
                    </span>
                  </div>

                  <button
                    onClick={handleRegenerateChunks}
                    disabled={regenerating}
                    className="px-3 py-1.5 bg-[#242424] hover:bg-[#2c2c2c] border border-[#9ECE9B]/50 hover:border-[#9ECE9B] text-[#9ECE9B] text-[10px] font-bold uppercase tracking-wider rounded-[2px] flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    title="Re-split and generate fresh embeddings"
                  >
                    <RotateCw
                      className={`w-3.5 h-3.5 ${
                        regenerating ? "animate-spin text-[#9ECE9B]" : ""
                      }`}
                    />
                    <span>
                      {regenerating ? "REGENERATING..." : "REGENERATE CHUNKS"}
                    </span>
                  </button>
                </div>

                {/* Chunk List / Cards */}
                {doc.chunks?.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[#44423E] rounded-[2px] text-[#A7A49E]">
                    <p className="mb-2">No chunks generated for this document.</p>
                    <button
                      onClick={handleRegenerateChunks}
                      disabled={regenerating}
                      className="px-3 py-1.5 bg-[#9ECE9B] text-[#141414] font-bold text-[10px] uppercase rounded-[2px]"
                    >
                      GENERATE CHUNKS NOW
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {doc.chunks?.map((chunk) => {
                      const isEditing = editingChunkId === chunk.id;
                      const isDeleting = deletingChunkId === chunk.id;

                      return (
                        <div
                          key={chunk.id}
                          className={`p-3 bg-[#141414] border rounded-[2px] transition-colors ${
                            isEditing
                              ? "border-[#9ECE9B] ring-1 ring-[#9ECE9B]/30"
                              : "border-[#44423E]/70 hover:border-[#55534E]"
                          }`}
                        >
                          {/* Chunk Card Header */}
                          <div className="flex items-center justify-between text-[10px] text-[#A7A49E] mb-2 pb-1.5 border-b border-[#44423E]/30">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-[#9ECE9B] bg-[#1c1c1c] px-1.5 py-0.5 rounded-[2px] border border-[#44423E]">
                                CHUNK #{chunk.chunkIndex}
                              </span>
                              <span className="text-[9px] text-[#73706A]">
                                {chunk.content.length} chars
                              </span>
                            </div>

                            {/* Actions on Chunk */}
                            {!isEditing && (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() =>
                                    startEditingChunk(chunk.id, chunk.content)
                                  }
                                  className="p-1 text-[#A7A49E] hover:text-[#9ECE9B] hover:bg-[#242424] rounded-[2px] transition-colors"
                                  title="Edit chunk content"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteChunk(chunk.id)}
                                  disabled={isDeleting}
                                  className="p-1 text-[#A7A49E] hover:text-[#DE8C85] hover:bg-[#242424] rounded-[2px] transition-colors disabled:opacity-50"
                                  title="Delete chunk"
                                >
                                  {isDeleting ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Chunk Body or Inline Edit form */}
                          {isEditing ? (
                            <div className="space-y-2 mt-2">
                              <textarea
                                rows={4}
                                value={chunkEditText}
                                onChange={(e) => setChunkEditText(e.target.value)}
                                className="w-full bg-[#1C1C1C] border border-[#44423E] focus:border-[#9ECE9B] text-[#F2F0EA] p-2.5 text-xs font-mono rounded-[2px] outline-none leading-relaxed"
                              />
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-[#9ECE9B]">
                                  Will automatically re-embed 768-D vector
                                </span>
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    onClick={() => setEditingChunkId(null)}
                                    disabled={savingChunk}
                                    className="px-2.5 py-1 text-[#A7A49E] hover:text-[#F2F0EA] border border-[#44423E] rounded-[2px] uppercase tracking-wider"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveChunk(chunk.id)}
                                    disabled={savingChunk}
                                    className="px-3 py-1 bg-[#9ECE9B] hover:bg-[#8DBD8A] text-[#141414] font-bold rounded-[2px] uppercase tracking-wider flex items-center space-x-1"
                                  >
                                    {savingChunk ? (
                                      <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>Saving...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Save className="w-3 h-3" />
                                        <span>Save & Re-embed</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[#F2F0EA] leading-relaxed select-text font-sans text-xs">
                              {chunk.content}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-[#44423E]/70 bg-[#181818] flex items-center justify-between shrink-0">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 border border-[#DE8C85]/60 hover:bg-[#DE8C85]/10 text-[#DE8C85] rounded-[2px] text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deleting ? "DELETING..." : "DELETE DOCUMENT"}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#282828] hover:bg-[#333333] border border-[#55534E] text-[#F2F0EA] rounded-[2px] text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
