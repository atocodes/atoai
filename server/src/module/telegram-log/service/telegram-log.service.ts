import {
  CreateTelegramLogDTO,
  TelegramLogEntry,
  TelegramLogFilter,
  TelegramLogStats,
} from "../interface/telegram-log.interface";
import { ITelegramLogRepo } from "../interface/telegram-log.repo.interface";
import { ITelegramLogService } from "../interface/telegram-log.service.interface";
import { TelegramLogRepoImpl } from "../repo/telegram-log.repo.impl";

export class TelegramLogService implements ITelegramLogService {
  private repo: ITelegramLogRepo;

  constructor(repo?: ITelegramLogRepo) {
    this.repo = repo ?? new TelegramLogRepoImpl();
  }

  async log(dto: CreateTelegramLogDTO): Promise<TelegramLogEntry> {
    try {
      return await this.repo.create(dto);
    } catch (err) {
      console.error("[TelegramLogService.log] Failed to persist log entry:", err);
      // Return a transient fallback object so callers don't crash
      return {
        id: "fallback-" + Date.now(),
        messageId: dto.messageId,
        chatId: dto.chatId || null,
        chatTitle: dto.chatTitle || null,
        author: dto.author || null,
        contentType: dto.contentType || null,
        status: dto.status,
        rawSnippet: dto.rawSnippet || null,
        documentId: dto.documentId || null,
        chunksCount: dto.chunksCount || 0,
        reason: dto.reason || null,
        source: dto.source || "telegram",
        metadata: dto.metadata || null,
        createdAt: new Date(),
      };
    }
  }

  async listLogs(filter: TelegramLogFilter): Promise<{
    logs: TelegramLogEntry[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const result = await this.repo.list({ ...filter, page, limit });
    return {
      logs: result.logs,
      total: result.total,
      page,
      limit,
    };
  }

  async getLogById(id: string): Promise<TelegramLogEntry | null> {
    return this.repo.findById(id);
  }

  async deleteLog(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async clearLogs(): Promise<number> {
    return this.repo.deleteAll();
  }

  async getStats(): Promise<TelegramLogStats> {
    return this.repo.getStats();
  }
}

export const telegramLogService = new TelegramLogService();
