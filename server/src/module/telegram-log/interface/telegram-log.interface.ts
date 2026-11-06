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
  createdAt: Date;
}

export interface CreateTelegramLogDTO {
  messageId: string;
  chatId?: string | null;
  chatTitle?: string | null;
  author?: string | null;
  contentType?: string | null;
  status: TelegramLogStatus;
  rawSnippet?: string | null;
  documentId?: string | null;
  chunksCount?: number;
  reason?: string | null;
  source?: string;
  metadata?: Record<string, any>;
}

export interface TelegramLogFilter {
  page?: number;
  limit?: number;
  status?: TelegramLogStatus | "all";
  search?: string;
}

export interface TelegramLogStats {
  total: number;
  success: number;
  skipped: number;
  failed: number;
  lastIngestedAt: Date | null;
}
