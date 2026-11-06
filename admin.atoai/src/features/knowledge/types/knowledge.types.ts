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

export interface KnowledgeStats {
  totalDocuments: number;
  totalChunks: number;
  contentTypes: { type: string; count: number }[];
  sources: { source: string; count: number }[];
}

export interface IngestDocumentInput {
  author: string;
  content: string;
  contentType: string;
  source?: string;
  sourceId?: string;
  metadata?: {
    hashtags?: string[];
    mentions?: string[];
    links?: { label: string; url: string }[];
    reactions?: { type: string; count: number }[];
    hasMedia?: boolean;
    mediaType?: string | null;
  };
}

export interface KnowledgeFilterOptions {
  page?: number;
  limit?: number;
  contentType?: string;
  search?: string;
}

export interface UpdateKnowledgeInput {
  author?: string;
  content?: string;
  contentType?: string;
  publishedAt?: string;
  regenerateChunks?: boolean;
}

export interface UpdateChunkInput {
  content: string;
  reembed?: boolean;
}

