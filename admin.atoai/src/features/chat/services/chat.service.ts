import { authService } from "@/features/auth/services/auth.service";
import { ChatResponse } from "../types/chat.types";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const chatService = {
  async askRAG(question: string): Promise<ChatResponse> {
    const res = await fetch(`${SERVER_URL}/api/chat`, {
      method: "POST",
      credentials: "include",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "RAG inference failed");
    return data;
  },
};
