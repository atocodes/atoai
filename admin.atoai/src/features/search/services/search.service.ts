import { authService } from "@/features/auth/services/auth.service";
import { SearchOptions, SearchResultItem } from "../types/search.types";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const searchService = {
  async searchVector(
    query: string,
    options: SearchOptions = {}
  ): Promise<{ count: number; results: SearchResultItem[] }> {
    const res = await fetch(`${SERVER_URL}/api/knowledge/search`, {
      method: "POST",
      credentials: "include",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ query, ...options }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Semantic search failed");
    return data;
  },
};
