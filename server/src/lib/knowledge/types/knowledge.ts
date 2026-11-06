import { TelegramReaction } from "./telegram.types";

export interface KnowledgeDocument {
  source: "telegram" | "md" | "blog";
  sourceId: string;
  author: string;
  content: string;
  publishedAt: Date;
  editedAt?: Date;
  contentType: string;
  metadata?: KnowledgeMetadata;
  forceFeed?: boolean;
}

// export type ContentType =
//   | "project"
//   | "project_update"
//   | "technical"
//   | "personal"
//   | "announcement"
//   | "design"
//   | "achievement"
//   | "promotion"
//   | "forwarded"
//   | "career"
//   | "educational"
//   | "promotion"
//   | "event"
//   | "opinion"
//   | "social"
//   | "other";

export interface KnowledgeMetadata {
  hashtags: string[];
  mentions: string[];

  links: {
    label: string;
    url: string;
  }[];

  reactions: TelegramReaction[];

  hasMedia: boolean;

  mediaType?: "photo" | "video" | "file" | "audio";

  forwarded: boolean;
  replied: boolean;

  originalAuthor?: string;
}
