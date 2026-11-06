# Knowledge ingestion and lifecycle

[← Project guide](../README.md) · [Server routes](../apps/server/api.md) · [Data platform](../data-platform/README.md) · [Importers](../operations/importers.md) · [End-to-end workflows](../workflows.md)

## Purpose and consumers

The knowledge domain turns source content into searchable canonical documents. Telegram is processed by the live Telegraf bot and export importer; Markdown files are processed by a batch importer; operators can create/edit/delete documents through the admin UI. Search and chat consume stored chunks and metadata.

## Key files

- Entry routes: `server/src/app/api/knowledge/route.ts`, `[id]/route.ts`, `[id]/regenerate/route.ts`, `[id]/chunks/[chunkId]/route.ts`.
- Orchestration: `server/src/module/knowledge/service/knowledge.service.ts`.
- Persistence: `server/src/module/knowledge/repo/knowledge.repo.impl.ts`, `knowledge-chunk.repo.impl.ts` and interfaces beside them.
- Source handling: `server/src/lib/knowledge/telegram/{parser,cleaner,normalizer}/`; equivalent Markdown parser/cleaner/normalizer directories.
- Chunking/embeddings: `server/src/lib/db/knowledge/chunker.ts`, `server/src/lib/ai/embeddings/`, `server/src/lib/ai/chat/`.
- Browser path: `admin.atoai/src/features/knowledge/`.

## Create lifecycle

1. A route, script, or bot creates a `CreateKnowledgeDTO` with source, source ID, author, content, publication date, content type, and optional metadata.
2. `KnowledgeService.create` looks up a matching source ID when provided. If found, it returns the existing document rather than reimporting it.
3. `KnowledgeRepoImpl.create` writes the document and related metadata/links (see schema/repository code for nested write details).
4. `processAndSaveChunks` calls `chatProvider.smartChuncker`. Exceptions and empty output trigger `chunkKnowledge`, a deterministic newline-aware splitter targeting max 1,000 character pieces.
5. The service embeds each chunk sequentially using its `EmbeddingProvider` and saves only chunks with a nonempty embedding result.
6. The service reloads the document with its associated data and returns it.

The document write and vector writes are not one all-or-nothing transaction around external model calls. Classifier or repository errors can fail creation; embedding errors are caught per chunk and can leave a persisted document partially or entirely unindexed.

## Telegram normalization

`createTelegramKnowledge` chooses a Telegram parser based on `MessageType`, rejects parsed forwarded content, cleans file placeholders and excess blank lines, normalizes author/date/text and metadata, checks source ID duplication, and calls the classifier to assign `contentType`. Telegram entities supply hashtag/mention/link metadata. The current parser expects `raw.sender_chat.title` in the channel parser; verify source shapes before broadening inputs. The live bot separately skips empty and certain forwarded update fields before invoking this path.

## Update, chunks, deletion

- Document updates happen through `KnowledgeService.update`. If the request asks to regenerate chunks, current chunks are deleted and reprocessed from new content (or existing content when content was omitted).
- Dedicated regeneration also deletes before recreation. A subsequent chunk/embed failure can leave zero chunks.
- Chunk update can generate a new embedding; embedding failure is caught and the content update can continue without a fresh vector depending on repository update semantics.
- Chunk lookup in the service is by `chunkId`; the shown service does not compare the chunk's `documentId` to the route's document ID. Treat this as an ownership-validation caveat.
- Document deletion relies on database relation cascades for metadata and chunks. `DocumentLink` cascades from metadata.

## Validation and side effects

The create route checks only `content`, `author`, and `contentType` presence. Other DTO validation is primarily TypeScript-level; caller JSON is runtime data. Source uniqueness is enforced in the database and checked in application code, but concurrent creates can still race and hit the unique constraint. AI classifier, smart chunker, and embedding calls are synchronous side effects in the request/import flow; no durable queue is present.

See [search/RAG](search-rag.md) for how chunks are consumed and [data platform](../data-platform/README.md) for the persisted schema.
