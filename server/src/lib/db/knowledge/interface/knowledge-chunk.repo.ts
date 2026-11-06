export interface KnowledgeChunkRepo {
  create(
    documentId: string,
    content: string,
    chunkIndex: number,
    embedding: number[],
  ): Promise<void>;

  createMany(
    documentId: string,
    chunks: {
      content: string;
      chunkIndex: number;
      embedding: number[];
    }[],
  ): Promise<void>;
}
