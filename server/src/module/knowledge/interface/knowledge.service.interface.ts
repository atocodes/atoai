import {
  CreateKnowledgeDTO,
  KnowledgeQueryFilter,
  KnowledgeStats,
  UpdateKnowledgeDTO,
} from "./knowledge.interface";
import {
  KnowledgeSearchOptions,
  KnowledgeSearchResult,
} from "./knowledge-search.interface";

export interface IKnowledgeService {
  create(data: CreateKnowledgeDTO): Promise<any>;
  update(id: string, data: UpdateKnowledgeDTO): Promise<any>;
  regenerateChunks(documentId: string): Promise<any>;
  updateChunk(documentId: string, chunkId: string, content: string, reembed?: boolean): Promise<any>;
  deleteChunk(documentId: string, chunkId: string): Promise<boolean>;
  findWithSourceId(sourceId: string): Promise<any>;
  findById(id: string): Promise<any>;
  list(filter: KnowledgeQueryFilter): Promise<{ documents: any[]; total: number; page: number; limit: number }>;
  delete(id: string): Promise<boolean>;
  getStats(): Promise<KnowledgeStats>;
}

export interface IKnowledgeSearchService {
  search(
    query: string,
    options?: KnowledgeSearchOptions
  ): Promise<KnowledgeSearchResult[]>;
}
