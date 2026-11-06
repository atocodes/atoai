import { ragService } from "@/ai/rag";
import {
  IChatService,
  RAGAnswerResult,
  RAGQueryDTO,
  Sender,
} from "../interface/chat.interface";

export class ChatService implements IChatService {
  async ask(
    dto: RAGQueryDTO,
    sender: Sender = "admin",
  ): Promise<RAGAnswerResult> {
    try {
      const response = await ragService.answer(dto.question, sender);

      const sources = (response.results || []).map((res) => ({
        sourceId: res.sourceId,
        author: res.author,
        contentType: res.contentType,
        distance: res.distance,
        chunkContent: res.content,
      }));

      return {
        answer: response.answer || "No response generated.",
        sources,
      };
    } catch (err: any) {
      console.error("[ChatService.ask] error:", err);
      throw new Error(`[ChatService.ask] ${err.message || err}`);
    }
  }
}

export const chatService = new ChatService();
