import {
  CreateSourceDTO,
  Source,
  SourceFilter,
  SourceStats,
  UpdateSourceDTO,
} from "./source.interface";

export interface ISourceService {
  create(dto: CreateSourceDTO): Promise<Source>;
  update(id: string, dto: UpdateSourceDTO): Promise<Source>;
  delete(id: string): Promise<boolean>;
  toggleStatus(id: string): Promise<Source>;
  findById(id: string): Promise<Source | null>;
  findByChannelIdOrUsername(
    channelId?: string | null,
    username?: string | null
  ): Promise<Source | null>;
  isChannelAllowed(
    channelId?: string | null,
    username?: string | null
  ): Promise<{ allowed: boolean; source?: Source; reason?: string }>;
  getActiveSources(): Promise<Source[]>;
  listSources(filter: SourceFilter): Promise<{
    sources: Source[];
    total: number;
    page: number;
    limit: number;
  }>;
  getStats(): Promise<SourceStats>;
}
