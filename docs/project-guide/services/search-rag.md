# Semantic search and RAG

[← Project guide](../README.md) · [Knowledge lifecycle](knowledge.md) · [Data platform](../data-platform/README.md) · [Admin feature flow](../apps/admin/features.md) · [End-to-end workflows](../workflows.md)

## Two related query paths

### Direct semantic search

`POST /api/knowledge/search` validates `query`, then `KnowledgeSearchService.search` embeds the raw query and calls `KnowledgeSearchRepoImpl.search`. This path is used by the vector playground. It does not analyze intent or generate an answer.

### Chat / RAG

`POST /api/chat` validates `question` then calls `ChatService.ask`. The composed `ragService` runs:

1. `RetrievalService.retrieve(question)` calls `chatProvider.analyzeQuery` to produce a `semanticQuery` and metadata filters.
2. The semantic query is embedded.
3. The search repository applies supported filters and orders chunk rows by `embedding <=> query_vector`; default limit is 10.
4. `ContextBuilder.build(results)` formats the evidence with source fields.
5. `AnswerService` asks `chatProvider.generate({ question, context })` for an answer.
6. `ChatService` maps results into response sources containing source ID, author, content type, distance, and chunk content.

Composition: `server/src/lib/ai/rag.ts`. Stages: `server/src/lib/ai/rag/{retrieval.service,context.builder,answer.service}.ts`. Direct-search service/repository live under `server/src/module/knowledge/` and `server/src/lib/db/knowledge/` (there are overlapping module and lib repository trees; follow imports to know which implementation is active).

## Search query details

The raw SQL repository uses parameterized `Prisma.sql` fragments for content type, `published_at >= from`, `published_at < to`, and array containment for hashtags/mentions. It joins chunks to documents and metadata and ranks by cosine distance. The endpoint converts `from`/`to` values to `Date` before calling the service; query/filter schemas should be checked at the provider boundary, because the route itself does little validation beyond the query string.

Lower distance means closer vectors. The distance is not automatically a calibrated probability or universal relevance score. Search behavior depends on embedding model, dimensions, content chunking, available metadata, and selected limit.

## Providers, prompts, and validation

Embedding providers are selected in `server/src/lib/ai/embeddings/index.ts`; chat provider selection is in `server/src/lib/ai/chat/index.ts`. Provider adapters live under `chat/{ollama,gemini}` and `embeddings/`. Prompts are under `server/src/lib/ai/prompts/`. Query output validation is in `server/src/lib/ai/validator/output.validator.ts`, with filter normalization helpers under `utils/`.

The shared interfaces do not guarantee identical response semantics across providers. Read the selected provider's implementation and prompt when changing classifier, query-analysis, chunking, or answer behavior.

## Failure and consistency behavior

- Query-analysis, query embedding, database errors, or generation errors bubble to `POST /api/chat`, which returns HTTP 500 and an error string.
- If direct search embedding returns no values, its service returns an empty result array.
- The RAG retrieval path throws when embedding fails.
- No result does not short-circuit generation in the shown `AnswerService`; an empty context can still be passed to the chat provider.
- Existing document vectors are not automatically migrated when changing provider/model. Re-embed the corpus consistently; mixing embedding spaces makes distances meaningless.
- The schema fixes vectors at 768 dimensions even though env config is nominally configurable.

Use the direct search playground to isolate retrieval from answer synthesis. Use the answer route after source ranking looks plausible.
