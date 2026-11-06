export enum MessageType {
  CHANNEL_MESSAGE,
  IMPORT_MESSAG
}

export interface ParsedTelegramMessage {
  id: number;
  date: string;
  edited?: string;
  author: string;
  text: string;
  entities: TelegramTextEntity[];
  reactions: TelegramReaction[];
  media?: TelegramMedia;
  forwardedFrom?: TelegramForwardedFrom;
  reply_to_message_id?: string;
}

export interface CleanedTelegramMessage {
  id: number;
  date: string;
  edited?: string;
  author: string;
  text: string;
  entities: TelegramTextEntity[];
  reactions: TelegramReaction[];
  media?: TelegramMedia;
  forwardedFrom?: TelegramForwardedFrom;
  reply_to_message_id?: string;
}

export interface TelegramTextEntity {
  type: string;
  text: string;
  href?: string;
  collapsed?: boolean;
}

export interface TelegramReaction {
  type: string;
  emoji: string;
  count: number;
}

export interface TelegramMedia {
  type: "photo" | "video" | "file" | "audio";
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
}

export interface TelegramForwardedFrom {
  name: string;
  id?: string;
}
