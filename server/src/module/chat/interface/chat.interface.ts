export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export type Sender = "admin" | "user";

export interface RAGQueryDTO {
  question: string;
  history?: ChatMessage[];
  filters?: {
    contentType?: string;
    from?: string;
    to?: string;
    hashtags?: string[];
  };
}

export interface RAGAnswerResult {
  answer: string;
  sources: {
    sourceId: string;
    author: string;
    contentType: string;
    distance: number;
    chunkContent: string;
  }[];
}

export interface IChatService {
  ask(dto: RAGQueryDTO): Promise<RAGAnswerResult>;
}
