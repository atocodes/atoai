export interface ChatCitation {
  sourceId: string;
  author: string;
  contentType: string;
  distance: number;
  chunkContent: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  sources?: ChatCitation[];
  timestamp: string;
}

export interface ChatResponse {
  success: boolean;
  answer: string;
  sources: ChatCitation[];
}
