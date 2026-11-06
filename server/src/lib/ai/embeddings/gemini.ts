import "@/lib/dns";
import { GoogleGenAI } from "@google/genai";
import { EmbeddingProvider } from "../embedding";

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  private readonly client: GoogleGenAI;
  private readonly model =
    process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-2";
  public readonly dimensions: number;

  constructor(dimensions?: number) {
    const apikey = process.env.GEMINI_API_KEY;
    if (!apikey) throw new Error("GEMINI_API_KEY is not configured");

    this.dimensions =
      dimensions ??
      parseInt(
        process.env.EMBEDDING_DIMENSIONS ??
          process.env.EMBEDDING_DIMENSION ??
          "768",
        10,
      );

    this.client = new GoogleGenAI({
      apiKey: apikey,
    });
  }

  async embed(text: string): Promise<number[] | null> {
    try {
      const response = await this.client.models.embedContent({
        model: this.model,
        contents: text,
        config: {
          outputDimensionality: this.dimensions,
        },
      });

      const vector = response.embeddings?.[0]?.values;
      return vector ?? null;
    } catch (error) {
      console.error("[GeminiEmbeddingProvider Error]:", error);
      return null;
    }
  }
}

// Alias for backwards compatibility
export const GeminitEmbeddingProvider = GeminiEmbeddingProvider;