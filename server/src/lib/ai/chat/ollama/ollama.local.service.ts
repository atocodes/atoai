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
import { GEMINI_SYSTEM_PROMPT } from "@/ai/prompts/gemini.prompts";

export class OllamaLocalService implements ChatProvider {
  private readonly client: Ollama;
  private readonly model = process.env.LOCAL_OLLAMA_MODEL ?? "qwen3:1.7b";
  private readonly host =
    process.env.LOCAL_OLLAMA_HOST ?? "http://localhost:42819";

  constructor() {
    this.client = new Ollama({
      host: this.host,
    });
  }
  async generateAnswerForUser({
    question,
    context,
  }: ChatGenerateInput): Promise<any> {
    const response = await this.client.chat({
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
    });

    return response.message.content;
  }
  async smartChuncker(content: string): Promise<any> {
    try {
      const response = await this.client.chat({
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
      const response = await this.client.chat({
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

      return knowledgeQuerySchema.parse(data);
    } catch (error) {
      throw new Error(`[OLLAMA LOCAL] : ${error}`);
    }
  }

  async classifier(content: string): Promise<any> {
    const response = await this.client.chat({
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

    const raw = (response.message.content || "")
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
  }

  async generate({ question, context }: ChatGenerateInput): Promise<any> {
    const response = await this.client.chat({
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
    });

    return response.message.content;
  }
}
