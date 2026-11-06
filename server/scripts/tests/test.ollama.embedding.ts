import { OllamaEmbeddingProvider } from "@/ai/embeddings/ollama";
import "dotenv/config";

async function main() {
  const text =
    "Ato Codes is a software engineer and graphic designer building real-world products";

  console.log("Generating local Ollama embedding ...");
  const embeddingService = new OllamaEmbeddingProvider();
  const embedding = await embeddingService.embed(text);

  console.log("Model:", process.env.OLLAMA_EMBEDDING_MODEL);
  console.log("Dimensions:", embedding.length);
  console.log("First 5:", embedding.slice(0, 5));
}

main().catch(console.error);
