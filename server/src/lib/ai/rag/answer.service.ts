import { Sender } from "@/module/chat";
import { ChatProvider } from "../chat/chat";
import { ContextBuilder } from "./context.builder";
import { RetrievalService } from "./retrieval.service";

export class AnswerService {
  constructor(
    private readonly retrieval: RetrievalService,
    private readonly contextBuilder: ContextBuilder,
    private readonly chat: ChatProvider,
  ) {}

  async answer(question: string, sender?: Sender) {
    const { query, results } = await this.retrieval.retrieve(question);

    const context = this.contextBuilder.build(results);
    let answer: any;
    if (sender && sender == "user") {
      answer = await this.chat.generateAnswerForUser({
        question,
        context,
      });
    } else {
      answer = await this.chat.generate({
        question,
        context,
      });
    }

    return {
      answer,
      query,
      results,
    };
  }
}
