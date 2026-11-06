import {
  CleanedTelegramMessage,
  ParsedTelegramMessage,
} from "../../types/telegram.types";

export function cleanText(text: string): string {
  return text
    .replace(/\(File not included\.[^)]+\)/g, "")
    .replace(/\n{3,}/g, "\n\n");
}

export function cleanTelegramMessage(
  parsed: ParsedTelegramMessage,
): CleanedTelegramMessage {
  return {
    ...parsed,
    text: cleanText(parsed.text ?? ""),
  };
}
