import {
  CreateKnowledgeDTO,
  KnowledgeDocument,
  KnowledgeQueryFilter,
  KnowledgeStats,
  UpdateKnowledgeDTO,
} from "./knowledge.interface";
import {
  KnowledgeSearchOptions,
  KnowledgeSearchResult,
} from "./knowledge-search.interface";

export interface IKnowledgeRepo {
  create(data: CreateKnowledgeDTO): Promise<any>;
  update(id: string, data: UpdateKnowledgeDTO): Promise<any>;
  findWithSourceId(sourceId: string, author?: string): Promise<any>;
  findById(id: string): Promise<any>;
  findMany(
    filter: KnowledgeQueryFilter,
  ): Promise<{ documents: any[]; total: number }>;
  deleteById(id: string): Promise<boolean>;
  getStats(): Promise<KnowledgeStats>;
}

export interface IKnowledgeChunkRepo {
  create(
    documentId: string,
    content: string,
    chunkIndex: number,
    embedding: number[],
  ): Promise<void>;
  createMany(
    documentId: string,
    chunks: { content: string; chunkIndex: number; embedding: number[] }[],
  ): Promise<void>;
  findByDocumentId(documentId: string): Promise<any[]>;
  findById(chunkId: string): Promise<any>;
  update(chunkId: string, content: string, embedding?: number[]): Promise<any>;
  delete(chunkId: string): Promise<boolean>;
  deleteByDocumentId(documentId: string): Promise<void>;
}

export interface IKnowledgeSearchRepo {
  search(
    embedding: number[],
    options?: KnowledgeSearchOptions,
  ): Promise<KnowledgeSearchResult[]>;
}
