export type TelegramLogStatus = "success" | "skipped" | "failed";

export interface TelegramLogEntry {
  id: string;
  messageId: string;
  chatId: string | null;
  chatTitle: string | null;
  author: string | null;
  contentType: string | null;
  status: TelegramLogStatus;
  rawSnippet: string | null;
  documentId: string | null;
  chunksCount: number;
  reason: string | null;
  source: string;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface TelegramLogStats {
  total: number;
  success: number;
  skipped: number;
  failed: number;
  lastIngestedAt: string | null;
}

export interface TelegramLogFilterOptions {
  page?: number;
  limit?: number;
  status?: TelegramLogStatus | "all";
  search?: string;
}
