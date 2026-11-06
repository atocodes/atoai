import { knowledgeQuery } from "../validator/output.validator";

export function normalizeFilters(filters: knowledgeQuery["filters"]) {
  return {
    contentType: filters.contentType ?? undefined,
    from: filters.from ? new Date(filters.from) : undefined,
    to: filters.to ? new Date(filters.to) : undefined,
    hastags: filters.hashtags.length ? filters.hashtags : undefined,
    mentions: filters.mentions.length ? filters.mentions : undefined,
  };
}
