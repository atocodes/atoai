import { prisma } from "@/prisma/db";
import { IKnowledgeChunkRepo } from "../interface/knowledge.repo.interface";

function toPgVector(values: number[]): string {
  return `[${values.join(",")}]`;
}

export class KnowledgeChunkRepoImpl implements IKnowledgeChunkRepo {
  async createMany(
    documentId: string,
    chunks: { content: string; chunkIndex: number; embedding: number[] }[]
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
    embedding: number[]
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

  async findByDocumentId(documentId: string): Promise<any[]> {
    return prisma.knowledgeChunk.findMany({
      where: { documentId },
      orderBy: { chunkIndex: "asc" },
    });
  }

  async findById(chunkId: string): Promise<any> {
    return prisma.knowledgeChunk.findUnique({
      where: { id: chunkId },
    });
  }

  async update(
    chunkId: string,
    content: string,
    embedding?: number[]
  ): Promise<any> {
    if (embedding && embedding.length > 0) {
      const vector = toPgVector(embedding);
      await prisma.$executeRaw`
        UPDATE knowledge_chunks
        SET content = ${content},
            embedding = ${vector}::vector,
            updated_at = NOW()
        WHERE id = ${chunkId}
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE knowledge_chunks
        SET content = ${content},
            updated_at = NOW()
        WHERE id = ${chunkId}
      `;
    }
    return prisma.knowledgeChunk.findUnique({
      where: { id: chunkId },
    });
  }

  async delete(chunkId: string): Promise<boolean> {
    try {
      await prisma.knowledgeChunk.delete({
        where: { id: chunkId },
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await prisma.knowledgeChunk.deleteMany({
      where: { documentId },
    });
  }
}
