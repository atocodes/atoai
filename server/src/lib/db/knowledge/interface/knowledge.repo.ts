import { KnowledgeDocument } from "@/knowledge/types/knowledge";

export interface KnowledgeRepo {
  create(data: KnowledgeDocument): Promise<any>;
  findWithSourceId(sourceId: string): Promise<any>;
}
