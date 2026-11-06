"use client";

import { useState } from "react";
import { SearchOptions, SearchResultItem } from "../types/search.types";
import { searchService } from "../services/search.service";

export function useVectorSearch() {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [contentType, setContentType] = useState("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (customQuery?: string, customOptions?: SearchOptions) => {
    const q = (customQuery ?? query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await searchService.searchVector(q, {
        limit: customOptions?.limit ?? limit,
        contentType: (customOptions?.contentType ?? contentType) === "all" ? undefined : (customOptions?.contentType ?? contentType),
      });
      setResults(data.results || []);
      return data.results;
    } catch (err: any) {
      setError(err.message || "Failed to execute semantic search");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    setError(null);
  };

  return {
    query,
    setQuery,
    limit,
    setLimit,
    contentType,
    setContentType,
    results,
    loading,
    searched,
    error,
    search,
    clear,
  };
}
