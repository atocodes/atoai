import { ParsedDoc } from "../../types/doc.types";

export function parseMdFile(raw: string): ParsedDoc | null {
  if (raw == "") {
    return null;
  }

  return {
    author: "atocodes",
    date: new Date().toISOString(),
    text: raw,
  };
}
