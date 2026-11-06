import { authService } from "@/features/auth/services/auth.service";
import {
  CreateSourcePayload,
  Source,
  SourceFilterOptions,
  SourceStats,
  UpdateSourcePayload,
} from "../types/source.types";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const sourceService = {
  async getStats(): Promise<SourceStats> {
    const res = await fetch(`${SERVER_URL}/api/sources/stats`, {
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load source stats");
    return data.stats;
  },

  async getSources(params: SourceFilterOptions = {}): Promise<{
    sources: Source[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.type && params.type !== "all") query.set("type", params.type);
    if (params.search) query.set("search", params.search);

    const res = await fetch(`${SERVER_URL}/api/sources?${query.toString()}`, {
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load sources");
    return {
      sources: data.sources || [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 20,
    };
  },

  async getSource(id: string): Promise<Source> {
    const res = await fetch(`${SERVER_URL}/api/sources/${id}`, {
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load source details");
    return data.source;
  },

  async createSource(payload: CreateSourcePayload): Promise<Source> {
    const res = await fetch(`${SERVER_URL}/api/sources`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create source");
    return data.source;
  },

  async updateSource(id: string, payload: UpdateSourcePayload): Promise<Source> {
    const res = await fetch(`${SERVER_URL}/api/sources/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update source");
    return data.source;
  },

  async toggleStatus(id: string): Promise<Source> {
    const res = await fetch(`${SERVER_URL}/api/sources/${id}/toggle`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to toggle source status");
    return data.source;
  },

  async deleteSource(id: string): Promise<boolean> {
    const res = await fetch(`${SERVER_URL}/api/sources/${id}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete source");
    return true;
  },
};
