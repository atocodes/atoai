import {
  CreateTelegramLogDTO,
  TelegramLogEntry,
  TelegramLogFilter,
  TelegramLogStats,
} from "./telegram-log.interface";

export interface ITelegramLogService {
  log(dto: CreateTelegramLogDTO): Promise<TelegramLogEntry>;
  listLogs(filter: TelegramLogFilter): Promise<{ logs: TelegramLogEntry[]; total: number; page: number; limit: number }>;
  getLogById(id: string): Promise<TelegramLogEntry | null>;
  deleteLog(id: string): Promise<boolean>;
  clearLogs(): Promise<number>;
  getStats(): Promise<TelegramLogStats>;
}
