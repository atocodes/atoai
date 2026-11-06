import { knowledgeService } from "@/module/knowledge";
import { cleanTelegramMessage } from "./cleaner/telegram.cleaner";
import { normalizeTelegramMessage } from "./normalizer/telegram.normalizer";
import {
  parseTelegramChannelMessage,
  parseTelegramMessage,
} from "./parser/telegram.parser";
import { chatProvider } from "@/lib/ai/chat";
import { MessageType } from "../types/telegram.types";
import { KnowledgeDocument } from "../types/knowledge";

interface createTelegramKnowledgeOptions {
  content: any;
  type: MessageType;
}

export async function createTelegramKnowledge(
  options: createTelegramKnowledgeOptions,
): Promise<KnowledgeDocument | null> {
  try {
    let parsed: any;
    let forceFeed: boolean = false;
    switch (options.type) {
      case MessageType.CHANNEL_MESSAGE:
        parsed = parseTelegramChannelMessage(options.content);
        forceFeed = true;
        break;
      case MessageType.IMPORT_MESSAG:
        parsed = parseTelegramMessage(options.content);
        break;
      default:
        break;
    }
    if (!parsed) {
      throw new Error(
        `[Parser Error] : Could not parse content : ${options.content}`,
      );
    }

    if (parsed.forwardedFrom) {
      return null;
    }

    const cleaned = cleanTelegramMessage(parsed);
    const document = normalizeTelegramMessage(cleaned);

    // const exists = await knowledgeService.findWithSourceId(
    //   document.sourceId,
    //   document.author,
    // );

    // if (exists && !forcePass) {
    //   throw new Error(
    //     `[Parser Error] : Document: ${document} \n\nAlready Exists`,
    //   );
    // }

    const classification = await chatProvider.classifier(document.content);
    document.contentType = classification.category;

    document.forceFeed = forceFeed;

    return document;
  } catch (error: any) {
    throw new Error(
      error.message ||
        `[Parser Error]: Unknown error creating telegram knowledge`,
    );
  }
}
