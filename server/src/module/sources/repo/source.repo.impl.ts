import { prisma } from "@/prisma/db";
import {
  CreateSourceDTO,
  Source,
  SourceFilter,
  SourceStats,
  SourceStatus,
  SourceType,
  UpdateSourceDTO,
} from "../interface/source.interface";
import { ISourceRepo } from "../interface/source.repo.interface";

export class SourceRepoImpl implements ISourceRepo {
  async create(dto: CreateSourceDTO): Promise<Source> {
    const username = dto.username
      ? dto.username.replace(/^@/, "").trim()
      : null;
    const channelId =
      dto.channelId !== undefined && dto.channelId !== null
        ? String(dto.channelId).trim()
        : null;

    const created = await prisma.source.create({
      data: {
        name: dto.name ? dto.name.trim() : null,
        type: (dto.type as any) || "TELEGRAM",
        status: (dto.status as any) || "ACTIVE",
        channelId: channelId || null,
        username: username || null,
        url: dto.url ? dto.url.trim() : null,
        description: dto.description ? dto.description.trim() : null,
        metadata: dto.metadata || {},
      },
    });

    return created as unknown as Source;
  }

  async update(id: string, dto: UpdateSourceDTO): Promise<Source> {
    const data: any = {};

    if (dto.name !== undefined) data.name = dto.name ? dto.name.trim() : null;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.channelId !== undefined) {
      data.channelId =
        dto.channelId !== null && dto.channelId !== ""
          ? String(dto.channelId).trim()
          : null;
    }
    if (dto.username !== undefined) {
      data.username =
        dto.username !== null && dto.username !== ""
          ? dto.username.replace(/^@/, "").trim()
          : null;
    }
    if (dto.url !== undefined) data.url = dto.url ? dto.url.trim() : null;
    if (dto.description !== undefined) {
      data.description = dto.description ? dto.description.trim() : null;
    }
    if (dto.metadata !== undefined) data.metadata = dto.metadata;

    const updated = await prisma.source.update({
      where: { id },
      data,
    });

    return updated as unknown as Source;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.source.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async findById(id: string): Promise<Source | null> {
    const found = await prisma.source.findUnique({
      where: { id },
    });
    return (found as unknown as Source) || null;
  }

  async findByChannelId(channelId: string): Promise<Source | null> {
    const cleanId = String(channelId).trim();
    const found = await prisma.source.findUnique({
      where: { channelId: cleanId },
    });
    return (found as unknown as Source) || null;
  }

  async findByUsername(username: string): Promise<Source | null> {
    const clean = username.replace(/^@/, "").trim();
    const found = await prisma.source.findFirst({
      where: {
        username: {
          equals: clean,
          mode: "insensitive",
        },
      },
    });
    return (found as unknown as Source) || null;
  }

  async findByChannelIdOrUsername(
    channelId?: string | null,
    username?: string | null
  ): Promise<Source | null> {
    if (channelId) {
      const byId = await this.findByChannelId(channelId);
      if (byId) return byId;
    }

    if (username) {
      const byUser = await this.findByUsername(username);
      if (byUser) return byUser;
    }

    return null;
  }

  async getActiveSources(): Promise<Source[]> {
    const sources = await prisma.source.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
    });
    return sources as unknown as Source[];
  }

  async list(
    filter: SourceFilter
  ): Promise<{ sources: Source[]; total: number }> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.status && filter.status !== "all") {
      where.status = filter.status;
    }

    if (filter.type && filter.type !== "all") {
      where.type = filter.type;
    }

    if (filter.search && filter.search.trim()) {
      const term = filter.search.trim();
      const cleanTerm = term.replace(/^@/, "");
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { username: { contains: cleanTerm, mode: "insensitive" } },
        { channelId: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { url: { contains: term, mode: "insensitive" } },
      ];
    }

    const [sources, total] = await Promise.all([
      prisma.source.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.source.count({ where }),
    ]);

    return {
      sources: sources as unknown as Source[],
      total,
    };
  }

  async getStats(): Promise<SourceStats> {
    const [total, active, inactive, archived, telegramCount, websiteCount, otherCount] =
      await Promise.all([
        prisma.source.count(),
        prisma.source.count({ where: { status: "ACTIVE" } }),
        prisma.source.count({ where: { status: "INACTIVE" } }),
        prisma.source.count({ where: { status: "ARCHIVED" } }),
        prisma.source.count({ where: { type: "TELEGRAM" } }),
        prisma.source.count({ where: { type: "WEBSITE" } }),
        prisma.source.count({ where: { type: "OTHER" } }),
      ]);

    return {
      total,
      active,
      inactive,
      archived,
      telegramCount,
      websiteCount,
      otherCount,
    };
  }
}