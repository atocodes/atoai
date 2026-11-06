import { KnowledgeDocument } from "../../types/knowledge";
import {
  CleanedTelegramMessage,
  TelegramTextEntity,
} from "../../types/telegram.types";

export function normalizeTelegramMessage(
  message: CleanedTelegramMessage,
): KnowledgeDocument {
  return {
    source: "telegram",
    sourceId: String(message.id),
    author: message.author,
    content: message.text,
    publishedAt: new Date(message.date),
    editedAt: message.edited ? new Date(message.edited) : undefined,
    contentType: "other",
    metadata: {
      hashtags: extractHashtags(message.entities),
      mentions: extractMentions(message.entities),
      links: extractLinks(message.entities),
      reactions: message.reactions ?? [],
      hasMedia: Boolean(message.media),
      mediaType: message.media?.type,
      forwarded: Boolean(message.forwardedFrom),
      originalAuthor: message.author,
      replied: Boolean(message.reply_to_message_id),
    },
  };
}

export function extractHashtags(entities: TelegramTextEntity[] = []): string[] {
  return entities
    .filter((entity) => entity.type === "hashtag")
    .map((entity) => entity.text)
    .filter(Boolean);
}

export function extractMentions(entities: TelegramTextEntity[] = []): string[] {
  return entities
    .filter((entity) => entity.type === "mention")
    .map((entity) => entity.text)
    .filter(Boolean);
}

export function extractLinks(
  entities: TelegramTextEntity[] = [],
): { label: string; url: string }[] {
  return entities
    .filter((entity) => entity.type === "link" && Boolean(entity.text))
    .map((entity) => ({
      label: entity.text,
      url: entity.text,
    }));
}
