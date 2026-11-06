import { authService } from "@/features/auth/services/auth.service";
import {
  TelegramLogEntry,
  TelegramLogFilterOptions,
  TelegramLogStats,
} from "../types/telegram-log.types";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const telegramLogService = {
  async getStats(): Promise<TelegramLogStats> {
    const res = await fetch(`${SERVER_URL}/api/telegram/logs/stats`, {
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load log stats");
    return data.stats;
  },

  async getLogs(params: TelegramLogFilterOptions = {}): Promise<{
    logs: TelegramLogEntry[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.search) query.set("search", params.search);

    const res = await fetch(`${SERVER_URL}/api/telegram/logs?${query.toString()}`, {
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load telegram logs");
    return data;
  },

  async getLog(id: string): Promise<TelegramLogEntry> {
    const res = await fetch(`${SERVER_URL}/api/telegram/logs/${id}`, {
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load log details");
    return data.log;
  },

  async deleteLog(id: string): Promise<boolean> {
    const res = await fetch(`${SERVER_URL}/api/telegram/logs/${id}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete log entry");
    return true;
  },

  async clearLogs(): Promise<number> {
    const res = await fetch(`${SERVER_URL}/api/telegram/logs`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to clear logs");
    return data.deletedCount || 0;
  },
};
