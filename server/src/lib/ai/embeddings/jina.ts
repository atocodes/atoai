import { EmbeddingProvider } from "../embedding";
import https from "https";

const JINA_API_KEY = process.env.JINA_API_KEY;

async function generateEmbeddingJina(
  text: string,
  dimensions: number,
): Promise<number[]> {
  console.log(
    `[Jina API] Initiating embedding request for text length: ${text.length} (dimensions: ${dimensions})`,
  );

  const data = JSON.stringify({
    model: process.env.JINA_EMBEDDING_MODEL || "jina-embeddings-v3",
    task: "retrieval.query",
    dimensions,
    normalize: true,
    input: [text],
  });

  const options = {
    hostname: "api.jina.ai",
    path: "/v1/embeddings",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JINA_API_KEY}`,
      "Content-Length": Buffer.byteLength(data),
    },
  };

  return new Promise<number[]>((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      let responseBody = "";

      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("error", reject);
      res.on("end", () => {
        responseBody = Buffer.concat(chunks).toString("utf-8");

        try {
          if (
            res.statusCode &&
            (res.statusCode < 200 || res.statusCode >= 300)
          ) {
            return reject(
              new Error(
                `Jina embedding failed (${res.statusCode}): ${responseBody}`,
              ),
            );
          }

          const parsed = JSON.parse(responseBody);
          console.log("[Jina API Response]: ", parsed);
          resolve(parsed.data[0].embedding as number[]);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

export class JinaEmbeddingProvider implements EmbeddingProvider {
  public readonly dimensions: number;

  constructor(dimensions?: number) {
    this.dimensions =
      dimensions ??
      parseInt(
        process.env.EMBEDDING_DIMENSIONS ??
          process.env.EMBEDDING_DIMENSION ??
          "768",
        10,
      );
  }

  async embed(text: string): Promise<number[] | null> {
    try {
      const embedding = await generateEmbeddingJina(text, this.dimensions);
      console.log(embedding, "EMBEDDING");
      if (embedding.length !== this.dimensions) {
        throw new Error(
          `Expected ${this.dimensions} dimensions, got ${embedding.length}`,
        );
      }

      return embedding;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
