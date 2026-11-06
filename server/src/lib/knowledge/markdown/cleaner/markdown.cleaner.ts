import { CleanedDoc, ParsedDoc } from "../../types/doc.types";

export function cleanDoc(data: ParsedDoc): CleanedDoc {
  return { ...data };
}
