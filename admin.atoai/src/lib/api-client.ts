const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export interface KnowledgeDocumentSummary {
  id: string;
  source: string;
  sourceId: string;
  author: string;
  content: string;
  contentType: string;
  publishedAt: string;
  createdAt: string;
  metadata?: {
    hashtags: string[];
    mentions: string[];
    hasMedia: boolean;
    mediaType?: string | null;
    links: { label: string; url: string }[];
    reactions: { type: string; count: number }[];
  } | null;
  _count?: {
    chunks: number;
  };
}

export interface KnowledgeDetail extends KnowledgeDocumentSummary {
  chunks: {
    id: string;
    content: string;
    chunkIndex: number;
    createdAt: string;
  }[];
}

export interface KnowledgeStatsResponse {
  totalDocuments: number;
  totalChunks: number;
  contentTypes: { type: string; count: number }[];
  sources: { source: string; count: number }[];
}

export interface SearchResultItem {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  distance: number;
  sourceId: string;
  author: string;
  contentType: string;
  publishedAt: string;
}

export interface ChatAnswerResponse {
  success: boolean;
  answer: string;
  sources: {
    sourceId: string;
    author: string;
    contentType: string;
    distance: number;
    chunkContent: string;
  }[];
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${SERVER_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
  }
  return data;
}

export const serverApi = {
  // Auth
  async checkAdminStatus() {
    return request<{ authenticated: boolean; user?: any; isAdmin: boolean }>("/api/auth/me");
  },

  async checkHasAdmin() {
    return request<{ hasAdmin: boolean }>("/api/auth/setup-admin");
  },

  async setupInitialAdmin(payload: { name: string; email: string; password: string }) {
    return request<{ success: boolean; user: any }>("/api/auth/setup-admin", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Knowledge
  async getStats() {
    const data = await request<{ success: boolean; stats: KnowledgeStatsResponse }>("/api/knowledge/stats");
    return data.stats;
  },

  async getDocuments(params: { page?: number; limit?: number; contentType?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.contentType && params.contentType !== "all") query.set("contentType", params.contentType);
    if (params.search) query.set("search", params.search);

    return request<{
      documents: KnowledgeDocumentSummary[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/knowledge?${query.toString()}`);
  },

  async getDocument(id: string) {
    const data = await request<{ success: boolean; document: KnowledgeDetail }>(`/api/knowledge/${id}`);
    return data.document;
  },

  async createDocument(payload: {
    author: string;
    content: string;
    contentType: string;
    sourceId?: string;
    source?: string;
    metadata?: any;
  }) {
    return request<{ success: boolean; document: any }>("/api/knowledge", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async deleteDocument(id: string) {
    return request<{ success: boolean; message: string }>(`/api/knowledge/${id}`, {
      method: "DELETE",
    });
  },

  async search(query: string, options: { limit?: number; contentType?: string } = {}) {
    return request<{ success: boolean; count: number; results: SearchResultItem[] }>("/api/knowledge/search", {
      method: "POST",
      body: JSON.stringify({ query, ...options }),
    });
  },

  // Chat / RAG
  async askChat(question: string) {
    return request<ChatAnswerResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
  },
};
