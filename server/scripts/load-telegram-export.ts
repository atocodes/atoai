import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadTelegramExport() {
  try {
    // 1. Resolve relative to this file in src/lib/scripts -> ../../../data/telegram/result.json
    const relativePath = path.resolve(__dirname, "../../../data/telegram/result.json");
    // 2. Resolve relative to current working directory (e.g. server root)
    const cwdPath = path.resolve(process.cwd(), "data/telegram/result.json");

    const file = existsSync(relativePath)
      ? relativePath
      : existsSync(cwdPath)
        ? cwdPath
        : relativePath;

    const data = await readFile(file, "utf-8");
    return data;
  } catch (error) {
    console.error("Error reading Telegram export file:", error);
  }
}