import { Ollama } from "ollama";
import { EmbeddingProvider } from "../embedding";

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  public readonly dimensions: number;

  public readonly ollama: Ollama;
  private readonly EMBEDDING_MODEL =
    process.env.OLLAMA_EMBEDDING_MODEL ?? "embeddinggemma";

  constructor(dimensions?: number) {
    this.dimensions =
      dimensions ??
      parseInt(
        process.env.EMBEDDING_DIMENSIONS ??
          process.env.EMBEDDING_DIMENSION ??
          "768",
        10,
      );

    this.ollama = new Ollama({
      host: process.env.LOCAL_OLLAMA_HOST ?? "http://localhost:11434",
    });
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.ollama.embed({
        model: this.EMBEDDING_MODEL,
        input: text,
      });

      const embedding = response.embeddings[0];

      if (embedding.length !== this.dimensions) {
        throw new Error(
          `Expected ${this.dimensions} dimensions, got ${embedding.length}`,
        );
      }

      return response.embeddings[0];
    } catch (error) {
      throw new Error(`[Ollama Embedding Error]: ${error}`);
    }
  }
}
