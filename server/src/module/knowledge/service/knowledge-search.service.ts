import { EmbeddingProvider } from "@/ai/embedding";
import { embeddingProvider as defaultEmbeddingProvider } from "@/ai/embeddings";
import {
  KnowledgeSearchOptions,
  KnowledgeSearchResult,
} from "../interface/knowledge-search.interface";
import { IKnowledgeSearchRepo } from "../interface/knowledge.repo.interface";
import { IKnowledgeSearchService } from "../interface/knowledge.service.interface";
import { KnowledgeSearchRepoImpl } from "../repo/knowledge-search.repo.impl";

export class KnowledgeSearchService implements IKnowledgeSearchService {
  private knowledgeSearchRepo: IKnowledgeSearchRepo;
  private embeddingProvider: EmbeddingProvider;

  constructor(
    embeddingProvider?: EmbeddingProvider,
    knowledgeSearchRepo?: IKnowledgeSearchRepo
  ) {
    this.embeddingProvider = embeddingProvider ?? defaultEmbeddingProvider;
    this.knowledgeSearchRepo = knowledgeSearchRepo ?? new KnowledgeSearchRepoImpl();
  }

  async search(
    query: string,
    options?: KnowledgeSearchOptions
  ): Promise<KnowledgeSearchResult[]> {
    const embedding = await this.embeddingProvider.embed(query);
    if (!embedding || embedding.length === 0) {
      return [];
    }

    return this.knowledgeSearchRepo.search(embedding, options);
  }
}

export const knowledgeSearchService = new KnowledgeSearchService();
