import { Ollama } from "ollama";
import { ChatGenerateInput, ChatProvider } from "../chat";
import {
  INITIAL_GREETING_PROMPT,
  QUERY_ANALYZER_PROMPT,
  SMART_CHUNCK_SYSTEM_PROMPT,
  TELEGRAM_CLASSIFIER_SYSTEM_PROMPT,
} from "@/ai/prompts/ollama.prompts";
import {
  knowledgeQuery,
  knowledgeQuerySchema,
} from "@/ai/validator/output.validator";
import { normalizeFilters } from "@/ai/utils/normalize.filters";
import { GEMINI_SYSTEM_PROMPT, GEMINI_USER_SYSTEM_PROMPT } from "@/ai/prompts/gemini.prompts";

export const ollama = new Ollama({
  host: "https://ollama.com",
  headers: {
    Authorization: "Bearer " + process.env.OLLAMA_API_KEY,
  },
});

export class OllamaService implements ChatProvider {
  async smartChuncker(content: string): Promise<any> {
    try {
      const response = await ollama.chat({
        model: this.model,
        messages: [
          {
            role: "system",
            content: SMART_CHUNCK_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content,
          },
        ],
        stream: false,
      });

      const data = JSON.parse(response.message.content);

      return data;
    } catch (error) {
      throw new Error(`[SMART CHUNK OLLAMA ERROR] : ${error}`);
    }
  }

  async analyzeQuery(content: string): Promise<any> {
    try {
      const response = await ollama.chat({
        model: this.model,
        messages: [
          {
            role: "system",
            content: QUERY_ANALYZER_PROMPT,
          },
          {
            role: "user",
            content,
          },
        ],
        stream: false,
      });

      const data = JSON.parse(response.message.content);
      const parsed = knowledgeQuerySchema.parse(data);

      return knowledgeQuerySchema.parse(data);
    } catch (error) {
      throw new Error(`[Ollama Analyze Error]: ${error}`);
    }
  }
  private readonly model = process.env.CLOUD_OLLAMA_MODEL ?? "gpt-oss:120b";

  async classifier(content: string): Promise<any> {
    try {
      const response = await ollama.chat({
        model: this.model,
        messages: [
          {
            role: "system",
            content: TELEGRAM_CLASSIFIER_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content,
          },
        ],
        stream: false,
      });

      const raw = response.message.content
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      const res = JSON.parse(raw);
      const cleanCategory =
        String(res?.category || "general")
          .toLowerCase()
          .trim()
          .split(/[\s_-]+/)[0]
          .replace(/[^a-z0-9]/g, "") || "general";

      return {
        category: cleanCategory,
        confidence: typeof res?.confidence === "number" ? res.confidence : 1.0,
        reason: res?.reason || "Classified dynamically",
      };
    } catch (error) {
      throw new Error(`[Ollama Classifier Error] : ${error}`);
    }
  }

  async generate({ question, context }: ChatGenerateInput) {
    try {
      const response = await ollama.chat({
        model: this.model,
        messages: [
          {
            role: "system",
            content: GEMINI_SYSTEM_PROMPT,
          },
          {
            role: "system",
            content: context,
          },
          {
            role: "user",
            content: question,
          },
        ],
        stream: false,
      });

      return response.message.content;
    } catch (error) {
      throw new Error(`[Ollama Response Error]: ${error}`);
    }
  }

  async generateAnswerForUser({ question, context }: ChatGenerateInput): Promise<any> {
    try {
      const response = await ollama.chat({
        model: this.model,
        messages: [
          {
            role: "system",
            content: GEMINI_USER_SYSTEM_PROMPT,
          },
          {
            role: "system",
            content: context,
          },
          {
            role: "user",
            content: question,
          },
        ],
        stream: false,
      });
      return response.message.content;
    } catch (error) {
      throw new Error(`[Ollama Response Error]: ${error}`);
    }
  }
}
