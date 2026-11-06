import { existsSync, readdir, readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { knowledgeService } from "@/module/knowledge";
import { parseMdFile } from "@/lib/knowledge/markdown/parser/markdown.parser";
import { cleanDoc } from "@/lib/knowledge/markdown/cleaner/markdown.cleaner";
import { normalizeDocContent } from "@/lib/knowledge/markdown/normalizer/markdown.normalizer";
import { chatProvider } from "@/lib/ai/chat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadMarkdownFile(): Promise<string[] | undefined> {
  try {
    const relativePath = path.resolve(__dirname, "../data/md/INIT.md");
    const cwdPath = path.resolve(process.cwd(), "data/md/INIT.md");

    const relativeBasePath = path.resolve(__dirname, "../data/md/");
    const cwdBasePath = path.resolve(process.cwd(), "data/md/");

    // const file = existsSync(relativePath)
    //   ? relativePath
    //   : existsSync(cwdPath)
    //     ? cwdPath
    //     : relativePath;
    const pathName =
      readdirSync(relativeBasePath).length > 0
        ? relativeBasePath
        : readdirSync(cwdBasePath).length > 0
          ? cwdBasePath
          : "";

    if (pathName == "") return [];
    const fileNames = readdirSync(pathName);

    const datas = [];

    for (var fileName of fileNames) {
      const data = await readFileSync(path.join(pathName, fileName), "utf-8");
      datas.push(data);
    }
    return datas;
  } catch (error) {
    console.error("Error reading MD file ", error);
  }
}

async function main() {
  console.log("[Starting markdown export pipeline ......]");

  const datas = await loadMarkdownFile();

  if (!datas) {
    console.log("[MD importer] : No Data exists");
    return;
  }
  const totalDocs = datas?.length;

  let skippedCount = 0;
  let importedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  for (let i = 0; i < (totalDocs ?? 0); i++) {
    const rawContent = datas[i];
    const indexStr = `[${i + 1}/${totalDocs}]`;

    try {
      const parsed = parseMdFile(rawContent);
      if (!parsed) {
        skippedCount++;
        process.stdout.write(
          `\r\x1b[K\x1b[90m${indexStr} Skipping non-supported message (ID: ${rawContent.slice(0, 10) ?? "N/A"})...\x1b[0m`,
        );
        continue;
      }

      const cleaned = cleanDoc(parsed);
      const document = normalizeDocContent(cleaned);
      const classification = await chatProvider.classifier(document.content);
      console.log(classification, document.content, "CLASSSIFICATION");

      document.contentType = classification.category;
      process.stdout.write(
        `\r\x1b[K\x1b[34m💾 ${indexStr} Saving message ${document.sourceId} [${document.contentType}]...\x1b[0m`,
      );

      const knowledgeDocument = await knowledgeService.create(document);

      if (!knowledgeDocument) {
        duplicateCount++;
        console.log(
          `\r\x1b[K\x1b[33m⚠️  ${indexStr} Skipped duplicate document (ID: ${document.sourceId})\x1b[0m`,
        );
      } else {
        importedCount++;
        console.log(
          `\r\x1b[K\x1b[32m✔ ${indexStr} Imported ID ${document.sourceId} as [${document.contentType}]\x1b[0m`,
        );
      }
    } catch (error) {
      errorCount++;
      console.log(error);
      console.log(
        `\r\x1b[K\x1b[31m✖ ${indexStr} Error processing message ${rawContent.slice(0, 10)}...: ${error instanceof Error ? error.message : error}\x1b[0m`,
      );
    }
  }
}

main();
