"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreateSourcePayload,
  Source,
  SourceStats,
  SourceStatus,
  SourceType,
  UpdateSourcePayload,
} from "../types/source.types";
import { sourceService } from "../services/source.service";

export function useSources(enabled: boolean = true) {
  const [stats, setStats] = useState<SourceStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [sources, setSources] = useState<Source[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [statusFilter, setStatusFilter] = useState<SourceStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<SourceType | "all">("all");
  const [search, setSearch] = useState("");
  const [tableLoading, setTableLoading] = useState(false);

  // Inspection Drawer & Edit/Create Modal state
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);

  const fetchStats = useCallback(async () => {
    if (!enabled) return;
    setStatsLoading(true);
    try {
      const data = await sourceService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load source stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [enabled]);

  const fetchSources = useCallback(async () => {
    if (!enabled) return;
    setTableLoading(true);
    try {
      const data = await sourceService.getSources({
        page,
        limit,
        status: statusFilter,
        type: typeFilter,
        search,
      });
      setSources(data.sources);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to load sources:", err);
    } finally {
      setTableLoading(false);
    }
  }, [enabled, page, limit, statusFilter, typeFilter, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const createSource = async (payload: CreateSourcePayload) => {
    const created = await sourceService.createSource(payload);
    await Promise.all([fetchSources(), fetchStats()]);
    setIsModalOpen(false);
    return created;
  };

  const updateSource = async (id: string, payload: UpdateSourcePayload) => {
    const updated = await sourceService.updateSource(id, payload);
    await Promise.all([fetchSources(), fetchStats()]);
    if (selectedSource?.id === id) {
      setSelectedSource(updated);
    }
    setIsModalOpen(false);
    setEditingSource(null);
    return updated;
  };

  const toggleStatus = async (id: string) => {
    try {
      const updated = await sourceService.toggleStatus(id);
      await Promise.all([fetchSources(), fetchStats()]);
      if (selectedSource?.id === id) {
        setSelectedSource(updated);
      }
      return updated;
    } catch (err: any) {
      alert(err.message || "Failed to toggle source status");
      throw err;
    }
  };

  const removeSource = async (id: string) => {
    try {
      await sourceService.deleteSource(id);
      await Promise.all([fetchSources(), fetchStats()]);
      if (selectedSource?.id === id) {
        setSelectedSource(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete source");
      throw err;
    }
  };

  const openCreateModal = () => {
    setEditingSource(null);
    setIsModalOpen(true);
  };

  const openEditModal = (source: Source) => {
    setEditingSource(source);
    setIsModalOpen(true);
  };

  const refresh = async () => {
    await Promise.all([fetchSources(), fetchStats()]);
  };

  return {
    stats,
    statsLoading,
    sources,
    total,
    page,
    limit,
    statusFilter,
    typeFilter,
    search,
    tableLoading,
    selectedSource,
    isModalOpen,
    editingSource,
    setSelectedSource,
    setIsModalOpen,
    setEditingSource,
    setPage,
    setStatusFilter,
    setTypeFilter,
    setSearch,
    createSource,
    updateSource,
    toggleStatus,
    removeSource,
    openCreateModal,
    openEditModal,
    refresh,
  };
}
