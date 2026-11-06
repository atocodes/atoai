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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSourceDTO {
  name?: string | null;
  type?: SourceType;
  status?: SourceStatus;
  channelId?: string | number | null;
  username?: string | null;
  url?: string | null;
  description?: string | null;
  metadata?: Record<string, any> | null;
}

export interface UpdateSourceDTO {
  name?: string | null;
  type?: SourceType;
  status?: SourceStatus;
  channelId?: string | number | null;
  username?: string | null;
  url?: string | null;
  description?: string | null;
  metadata?: Record<string, any> | null;
}

export interface SourceFilter {
  page?: number;
  limit?: number;
  type?: SourceType | "all";
  status?: SourceStatus | "all";
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