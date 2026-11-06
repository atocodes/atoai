import { KnowledgeSearchResult } from "@/db/knowledge/interface/knowledge-search.repo";

export class ContextBuilder {
  build(results: KnowledgeSearchResult[]): string {
    if (!results.length) {
      return "No relevant knowledge was found";
    }

    return results
      .map((result, idx) => {
        return `
[Knowledge ${idx + 1}]

Source Id: ${result.sourceId}
Date: ${result.publishedAt}
Type: ${result.contentType}
Author: ${result.author}

Content:
${result.content}
        `;
      })
      .join("\n---\n");
  }
}
