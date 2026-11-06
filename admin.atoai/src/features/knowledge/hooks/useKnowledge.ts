"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IngestDocumentInput,
  KnowledgeDocumentSummary,
  KnowledgeStats,
} from "../types/knowledge.types";
import { knowledgeService } from "../services/knowledge.service";

export function useKnowledge(enabled: boolean = true) {
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [documents, setDocuments] = useState<KnowledgeDocumentSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!enabled) return;
    setStatsLoading(true);
    try {
      const data = await knowledgeService.getStats();
      setStats(data);
    } catch (err: any) {
      console.error("Failed to load stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [enabled]);

  const loadDocuments = useCallback(async () => {
    if (!enabled) return;
    setTableLoading(true);
    setError(null);
    try {
      const data = await knowledgeService.getDocuments({
        page,
        limit,
        contentType: selectedType,
        search: search.trim() || undefined,
      });
      setDocuments(data.documents);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || "Failed to load documents");
    } finally {
      setTableLoading(false);
    }
  }, [enabled, page, limit, selectedType, search]);

  useEffect(() => {
    if (enabled) {
      loadStats();
      loadDocuments();
    }
  }, [enabled, loadStats, loadDocuments]);

  const removeDocument = async (id: string) => {
    await knowledgeService.deleteDocument(id);
    await Promise.all([loadDocuments(), loadStats()]);
  };

  const removeDocuments = async (ids: string[]) => {
    await Promise.all(ids.map((id) => knowledgeService.deleteDocument(id)));
    await Promise.all([loadDocuments(), loadStats()]);
  };

  const ingestDocument = async (input: IngestDocumentInput) => {
    const doc = await knowledgeService.createDocument(input);
    await Promise.all([loadDocuments(), loadStats()]);
    return doc;
  };

  return {
    stats,
    statsLoading,
    documents,
    total,
    page,
    limit,
    search,
    selectedType,
    tableLoading,
    error,
    setPage,
    setLimit,
    setSearch: (val: string) => {
      setSearch(val);
      setPage(1);
    },
    setSelectedType: (val: string) => {
      setSelectedType(val);
      setPage(1);
    },
    refresh: () => Promise.all([loadDocuments(), loadStats()]),
    removeDocument,
    removeDocuments,
    ingestDocument,
  };
}
