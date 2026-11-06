export interface KnowledgeSearchOptions {
  limit?: number;
  contentType?: string;
  from?: Date;
  to?: Date;
  hashtags?: string[];
  mentions?: string[];
}

export interface KnowledgeSearchResult {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  distance: number;

  // document: {
  sourceId: string;
  author: string;
  contentType: string;
  publishedAt: Date;
  // };
}

export interface KnowledgeSearchRepo {
  search(
    embedding: number[],
    options?: KnowledgeSearchOptions,
  ): Promise<KnowledgeSearchResult[]>;
}
