import { authService } from "@/features/auth/services/auth.service";
import {
  IngestDocumentInput,
  KnowledgeDetail,
  KnowledgeDocumentSummary,
  KnowledgeFilterOptions,
  KnowledgeStats,
  UpdateKnowledgeInput,
} from "../types/knowledge.types";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const knowledgeService = {
  async getStats(): Promise<KnowledgeStats> {
    const res = await fetch(`${SERVER_URL}/api/knowledge/stats`, {
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load stats");
    return data.stats;
  },

  async getDocuments(params: KnowledgeFilterOptions = {}): Promise<{
    documents: KnowledgeDocumentSummary[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.contentType && params.contentType !== "all") query.set("contentType", params.contentType);
    if (params.search) query.set("search", params.search);

    const res = await fetch(`${SERVER_URL}/api/knowledge?${query.toString()}`, {
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load documents");
    return data;
  },

  async getDocument(id: string): Promise<KnowledgeDetail> {
    const res = await fetch(`${SERVER_URL}/api/knowledge/${id}`, {
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load document");
    return data.document;
  },

  async createDocument(input: IngestDocumentInput) {
    const res = await fetch(`${SERVER_URL}/api/knowledge`, {
      method: "POST",
      credentials: "include",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to ingest document");
    return data.document;
  },

  async deleteDocument(id: string) {
    const res = await fetch(`${SERVER_URL}/api/knowledge/${id}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete document");
    return data;
  },

  async updateDocument(id: string, input: UpdateKnowledgeInput): Promise<KnowledgeDetail> {
    const res = await fetch(`${SERVER_URL}/api/knowledge/${id}`, {
      method: "PATCH",
      headers: authService.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update document");
    return data.document;
  },

  async regenerateChunks(id: string): Promise<KnowledgeDetail> {
    const res = await fetch(`${SERVER_URL}/api/knowledge/${id}/regenerate`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to regenerate chunks");
    return data.document;
  },

  async updateChunk(
    documentId: string,
    chunkId: string,
    content: string,
    reembed: boolean = true
  ): Promise<KnowledgeDetail> {
    const res = await fetch(
      `${SERVER_URL}/api/knowledge/${documentId}/chunks/${chunkId}`,
      {
        method: "PATCH",
        headers: authService.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ content, reembed }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update chunk");
    return data.document;
  },

  async deleteChunk(documentId: string, chunkId: string): Promise<KnowledgeDetail> {
    const res = await fetch(
      `${SERVER_URL}/api/knowledge/${documentId}/chunks/${chunkId}`,
      {
        method: "DELETE",
        headers: authService.getAuthHeaders(),
        credentials: "include",
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete chunk");
    return data.document;
  },
};

