import {
  ParsedTelegramMessage,
  TelegramForwardedFrom,
} from "../../types/telegram.types";

export function parseTelegramChannelMessage(
  raw: any,
): ParsedTelegramMessage | null {
  if (!raw) return null;

  return {
    author: raw.sender_chat.title,
    date: raw.date,
    id: raw.message_id,
    text:
      raw.text == "" || raw.text == undefined
        ? (raw.caption as string).replaceAll("@", "")
        : (raw.text as string).replaceAll("@", ""),
    entities: raw.text_entities ?? [],
    reactions: raw.reactions ?? [],
    forwardedFrom:
      raw.forward_origin != null
        ? ({
            name: raw!.forward_origin!.chat.title as string,
            id: raw!.forward_origin!.chat.id as unknown as string,
          } as TelegramForwardedFrom)
        : undefined,
    reply_to_message_id: raw?.reply_to_message?.message_id ?? null,
  };
}

export function parseTelegramMessage(raw: any): ParsedTelegramMessage | null {
  if (raw.type != "message") {
    return null;
  }

  return {
    id: raw.id,
    date: raw.date,
    edited: raw.edited,
    author: raw.from ?? raw.author,
    entities: raw.text_entities ?? [],
    reactions: raw.reactions ?? [],
    text:
      parseTelegramText(
        raw.text == "" || raw.text == undefined ? raw.caption : raw.text,
      ) ?? "",
    // media: extractMedia(raw),
    forwardedFrom: raw.forwarded_from ?? null,
    reply_to_message_id: raw.reply_to_message_id ?? null,
  };
}

function parseTelegramText(data: any[]): string | null {
  try {
    if (!data) return null;
    if (typeof data == "string") {
      return data;
    }

    const strings = data.filter((d) => typeof d == "string");

    return strings.join("\n").replaceAll("@", "");
  } catch (error) {
    throw error;
  }
}
