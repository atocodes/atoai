export interface SearchResultItem {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  distance: number;
  sourceId: string;
  author: string;
  contentType: string;
  publishedAt: string;
}

export interface SearchOptions {
  limit?: number;
  contentType?: string;
  from?: string;
  to?: string;
  hashtags?: string[];
  mentions?: string[];
}
