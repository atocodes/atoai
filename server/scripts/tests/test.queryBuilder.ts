import { OllamaEmbeddingProvider } from "@/ai/embeddings/ollama";

async function main() {
  const ollamaEmbedingService = new OllamaEmbeddingProvider();
  const res = await ollamaEmbedingService.embed("What did i build on 2026?");

  console.log(res);
}

main().catch(console.error);
