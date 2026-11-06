import {
  CreateKnowledgeDTO,
  KnowledgeQueryFilter,
  KnowledgeStats,
  UpdateKnowledgeDTO,
} from "../interface/knowledge.interface";
import {
  IKnowledgeChunkRepo,
  IKnowledgeRepo,
} from "../interface/knowledge.repo.interface";
import { IKnowledgeService } from "../interface/knowledge.service.interface";
import { KnowledgeRepoImpl } from "../repo/knowledge.repo.impl";
import { KnowledgeChunkRepoImpl } from "../repo/knowledge-chunk.repo.impl";
import { chunkKnowledge } from "@/db/knowledge/chunker";
import { EmbeddingProvider } from "@/ai/embedding";
import { embeddingProvider as defaultEmbeddingProvider } from "@/ai/embeddings";
import { chatProvider } from "@/ai/chat";
import { createNanoId } from "@/lib/nanoid";

export class KnowledgeService implements IKnowledgeService {
  private knowledgeRepo: IKnowledgeRepo;
  private chunkRepo: IKnowledgeChunkRepo;
  private embeddingProvider: EmbeddingProvider;

  constructor(
    knowledgeRepo?: IKnowledgeRepo,
    chunkRepo?: IKnowledgeChunkRepo,
    embeddingProvider?: EmbeddingProvider,
  ) {
    this.knowledgeRepo = knowledgeRepo ?? new KnowledgeRepoImpl();
    this.chunkRepo = chunkRepo ?? new KnowledgeChunkRepoImpl();
    this.embeddingProvider = embeddingProvider ?? defaultEmbeddingProvider;
  }

  private async processAndSaveChunks(
    documentId: string,
    content: string,
  ): Promise<number> {
    let chunks: { content: string; chunkIndex: number }[] = [];
    try {
      chunks = await chatProvider.smartChuncker(content);
    } catch (err) {
      console.warn(
        "[KnowledgeService] smartChuncker failed, falling back to rule-based chunker:",
        err,
      );
    }

    if (!chunks || chunks.length === 0) {
      chunks = chunkKnowledge(content);
    }

    if (!chunks || chunks.length === 0) {
      return 0;
    }

    const embeddedChunks: {
      content: string;
      chunkIndex: number;
      embedding: number[];
    }[] = [];

    for (const chunk of chunks) {
      try {
        const embedding = await this.embeddingProvider.embed(chunk.content);
        if (embedding && embedding.length > 0) {
          embeddedChunks.push({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            embedding,
          });
        }
      } catch (embErr) {
        console.error(
          `[KnowledgeService] Failed to embed chunk ${chunk.chunkIndex}:`,
          embErr,
        );
      }
    }

    if (embeddedChunks.length > 0) {
      await this.chunkRepo.createMany(documentId, embeddedChunks);
    }

    return embeddedChunks.length;
  }

  async create(data: CreateKnowledgeDTO): Promise<any> {
    try {
      if (data.sourceId && data.forceFeed == false) {
        const exists = await this.findWithSourceId(data.sourceId);
        if (exists) {
          throw new Error(
            `[KnowledgeService.create]: Document with sourceId ${data.sourceId} already exists`,
          );
        }
      }
      if (data.forceFeed) {
        data.sourceId = `${data.sourceId}-${createNanoId(4)}`;
      }
      // 1. Save document and metadata in DB
      const document = await this.knowledgeRepo.create(data);

      // 2. Process and save chunks with embeddings
      await this.processAndSaveChunks(document.id, document.content);

      return await this.findById(document.id);
    } catch (error) {
      console.error("[KnowledgeService.create] error:", error);
      throw new Error(`[KnowledgeService.create] ${error}`);
    }
  }

  async update(id: string, data: UpdateKnowledgeDTO): Promise<any> {
    try {
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error("Document not found");
      }

      const updated = await this.knowledgeRepo.update(id, data);

      // If regenerateChunks is requested or content changed with regenerate requested
      if (data.regenerateChunks && data.content !== undefined) {
        await this.chunkRepo.deleteByDocumentId(id);
        await this.processAndSaveChunks(id, data.content);
      } else if (data.regenerateChunks) {
        await this.chunkRepo.deleteByDocumentId(id);
        await this.processAndSaveChunks(id, updated.content);
      }

      return await this.findById(id);
    } catch (error) {
      console.error("[KnowledgeService.update] error:", error);
      throw new Error(`[KnowledgeService.update] ${error}`);
    }
  }

  async regenerateChunks(documentId: string): Promise<any> {
    try {
      const document = await this.findById(documentId);
      if (!document) {
        throw new Error("Document not found");
      }

      // 1. Clear existing chunks
      await this.chunkRepo.deleteByDocumentId(documentId);

      // 2. Re-chunk and re-embed
      await this.processAndSaveChunks(documentId, document.content);

      // 3. Return fresh document with new chunks
      return await this.findById(documentId);
    } catch (error) {
      console.error("[KnowledgeService.regenerateChunks] error:", error);
      throw new Error(`[KnowledgeService.regenerateChunks] ${error}`);
    }
  }

  async updateChunk(
    documentId: string,
    chunkId: string,
    content: string,
    reembed: boolean = true,
  ): Promise<any> {
    try {
      const chunk = await this.chunkRepo.findById(chunkId);
      if (!chunk) {
        throw new Error("Chunk not found");
      }

      let embedding: number[] | undefined;
      if (reembed) {
        try {
          const emb = await this.embeddingProvider.embed(content);
          if (emb && emb.length > 0) {
            embedding = emb;
          }
        } catch (err) {
          console.error(
            `[KnowledgeService.updateChunk] Embedding generation failed:`,
            err,
          );
        }
      }

      await this.chunkRepo.update(chunkId, content, embedding);

      return await this.findById(documentId);
    } catch (error) {
      console.error("[KnowledgeService.updateChunk] error:", error);
      throw new Error(`[KnowledgeService.updateChunk] ${error}`);
    }
  }

  async deleteChunk(documentId: string, chunkId: string): Promise<boolean> {
    try {
      const chunk = await this.chunkRepo.findById(chunkId);
      if (!chunk) {
        throw new Error("Chunk not found");
      }
      return await this.chunkRepo.delete(chunkId);
    } catch (error) {
      console.error("[KnowledgeService.deleteChunk] error:", error);
      throw new Error(`[KnowledgeService.deleteChunk] ${error}`);
    }
  }

  async findWithSourceId(sourceId: string, author?: string): Promise<any> {
    return this.knowledgeRepo.findWithSourceId(sourceId, author);
  }

  async findById(id: string): Promise<any> {
    return this.knowledgeRepo.findById(id);
  }

  async list(filter: KnowledgeQueryFilter) {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 10));
    const result = await this.knowledgeRepo.findMany({
      ...filter,
      page,
      limit,
    });
    return {
      documents: result.documents,
      total: result.total,
      page,
      limit,
    };
  }

  async delete(id: string): Promise<boolean> {
    return this.knowledgeRepo.deleteById(id);
  }

  async getStats(): Promise<KnowledgeStats> {
    return this.knowledgeRepo.getStats();
  }
}

export const knowledgeService = new KnowledgeService();
