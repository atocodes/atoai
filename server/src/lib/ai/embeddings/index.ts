import { EmbeddingProvider } from "../embedding";
import { OllamaEmbeddingProvider } from "./ollama";
import { GeminiEmbeddingProvider, GeminitEmbeddingProvider } from "./gemini";
import { JinaEmbeddingProvider } from "./jina";

export type SupportedEmbeddingProvider = "ollama" | "gemini" | "jina";

export const DEFAULT_EMBEDDING_DIMENSIONS = parseInt(
  process.env.EMBEDDING_DIMENSIONS ?? process.env.EMBEDDING_DIMENSION ?? "768",
  10,
);

/**
 * Creates an instance of an EmbeddingProvider based on the given provider name
 * or defaults to the `EMBEDDING_PROVIDER` environment variable, configured with the specified
 * or environment-defined dimensions.
 */
export function createEmbeddingProvider(
  provider: string = process.env.EMBEDDING_PROVIDER ?? "local",
  dimensions: number = DEFAULT_EMBEDDING_DIMENSIONS,
): EmbeddingProvider {
  const normalized = provider.toLowerCase().trim();

  switch (normalized) {
    case "gemini":
      return new GeminiEmbeddingProvider(dimensions);
    case "jina":
      return new JinaEmbeddingProvider(dimensions);
    case "local":
      return new OllamaEmbeddingProvider(dimensions);
    default:
      return new OllamaEmbeddingProvider(dimensions);
  }
}

/**
 * Global embedding provider instance switched dynamically via EMBEDDING_PROVIDER
 * and EMBEDDING_DIMENSIONS environment variables.
 */
export const embeddingProvider: EmbeddingProvider = createEmbeddingProvider();

export {
  OllamaEmbeddingProvider,
  GeminiEmbeddingProvider,
  GeminitEmbeddingProvider,
  JinaEmbeddingProvider,
};
export type { EmbeddingProvider };
