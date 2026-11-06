import { nanoid } from "zod";
import { CleanedDoc } from "../../types/doc.types";
import { KnowledgeDocument } from "../../types/knowledge";
import { createNanoId } from "@/lib/nanoid";

export function normalizeDocContent(doc: CleanedDoc): KnowledgeDocument {
  return {
    content: doc.text,
    author: doc.author,
    source: "md",
    sourceId: createNanoId(),
    publishedAt: new Date(),
    contentType: "journal",
  };
}
