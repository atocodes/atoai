import { chatProvider } from "@/ai/chat";
import { KnowledgeSearchRepoImpl } from "../repo/knowledge.search.repo.impl";
import { EmbeddingProvider } from "@/ai/embedding";
import { embeddingProvider as defaultEmbeddingProvider } from "@/ai/embeddings";

export class KnowledgeSearchService {
  private repo = new KnowledgeSearchRepoImpl();
  private embeddingProvider: EmbeddingProvider;
  private chat = chatProvider;

  constructor(embeddingProvider?: EmbeddingProvider) {
    this.embeddingProvider = embeddingProvider ?? defaultEmbeddingProvider;
  }

  async search(query: string, limit = 5) {
    const searchQuery = await this.chat.analyzeQuery(query);
    const embedding = await this.embeddingProvider.embed(
      searchQuery.semanticQuery,
    );

    if (!embedding) throw new Error("No embedding generated");

    return this.repo.search(embedding, searchQuery.filters);
  }
}
