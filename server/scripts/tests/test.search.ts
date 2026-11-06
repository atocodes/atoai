import { ContextBuilder } from "@/ai/rag/context.builder";
import { knowledgeSearchService } from "@/db/knowledge";

async function main() {
  const builder = new ContextBuilder();
  const query = "What software have I created?";

  const results = await knowledgeSearchService.search(query, 5);
  const context = builder.build(results);

  console.log(context);
  //   console.log("\nSearch:", query);

  //   for (const result of results) {
  //     console.log("\n------------------------------");

  //     console.log("Distance:", result.distance);

  //     console.log("Chunk:", result.chunkIndex);

  //     console.log(result.content);
  //   }
}

main()
  .catch(console.error)
  .finally(() => process.exit());
