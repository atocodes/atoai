import "dotenv/config";
import { embeddingProvider, OllamaEmbeddingProvider } from "@/ai/embeddings";
import { OllamaLocalService } from "@/ai/chat/ollama/ollama.local.service";
const embedding = await embeddingProvider.embed(
  "Ato Codes is a software engineer and graphic designer.",
);

console.log("Dimensions:", embedding);
console.log("First 5:", embedding);
