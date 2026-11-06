import { chatProvider } from "@/ai/chat";
import { CHUNKER_PROMPT } from "@/ai/prompts/ollama.prompts";

export interface KnowledgeChunkInput {
  content: string;
  chunkIndex: number;
}

const MAX_CHUNK_LENGTH = 1000;

export function chunkKnowledge(content: string): KnowledgeChunkInput[] {
  const text = content.trim();

  if (!text) {
    return [];
  }

  if (text.length <= MAX_CHUNK_LENGTH) {
    return [
      {
        content: text,
        chunkIndex: 0,
      },
    ];
  }

  const chunks: KnowledgeChunkInput[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    let end = start + MAX_CHUNK_LENGTH;

    if (end < text.length) {
      const newline = text.lastIndexOf("\n", end);

      if (newline > start) {
        end = newline;
      }
    }

    const chunk = text.slice(start, end).trim();

    if (chunk) {
      chunks.push({
        content: chunk,
        chunkIndex,
      });

      chunkIndex++;
    }

    start = end;
  }

  return chunks;
}
