"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TelegramLogEntry,
  TelegramLogFilterOptions,
  TelegramLogStats,
  TelegramLogStatus,
} from "../types/telegram-log.types";
import { telegramLogService } from "../services/telegram-log.service";

export function useTelegramLogs(enabled: boolean = true) {
  const [stats, setStats] = useState<TelegramLogStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [logs, setLogs] = useState<TelegramLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [statusFilter, setStatusFilter] = useState<TelegramLogStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [tableLoading, setTableLoading] = useState(false);

  const [selectedLog, setSelectedLog] = useState<TelegramLogEntry | null>(null);

  const fetchStats = useCallback(async () => {
    if (!enabled) return;
    setStatsLoading(true);
    try {
      const data = await telegramLogService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load telegram log stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [enabled]);

  const fetchLogs = useCallback(async () => {
    if (!enabled) return;
    setTableLoading(true);
    try {
      const data = await telegramLogService.getLogs({
        page,
        limit,
        status: statusFilter,
        search,
      });
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to load telegram logs:", err);
    } finally {
      setTableLoading(false);
    }
  }, [enabled, page, limit, statusFilter, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const removeLog = async (id: string) => {
    try {
      await telegramLogService.deleteLog(id);
      await Promise.all([fetchLogs(), fetchStats()]);
      if (selectedLog?.id === id) {
        setSelectedLog(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete log entry");
    }
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to permanently clear all Telegram ingestion logs?")) {
      return;
    }
    try {
      await telegramLogService.clearLogs();
      setSelectedLog(null);
      await Promise.all([fetchLogs(), fetchStats()]);
    } catch (err: any) {
      alert(err.message || "Failed to clear logs");
    }
  };

  return {
    stats,
    statsLoading,
    logs,
    total,
    page,
    limit,
    statusFilter,
    search,
    tableLoading,
    selectedLog,
    setSelectedLog,
    setPage,
    setStatusFilter,
    setSearch,
    removeLog,
    clearAll,
    refresh: () => Promise.all([fetchLogs(), fetchStats()]),
  };
}
