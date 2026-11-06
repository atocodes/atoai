import { prisma } from "@/prisma/db";
import { Prisma } from "@/prisma/generated/prisma/client";
import {
  CreateKnowledgeDTO,
  KnowledgeQueryFilter,
  KnowledgeStats,
  UpdateKnowledgeDTO,
} from "../interface/knowledge.interface";
import { IKnowledgeRepo } from "../interface/knowledge.repo.interface";

export class KnowledgeRepoImpl implements IKnowledgeRepo {
  async findWithSourceId(sourceId: string, author?: string): Promise<any> {
    const query = author ? { author, sourceId } : { sourceId };
    return prisma.knowledgeDocument.findUnique({
      where: query,
      include: {
        metadata: {
          include: {
            links: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<any> {
    return prisma.knowledgeDocument.findUnique({
      where: { id },
      include: {
        metadata: {
          include: {
            links: true,
          },
        },
        chunks: {
          orderBy: { chunkIndex: "asc" },
        },
      },
    });
  }

  async create(data: CreateKnowledgeDTO): Promise<any> {
    const { metadata, ...docData } = data;
    const sourceId =
      docData.sourceId ||
      `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const source = docData.source || "admin";
    const publishedAt = docData.publishedAt
      ? new Date(docData.publishedAt)
      : new Date();

    const links = metadata?.links || [];
    const reactions = metadata?.reactions || [];

    const document = await prisma.knowledgeDocument.create({
      data: {
        source,
        sourceId,
        author: docData.author,
        content: docData.content,
        contentType: docData.contentType,
        publishedAt,
        metadata: {
          create: {
            hashtags: metadata?.hashtags || [],
            mentions: metadata?.mentions || [],
            reactions: reactions as unknown as Prisma.InputJsonValue,
            hasMedia: metadata?.hasMedia ?? false,
            mediaType: metadata?.mediaType ?? null,
            forwarded: metadata?.forwarded ?? false,
            replied: metadata?.replied ?? false,
            originalAuthor: metadata?.originalAuthor ?? null,
            links: {
              createMany: {
                data: links.map((link) => ({
                  label: link.label,
                  url: link.url,
                })),
              },
            },
          },
        },
      },
      include: {
        metadata: {
          include: {
            links: true,
          },
        },
      },
    });

    return document;
  }

  async update(id: string, data: UpdateKnowledgeDTO): Promise<any> {
    const updateData: Prisma.KnowledgeDocumentUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.author !== undefined) updateData.author = data.author;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.contentType !== undefined)
      updateData.contentType = data.contentType;
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = new Date(data.publishedAt);
    }

    return prisma.knowledgeDocument.update({
      where: { id },
      data: updateData,
      include: {
        metadata: {
          include: {
            links: true,
          },
        },
        chunks: {
          orderBy: { chunkIndex: "asc" },
        },
      },
    });
  }

  async findMany(
    filter: KnowledgeQueryFilter,
  ): Promise<{ documents: any[]; total: number }> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.KnowledgeDocumentWhereInput = {};

    if (filter.contentType && filter.contentType !== "all") {
      where.contentType = filter.contentType;
    }

    if (filter.author) {
      where.author = { contains: filter.author, mode: "insensitive" };
    }

    if (filter.search) {
      where.OR = [
        { content: { contains: filter.search, mode: "insensitive" } },
        { author: { contains: filter.search, mode: "insensitive" } },
        { sourceId: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.knowledgeDocument.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          metadata: {
            include: {
              links: true,
            },
          },
          _count: {
            select: { chunks: true },
          },
        },
      }),
      prisma.knowledgeDocument.count({ where }),
    ]);

    return { documents, total };
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      await prisma.knowledgeDocument.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getStats(): Promise<KnowledgeStats> {
    const [totalDocuments, totalChunks, typeCounts, sourceCounts] =
      await Promise.all([
        prisma.knowledgeDocument.count(),
        prisma.knowledgeChunk.count(),
        prisma.knowledgeDocument.groupBy({
          by: ["contentType"],
          _count: { id: true },
        }),
        prisma.knowledgeDocument.groupBy({
          by: ["source"],
          _count: { id: true },
        }),
      ]);

    return {
      totalDocuments,
      totalChunks,
      contentTypes: typeCounts.map((tc) => ({
        type: tc.contentType,
        count: tc._count.id,
      })),
      sources: sourceCounts.map((sc) => ({
        source: sc.source,
        count: sc._count.id,
      })),
    };
  }
}
