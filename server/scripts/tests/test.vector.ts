import "dotenv/config";

import { prisma } from "@/prisma/db";
import { JinaEmbeddingProvider } from "@/ai/embeddings/jina";

async function main() {
  console.log("Generating embedding...");
  const provider = new JinaEmbeddingProvider();
  const text =
    "Ato Codes is a software engineer and graphic designer building real-world products.";

  const embedding = await provider.embed(text);

  if (!embedding) {
    throw new Error("Failed to generate embedding");
  }

  console.log("Embedding generated.");
  console.log("Dimensions:", embedding.length);
  console.log("First 5 values:", embedding.slice(0, 5));

  if (embedding.length !== 768) {
    throw new Error(`Expected 768 dimensions, got ${embedding.length}`);
  }

  console.log("Creating test document...");

  const document = await prisma.knowledgeDocument.create({
    data: {
      source: "test",
      sourceId: `test-${Date.now()}`,
      author: "Ato Codes",
      content: text,
      publishedAt: new Date(),

      contentType: "personal",

      metadata: {
        create: {
          hashtags: [],
          mentions: [],
          reactions: [],
          hasMedia: false,
          forwarded: false,
          replied: false,
        },
      },
    },
  });

  console.log("Document created:", document.id);

  console.log("Saving embedding...");

  const vector = `[${embedding.join(",")}]`;

  await prisma.$executeRaw`
    INSERT INTO knowledge_chunks (
      id,
      document_id,
      content,
      chunk_index,
      embedding,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      ${document.id},
      ${text},
      0,
      ${vector}::vector,
      NOW(),
      NOW()
    )
  `;

  console.log("Embedding saved successfully.");

  const result = await prisma.$queryRaw<
    {
      id: string;
      content: string;
      dimensions: number;
    }[]
  >`
    SELECT
      id,
      content,
      vector_dims(embedding) AS dimensions
    FROM knowledge_chunks
    WHERE document_id = ${document.id}
  `;

  console.log("Database result:");
  console.log(result);

  const queryText = "What does Ato Codes do?";

  const queryEmbedding = await provider.embed(queryText);
  if (!queryEmbedding) {
    throw new Error("Failed to generate query embedding");
  }

  const queryVector = `[${queryEmbedding.join(",")}]`;

  const similar = await prisma.$queryRaw<
    {
      content: string;
      similarity: number;
    }[]
  >`
  SELECT
    content,
    1 - (embedding <=> ${queryVector}::vector) AS similarity
  FROM knowledge_chunks
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> ${queryVector}::vector
  LIMIT 5
`;

  console.log("Similar documents:");
  console.log(similar);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
