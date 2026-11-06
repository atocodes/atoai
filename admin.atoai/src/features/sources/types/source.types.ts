export type SourceType = "TELEGRAM" | "WEBSITE" | "OTHER";
export type SourceStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "DELETED";

export interface Source {
  id: string;
  name?: string | null;
  type: SourceType;
  status: SourceStatus;
  channelId?: string | null;
  username?: string | null;
  url?: string | null;
  description?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSourcePayload {
  name?: string;
  type?: SourceType;
  status?: SourceStatus;
  channelId?: string | null;
  username?: string | null;
  url?: string | null;
  description?: string | null;
  metadata?: Record<string, any>;
}

export interface UpdateSourcePayload {
  name?: string;
  type?: SourceType;
  status?: SourceStatus;
  channelId?: string | null;
  username?: string | null;
  url?: string | null;
  description?: string | null;
  metadata?: Record<string, any>;
}

export interface SourceFilterOptions {
  page?: number;
  limit?: number;
  status?: SourceStatus | "all";
  type?: SourceType | "all";
  search?: string;
}

export interface SourceStats {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  telegramCount: number;
  websiteCount: number;
  otherCount: number;
}
