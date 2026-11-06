import {
  CreateTelegramLogDTO,
  TelegramLogEntry,
  TelegramLogFilter,
  TelegramLogStats,
} from "./telegram-log.interface";

export interface ITelegramLogRepo {
  create(dto: CreateTelegramLogDTO): Promise<TelegramLogEntry>;
  list(filter: TelegramLogFilter): Promise<{ logs: TelegramLogEntry[]; total: number }>;
  findById(id: string): Promise<TelegramLogEntry | null>;
  delete(id: string): Promise<boolean>;
  deleteAll(): Promise<number>;
  getStats(): Promise<TelegramLogStats>;
}
