import "@/lib/dns";
import { GoogleGenAI } from "@google/genai";
import {
  GEMINI_SYSTEM_PROMPT,
  GEMINI_USER_SYSTEM_PROMPT,
} from "../../prompts/gemini.prompts";
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

export class GeminiService implements ChatProvider {
  private readonly client: GoogleGenAI;

  private readonly model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  constructor() {
    const apikey = process.env.GEMINI_API_KEY;
    if (!apikey) throw new Error("GEMINI_API_KEY is not configured");

    this.client = new GoogleGenAI({
      apiKey: apikey,
    });
  }

  async smartChuncker(content: string): Promise<any> {
    const response = await this.client.models.generateContent({
      model: this.model,
      config: {
        systemInstruction: SMART_CHUNCK_SYSTEM_PROMPT,
      },
      contents: content,
    });

    if (!response.text)
      throw new Error("[GEMINI SMART CHUNCKER ERROR] No Response");

    const data = JSON.parse(response.text);

    return data;
  }

  async analyzeQuery(content: string): Promise<any> {
    const response = await this.client.models.generateContent({
      model: this.model,
      config: {
        systemInstruction: QUERY_ANALYZER_PROMPT,
      },
      contents: content,
    });

    if (!response.text) throw new Error(" [Gemini Query Analyzer] No Response");
    const data = JSON.parse(response.text);

    return knowledgeQuerySchema.parse(data);
  }

  async classifier(content: string): Promise<any> {
    const response = await this.client.models.generateContent({
      model: this.model,
      config: {
        systemInstruction: TELEGRAM_CLASSIFIER_SYSTEM_PROMPT,
      },
      contents: content,
    });

    const raw = (response.text || "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    try {
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
    } catch {
      const firstWord =
        raw
          .toLowerCase()
          .trim()
          .split(/[\s_-]+/)[0]
          .replace(/[^a-z0-9]/g, "") || "general";
      return {
        category: firstWord,
        confidence: 0.8,
        reason: "Parsed fallback category",
      };
    }
  }
  async generate({ question, context }: ChatGenerateInput) {
    const response = await this.client.models.generateContent({
      model: this.model,
      config: {
        systemInstruction: GEMINI_SYSTEM_PROMPT,
      },
      contents: `
User question:

${question}

Knowledge context:

${context}
        `,
    });

    return response.text ?? "";
  }

  async generateAnswerForUser({ question, context }: ChatGenerateInput): Promise<any> {
    const response = await this.client.models.generateContent({
      model: this.model,
      config: {
        systemInstruction: GEMINI_USER_SYSTEM_PROMPT,
      },
      contents: `
User question:

${question}

Knowledge context:

${context}
        `,
    });

    return response.text ?? "";
  }
}
