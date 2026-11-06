import { prisma } from "@/prisma/db";
import {
  CreateTelegramLogDTO,
  TelegramLogEntry,
  TelegramLogFilter,
  TelegramLogStats,
  TelegramLogStatus,
} from "../interface/telegram-log.interface";
import { ITelegramLogRepo } from "../interface/telegram-log.repo.interface";

export class TelegramLogRepoImpl implements ITelegramLogRepo {
  async create(dto: CreateTelegramLogDTO): Promise<TelegramLogEntry> {
    const created = await prisma.telegramIngestionLog.create({
      data: {
        messageId: String(dto.messageId),
        chatId: dto.chatId ? String(dto.chatId) : null,
        chatTitle: dto.chatTitle || null,
        author: dto.author || null,
        contentType: dto.contentType || null,
        status: dto.status,
        rawSnippet: dto.rawSnippet ? dto.rawSnippet.slice(0, 1000) : null,
        documentId: dto.documentId || null,
        chunksCount: dto.chunksCount || 0,
        reason: dto.reason || null,
        source: dto.source || "telegram_channel_post",
        metadata: dto.metadata || {},
      },
    });

    return created as unknown as TelegramLogEntry;
  }

  async list(filter: TelegramLogFilter): Promise<{ logs: TelegramLogEntry[]; total: number }> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.status && filter.status !== "all") {
      where.status = filter.status;
    }

    if (filter.search && filter.search.trim()) {
      const term = filter.search.trim();
      where.OR = [
        { messageId: { contains: term, mode: "insensitive" } },
        { author: { contains: term, mode: "insensitive" } },
        { chatTitle: { contains: term, mode: "insensitive" } },
        { rawSnippet: { contains: term, mode: "insensitive" } },
        { reason: { contains: term, mode: "insensitive" } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.telegramIngestionLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.telegramIngestionLog.count({ where }),
    ]);

    return {
      logs: logs as unknown as TelegramLogEntry[],
      total,
    };
  }

  async findById(id: string): Promise<TelegramLogEntry | null> {
    const log = await prisma.telegramIngestionLog.findUnique({
      where: { id },
    });
    return log as unknown as TelegramLogEntry | null;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.telegramIngestionLog.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteAll(): Promise<number> {
    const res = await prisma.telegramIngestionLog.deleteMany();
    return res.count;
  }

  async getStats(): Promise<TelegramLogStats> {
    const [total, success, skipped, failed, latest] = await Promise.all([
      prisma.telegramIngestionLog.count(),
      prisma.telegramIngestionLog.count({ where: { status: "success" } }),
      prisma.telegramIngestionLog.count({ where: { status: "skipped" } }),
      prisma.telegramIngestionLog.count({ where: { status: "failed" } }),
      prisma.telegramIngestionLog.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    return {
      total,
      success,
      skipped,
      failed,
      lastIngestedAt: latest?.createdAt || null,
    };
  }
}
