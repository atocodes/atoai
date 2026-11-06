import {
  CreateSourceDTO,
  Source,
  SourceFilter,
  SourceStats,
  UpdateSourceDTO,
} from "./source.interface";

export interface ISourceRepo {
  create(dto: CreateSourceDTO): Promise<Source>;
  update(id: string, dto: UpdateSourceDTO): Promise<Source>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<Source | null>;
  findByChannelId(channelId: string): Promise<Source | null>;
  findByUsername(username: string): Promise<Source | null>;
  findByChannelIdOrUsername(
    channelId?: string | null,
    username?: string | null
  ): Promise<Source | null>;
  getActiveSources(): Promise<Source[]>;
  list(filter: SourceFilter): Promise<{ sources: Source[]; total: number }>;
  getStats(): Promise<SourceStats>;
}

export type SourceRepo = ISourceRepo;
