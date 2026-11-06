export interface KnowledgeLink {
  label: string;
  url: string;
}

export interface KnowledgeReaction {
  type: string;
  count: number;
}

export interface KnowledgeMetadata {
  id?: string;
  documentId?: string;
  hashtags: string[];
  mentions: string[];
  links: KnowledgeLink[];
  reactions: KnowledgeReaction[];
  hasMedia: boolean;
  mediaType?: "photo" | "video" | "file" | "audio" | null;
  forwarded: boolean;
  replied: boolean;
  originalAuthor?: string | null;
}

export interface KnowledgeDocument {
  id: string;
  source: string;
  sourceId: string;
  author: string;
  content: string;
  publishedAt: Date;
  editedAt?: Date | null;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: KnowledgeMetadata | null;
  chunks?: KnowledgeChunk[];
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  createdAt: Date;
  updatedAt: Date;
  embedding?: number[];
}

export interface CreateKnowledgeDTO {
  source?: string;
  sourceId?: string;
  author: string;
  content: string;
  contentType: string;
  publishedAt?: Date | string;
  metadata?: {
    hashtags?: string[];
    mentions?: string[];
    links?: KnowledgeLink[];
    reactions?: KnowledgeReaction[];
    hasMedia?: boolean;
    mediaType?: "photo" | "video" | "file" | "audio" | null;
    forwarded?: boolean;
    replied?: boolean;
    originalAuthor?: string | null;
  };
  forceFeed?: boolean;
}

export interface UpdateKnowledgeDTO {
  author?: string;
  content?: string;
  contentType?: string;
  publishedAt?: Date | string;
  regenerateChunks?: boolean;
}

export interface UpdateChunkDTO {
  content: string;
  reembed?: boolean;
}

export interface KnowledgeQueryFilter {
  page?: number;
  limit?: number;
  contentType?: string;
  author?: string;
  search?: string;
}

export interface KnowledgeStats {
  totalDocuments: number;
  totalChunks: number;
  contentTypes: { type: string; count: number }[];
  sources: { source: string; count: number }[];
}
