import { KnowledgeDocument } from "@/knowledge/types/knowledge";
import { KnowledgeRepo } from "../interface/knowledge.repo";
import { KnowledgeRepoImpl } from "../repo/knowledge.repo.impl";
import { KnowledgeChunkRepoImpl } from "../repo/knowledge-chunk.repo.impl";
import { chunkKnowledge } from "../chunker";
import { EmbeddingProvider } from "@/ai/embedding";
import { embeddingProvider as defaultEmbeddingProvider } from "@/ai/embeddings";
import { chatProvider } from "@/ai/chat";

export class KnowledgeService implements KnowledgeRepo {
  private knowledgeRepo = new KnowledgeRepoImpl();
  private chunkRepo = new KnowledgeChunkRepoImpl();
  private embeddingProvider: EmbeddingProvider;

  constructor(embeddingProvider?: EmbeddingProvider) {
    this.embeddingProvider = embeddingProvider ?? defaultEmbeddingProvider;
  }

  async create(data: KnowledgeDocument): Promise<any> {
    try {
      const exists = await this.findWithSourceId(data.sourceId);
      if (exists) {
        console.log(
          "DATA exists: ",
          data.contentType,
          data.sourceId,
          exists.id,
        );
        return exists;
      }

      // 1. save the document
      const document = await this.knowledgeRepo.create(data);

      // 2. Split the content into chunks
      // const chunks = chunkKnowledge(document.content);
      const chunks = await chatProvider.smartChuncker(document.content);
      if (chunks.length === 0) {
        return document;
      }

      // 3. Generate embeddings
      const embededChunks = [];

      for (const chunk of chunks) {
        const embedding = await this.embeddingProvider.embed(chunk.content);
        if (!embedding) {
          console.log(
            `[KnowledgeService] Failed to generate embedding for chunk ${chunk.chunkIndex}`,
          );
          continue;
        }
        embededChunks.push({
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
          embedding,
        });
      }


      // 4. Save chunks + embeddings
      await this.chunkRepo.createMany(document.id, embededChunks);

      return document;
    } catch (error) {
      throw new Error(` [CREATE KNOWLEDGE] ${error}`);
    }
  }

  async findWithSourceId(sourceId: string): Promise<any> {
    return this.knowledgeRepo.findWithSourceId(sourceId);
  }
}
