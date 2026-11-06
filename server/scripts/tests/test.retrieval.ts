import { chatProvider } from "@/ai/chat";
import { embeddingProvider } from "@/ai/embeddings";
import { ContextBuilder } from "@/ai/rag/context.builder";
import { RetrievalService } from "@/ai/rag/retrieval.service";
import { KnowledgeSearchRepoImpl } from "@/db/knowledge/repo/knowledge.search.repo.impl";

async function main() {
  const analyzer = chatProvider;

  const repo = new KnowledgeSearchRepoImpl();

  const retrieval = new RetrievalService(repo,embeddingProvider);

  const contextBuilder = new ContextBuilder();

  const question = "what projects did i work on 2024";

  const res = await retrieval.retrieve(question);

  // console.log("\nRESULTS:");

  // for (const result of results) {
  //   console.log({
  //     content: result.content,
  //     distance: result.distance,
  //     type: result.contentType,
  //     date: result.publishedAt,
  //   });
  // }

  console.log("\nCONTEXT:");

  // console.log(contextBuilder.build(results));
}

main();
