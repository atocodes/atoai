export interface KnowledgeFilters {
  contentType?: string;

  from?: Date;
  to?: Date;

  hastags?: string[];
  mentions?: string[];
}

export interface KnowledgeQuery {
  semanticQuery: string;
  filters: KnowledgeFilters;
}
