import { chatProvider } from "@/ai/chat";
import { embeddingProvider } from "@/ai/embeddings";
import { AnswerService } from "@/ai/rag/answer.service";
import { ContextBuilder } from "@/ai/rag/context.builder";
import { RetrievalService } from "@/ai/rag/retrieval.service";
import { KnowledgeSearchRepoImpl } from "@/db/knowledge/repo/knowledge.search.repo.impl";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { CHUNKER_PROMPT } from "@/ai/prompts/ollama.prompts";
const questions = [
  // "What projects did you work on in 2023?",
  // "What do you know about Time Shut?",
  // "What technologies have I worked with?",
  // "What is Bang Bang Duo?",
  // "Who is atocodes?",
  // "what is it like to be with atocodes in his openion?",
  // "when do you sell your desktop ?",
  // "what os's do you install so far ?",
  // "what is project Xpense ?",
  // "tell me some personal thing about you ?",
  // "whos name i mention alot in my posts ?",
  // "tell me everything i have to know about you when i mean everything i mean every single thing.",
  // "tell me every projects you've buid or planning to build, and every crazy ideas you had planned to build.",
  // "who is Ato Codes, and who is haset?",
  // "tell me every project you have built.",
  // "tell me every personal thing about you?"
  "tell me about equib manager",
];

async function main() {
  const rl = readline.createInterface({
    input,
    output,
  });
  try {
    const retrivalService = new RetrievalService(
      new KnowledgeSearchRepoImpl(),
      embeddingProvider,
    );
    const contextBuilder = new ContextBuilder();
    const service = new AnswerService(
      retrivalService,
      contextBuilder,
      chatProvider,
    );

    // for (const q of questions) {
    //   const answer = await service.answer(q);
    //   // const answer = await chatProvider.generate({ question: q, context: "" });

    //   console.log(answer);
    // }

    while (true) {
      const question = await rl.question("\nato ai > ");

      if (!question.trim()) continue;

      if (question.toLowerCase() === "exit") {
        break;
      }

      const answer = await service.answer(question);

      console.log(answer.answer);
    }
  } catch (error) {
    console.log(error);
  } finally {
    rl.close();
  }
}

main();
