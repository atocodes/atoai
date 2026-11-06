import { KnowledgeChunkRepoImpl } from "./repo/knowledge-chunk.repo.impl";
import { KnowledgeService } from "./service/knowledge.service";
import { KnowledgeSearchService } from "./service/knowledge.search.service";
import { embeddingProvider } from "@/ai/embeddings";

export const knowledgeService = new KnowledgeService(embeddingProvider);
export const chunkRepo = new KnowledgeChunkRepoImpl();
export const knowledgeSearchService = new KnowledgeSearchService(
  embeddingProvider,
);
