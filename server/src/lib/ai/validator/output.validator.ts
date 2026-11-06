import { z } from "zod";

const nullableString = z
  .string()
  .nullable()
  .optional()
  .transform((val) => val ?? undefined);

export const knowledgeFitlerSchema = z.object({
  contentType: nullableString,
  from: nullableString,
  to: nullableString,
  hashtags: z.array(z.string()),
  mentions: z.array(z.string()),
});

export const knowledgeQuerySchema = z.object({
  semanticQuery: z.string(),
  filters: knowledgeFitlerSchema,
});

export type knowledgeQuery = z.infer<typeof knowledgeQuerySchema>;
