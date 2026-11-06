import { prisma } from "@/prisma/db";

import { KnowledgeChunkRepo } from "../interface/knowledge-chunk.repo";

function toPgVector(values: number[]): string {
  return `[${values.join(",")}]`;
}

export class KnowledgeChunkRepoImpl implements KnowledgeChunkRepo {
  async createMany(
    documentId: string,
    chunks: { content: string; chunkIndex: number; embedding: number[] }[],
  ): Promise<void> {
    for (const chunk of chunks) {
      const vector = toPgVector(chunk.embedding);

      await prisma.$executeRaw`
        INSERT INTO knowledge_chunks (
          id,
          document_id,
          content,
          chunk_index,
          embedding,
          created_at,
          updated_at
        )
        VALUES (
          gen_random_uuid(),
          ${documentId},
          ${chunk.content},
          ${chunk.chunkIndex},
          ${vector}::vector,
          NOW(),
          NOW()
        )
      `;
    }
  }
  async create(
    documentId: string,
    content: string,
    chunkIndex: number,
    embedding: number[],
  ): Promise<void> {
    const vector = toPgVector(embedding);

    await prisma.$executeRaw`
      INSERT INTO knowledge_chunks (
        id,
        document_id,
        content,
        chunk_index,
        embedding,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        ${documentId},
        ${content},
        ${chunkIndex},
        ${vector}::vector,
        NOW(),
        NOW()
      )
    `;
  }
}
