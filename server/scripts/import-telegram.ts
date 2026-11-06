import "@/lib/dns";
import { loadTelegramExport } from "./load-telegram-export";
import { knowledgeService } from "@/db/knowledge";
import { chatProvider } from "@/ai/chat";
import { parseTelegramMessage } from "@/lib/knowledge/telegram/parser/telegram.parser";
import { cleanTelegramMessage } from "@/lib/knowledge/telegram/cleaner/telegram.cleaner";
import { normalizeTelegramMessage } from "@/lib/knowledge/telegram/normalizer/telegram.normalizer";

async function main() {
  console.log("\x1b[36m🚀 Starting Telegram Export Pipeline...\x1b[0m\n");

  const exportData = await loadTelegramExport();
  if (!exportData) {
    console.error("\x1b[31m✖ Failed to load Telegram export data.\x1b[0m");
    process.exit(1);
  }

  const json = JSON.parse(exportData);
  const messages: any[] = json.messages ?? [];
  const totalMessages = messages.length;

  console.log(
    `📦 Loaded \x1b[33m${totalMessages}\x1b[0m messages from export.\n`,
  );

  let skippedCount = 0;
  let importedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  for (let i = 0; i < totalMessages; i++) {
    const rawMessage = messages[i];
    const indexStr = `[${i + 1}/${totalMessages}]`;

    try {
      const parsed = parseTelegramMessage(rawMessage);
      if (!parsed) {
        skippedCount++;
        process.stdout.write(
          `\r\x1b[K\x1b[90m${indexStr} Skipping non-supported message (ID: ${rawMessage.id ?? "N/A"})\x1b[0m`,
        );
        continue;
      }
      if (parsed.forwardedFrom) {
        console.log(
          "Forwareded message ",
          parsed.forwardedFrom,
          parsed.text,
          " Skipped",
        );
        continue;
      }

      process.stdout.write(
        `\r\x1b[K\x1b[35m⏳ ${indexStr} Classifying message ${parsed.id} with Ollama...\x1b[0m`,
      );

      const cleaned = cleanTelegramMessage(parsed);
      const document = normalizeTelegramMessage(cleaned);

      const exists = await knowledgeService.findWithSourceId(document.sourceId);

      if (exists) {
        console.log("DATA Exists: ", exists.id, exists.content);
        continue;
      }
      // const classification = await classifiyWithOllama(document.content);

      const classification = await chatProvider.classifier(document.content);
      console.log(classification, document.content, "CLASSSIFICATION");
      document.contentType = classification.category;

      process.stdout.write(
        `\r\x1b[K\x1b[34m💾 ${indexStr} Saving message ${parsed.id} [${document.contentType}]...\x1b[0m`,
      );

      const knowledgeDocument = await knowledgeService.create(document);

      if (!knowledgeDocument) {
        duplicateCount++;
        console.log(
          `\r\x1b[K\x1b[33m⚠️  ${indexStr} Skipped duplicate document (ID: ${parsed.id})\x1b[0m`,
        );
      } else {
        importedCount++;
        console.log(
          `\r\x1b[K\x1b[32m✔ ${indexStr} Imported ID ${parsed.id} as [${document.contentType}]\x1b[0m`,
        );
      }
    } catch (error) {
      errorCount++;
      console.log(
        `\r\x1b[K\x1b[31m✖ ${indexStr} Error processing message ${rawMessage.id}: ${error instanceof Error ? error.message : error}\x1b[0m`,
      );
    }
  }

  console.log("\n\x1b[36m═════════════════════════════════════════\x1b[0m");
  console.log("\x1b[1m🎉 Import Pipeline Completed\x1b[0m");
  console.log(`   \x1b[32m✔ Created:\x1b[0m   ${importedCount}`);
  console.log(`   \x1b[33m⚠️ Duplicates:\x1b[0m ${duplicateCount}`);
  console.log(`   \x1b[90m⏭ Skipped:\x1b[0m    ${skippedCount}`);
  if (errorCount > 0) {
    console.log(`   \x1b[31m✖ Errors:\x1b[0m     ${errorCount}`);
  }
  console.log("\x1b[36m═════════════════════════════════════════\x1b[0m\n");
}

main().catch((err) => {
  console.error("\x1b[31mFatal script execution error:\x1b[0m", err);
  process.exit(1);
});
