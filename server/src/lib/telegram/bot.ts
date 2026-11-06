import { env } from "@/config/env";
import { Telegraf } from "telegraf";
import { createTelegramKnowledge } from "../knowledge/telegram";
import { MessageType } from "../knowledge/types/telegram.types";
import { knowledgeService } from "@/module/knowledge";
import { telegramLogService } from "@/module/telegram-log";
import { sourceService } from "@/module/sources";
import { KnowledgeDocument } from "../knowledge/types/knowledge";

const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

bot.command("start", async (ctx) => {
  await ctx.reply("ATOAI Telegram Knowledge Ingestion Bot is active.");
});

async function processTelegramUpdate(rawPost: any, sourceName: string) {
  const messageId = String(rawPost.message_id ?? Date.now());
  const chatId = rawPost.chat?.id ? String(rawPost.chat.id) : null;
  const chatTitle = rawPost.chat?.title || rawPost.chat?.username || null;
  const chatUsername = rawPost.chat?.username ? String(rawPost.chat.username) : null;
  const author =
    rawPost.author_signature ||
    rawPost.from?.username ||
    rawPost.from?.first_name ||
    chatTitle ||
    "Unknown";
  const rawSnippet = (rawPost.text || rawPost.caption || "").trim();

  // 1. Guard empty messages
  if (!rawSnippet || rawSnippet == "") {
    await telegramLogService.log({
      messageId,
      chatId,
      chatTitle,
      author,
      status: "skipped",
      rawSnippet: "(Empty message or media without caption)",
      reason: "Message contained no text or extractable caption.",
      source: sourceName,
    });
    return;
  }

  // // 2. Guard forwarded messages if configured
  if (rawPost.forward_from || rawPost.forward_from_chat) {
    const channelId = rawPost.forward_from || rawPost.forward_from_chat || null;

    if (!channelId) {
      return;
    }
    const { id } = channelId
    const channel = await sourceService.findById(`${id}`)
    if (!channel) {
      await telegramLogService.log({
        messageId,
        chatId,
        chatTitle,
        author,
        status: "skipped",
        rawSnippet,
        reason: "Forwarded message was ignored according to pipeline rules.",
        source: sourceName,
      });
      return;
    }

  }

  // 3. Guard channel source active status
  if (chatId || chatUsername) {
    const channelCheck = await sourceService.isChannelAllowed(
      chatId,
      chatUsername,
      chatTitle
    );
    if (!channelCheck.allowed) {
      await telegramLogService.log({
        messageId,
        chatId,
        chatTitle,
        author,
        status: "skipped",
        rawSnippet,
        reason:
          channelCheck.reason ||
          "Channel source is paused/inactive in source configuration.",
        source: sourceName,
        metadata: {
          channelId: chatId,
          username: chatUsername,
          sourceStatus: channelCheck.source?.status,
        },
      });
      console.log(
        `[TelegramBot] Ingestion paused for channel "${chatTitle || chatId}": ${channelCheck.reason}`
      );
      return;
    }

  }



  try {
    const knowledge: KnowledgeDocument | null = await createTelegramKnowledge({
      content: rawPost,
      type: MessageType.CHANNEL_MESSAGE,
    });

    if (!knowledge) {
      await telegramLogService.log({
        messageId,
        chatId,
        chatTitle,
        author,
        status: "skipped",
        rawSnippet,
        reason: "Message was skipped during normalization.",
        source: sourceName,
      });
      return;
    }

    const savedDoc = await knowledgeService.create(knowledge);
    const chunksCount = savedDoc?.chunks?.length ?? 0;

    await telegramLogService.log({
      messageId,
      chatId,
      chatTitle,
      author,
      contentType: savedDoc?.contentType || knowledge.contentType,
      status: "success",
      rawSnippet,
      documentId: savedDoc?.id || null,
      chunksCount,
      reason: `Successfully ingested and generated ${chunksCount} vector chunk(s).`,
      source: sourceName,
      metadata: {
        publishedAt: knowledge.publishedAt,
        hasMedia: knowledge.metadata?.hasMedia ?? false,
      },
    });

    console.log(`[TelegramBot] Successfully ingested message ${messageId} [${savedDoc?.contentType}]`);
  } catch (err: any) {
    const errorMessage = err?.message || String(err);
    const isDuplicate = errorMessage.toLowerCase().includes("already exists");

    await telegramLogService.log({
      messageId,
      chatId,
      chatTitle,
      author,
      status: isDuplicate ? "skipped" : "failed",
      rawSnippet,
      reason: errorMessage,
      source: sourceName,
    });

    if (isDuplicate) {
      console.log(`[TelegramBot] Duplicate skipped: message ${messageId}`);
    } else {
      console.error(`[TelegramBot] Ingestion failed for message ${messageId}:`, errorMessage);
    }
  }
}

bot.on("channel_post", async (ctx) => {
  await processTelegramUpdate(ctx.channelPost, "channel_post");
});

bot.on("message", async (ctx) => {
  if (ctx.message) {
    await processTelegramUpdate(ctx.message, "message");
  }
});

export default bot;