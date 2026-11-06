import { KnowledgeSearchRepo } from "@/db/knowledge/interface/knowledge-search.repo";
import { EmbeddingProvider } from "../embedding";
import { embeddingProvider as defaultEmbeddingProvider } from "../embeddings";
import { ChatProvider } from "../chat/chat";
import { chatProvider } from "../chat";

export class RetrievalService {
  private readonly embeddingProvider: EmbeddingProvider;
  // private readonly chatProvider: ChatProvider;

  constructor(
    // chatProvider: ChatProvider,
    private readonly searchRepo: KnowledgeSearchRepo,
    embeddingProvider?: EmbeddingProvider,
  ) {
    this.embeddingProvider = embeddingProvider ?? defaultEmbeddingProvider;
    // this.chatProvider = chatProvider;
  }

  async retrieve(question: string) {
    const query = await chatProvider.analyzeQuery(question);

    const embedding = await this.embeddingProvider.embed(query.semanticQuery);

    if (!embedding) {
      throw new Error(
        `Failed to generate embedding for query: "${query.semanticQuery}"`,
      );
    }

    if (!query) throw new Error();
    const results = await this.searchRepo.search(embedding, {
      ...query.filters,
      // limit: 8,
    });


    return {
      query,
      results,
    };
  }
}
