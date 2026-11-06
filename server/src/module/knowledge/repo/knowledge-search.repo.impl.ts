import { prisma } from "@/prisma/db";
import { Prisma } from "@/prisma/generated/prisma/client";
import {
  KnowledgeSearchOptions,
  KnowledgeSearchResult,
} from "../interface/knowledge-search.interface";
import { IKnowledgeSearchRepo } from "../interface/knowledge.repo.interface";

export class KnowledgeSearchRepoImpl implements IKnowledgeSearchRepo {
  async search(
    embedding: number[],
    options: KnowledgeSearchOptions = {}
  ): Promise<KnowledgeSearchResult[]> {
    const vector = `[${embedding.join(",")}]`;
    const conditions: Prisma.Sql[] = [];

    if (options.contentType && options.contentType !== "all") {
      conditions.push(Prisma.sql`kd.content_type = ${options.contentType}`);
    }

    if (options.from) {
      const fromDate = new Date(options.from);
      if (!isNaN(fromDate.getTime())) {
        conditions.push(Prisma.sql`kd.published_at >= ${fromDate}`);
      }
    }

    if (options.to) {
      const toDate = new Date(options.to);
      if (!isNaN(toDate.getTime())) {
        conditions.push(Prisma.sql`kd.published_at < ${toDate}`);
      }
    }

    if (
      options.hashtags &&
      Array.isArray(options.hashtags) &&
      options.hashtags.length > 0
    ) {
      conditions.push(Prisma.sql`km.hashtags @> ${options.hashtags}::text[]`);
    }

    if (
      options.mentions &&
      Array.isArray(options.mentions) &&
      options.mentions.length > 0
    ) {
      conditions.push(Prisma.sql`km.mentions @> ${options.mentions}::text[]`);
    }

    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
        : Prisma.empty;

    const limit =
      typeof options.limit === "number" && options.limit > 0 ? options.limit : 10;

    return prisma.$queryRaw<KnowledgeSearchResult[]>`
      SELECT
        kc.id,
        kc.document_id AS "documentId",
        kc.content,
        kc.chunk_index AS "chunkIndex",
        kc.embedding <=> ${vector}::vector AS distance,
        kd.source_id AS "sourceId",
        kd.author,
        kd.content_type AS "contentType",
        kd.published_at AS "publishedAt"
      FROM knowledge_chunks kc
      JOIN knowledge_documents kd
        ON kd.id = kc.document_id
      JOIN knowledge_metadata km
        ON km.document_id = kd.id
      ${whereClause}
      ORDER BY kc.embedding <=> ${vector}::vector
      LIMIT ${limit}
    `;
  }
}
