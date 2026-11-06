# End-to-end workflows

[← Project guide](README.md) · [Study sequence](study-guide.md) · [Knowledge lifecycle](services/knowledge.md) · [Search/RAG](services/search-rag.md) · [Authentication](services/authentication.md) · [Telegram logs](services/telegram-logs.md)

## 1. Live Telegram update → searchable chunks

1. Telegram sends an update to `POST /` (`server/src/app/route.ts`).
2. The route calls `bot.handleUpdate` (`server/src/lib/telegram/bot.ts`); Telegraf dispatches `channel_post` or `message`.
3. The bot extracts message/chat/author/snippet. Empty messages and recognized forwarded messages are logged as skipped.
4. `createTelegramKnowledge` parses, cleans, normalizes, checks duplicate source ID, and invokes the content classifier.
5. `KnowledgeService.create` checks for an existing source ID, writes document/metadata, calls smart chunking with deterministic fallback, embeds chunks, and persists successful embeddings.
6. The bot writes a success/failure/skipped log. Log persistence failure is swallowed by `TelegramLogService` and does not unwind ingestion.

Current boundary caveat: the route does not verify `WEBHOOK_SECRET`. Classification, chunking, embedding, database writes, and log writes happen synchronously within update handling.

## 2. Admin manual ingest → document drawer

1. Admin page selects the knowledge tab and opens `IngestModal`.
2. Modal invokes the knowledge hook's ingest callback, which calls the frontend knowledge service/API client.
3. `POST /api/knowledge` only checks that content, author, and content type are present, then calls `KnowledgeService.create`.
4. Server persists the document and attempts chunking/embedding. The API returns the saved document.
5. The hook refreshes stats/list and the UI can open the drawer, which fetches `GET /api/knowledge/[id]` and shows metadata/chunks.

Authorization caveat: these knowledge handlers do not currently show a server-side admin check.

## 3. Vector playground search

1. User enters a query/options in `VectorPlayground`.
2. `useVectorSearch` calls the search feature service, which posts to `/api/knowledge/search`.
3. Route validates query type, converts date options if supplied, and calls `KnowledgeSearchService`.
4. Service embeds the raw query; repository runs filtered pgvector SQL and returns ordered chunks with distance/source metadata.
5. Hook stores results and the component displays them; selecting a result can open its document.

This workflow isolates query embedding and retrieval from chat generation.

## 4. RAG chat answer

1. Chat UI submits the current user question to `/api/chat`.
2. Route checks question is a string, then `ChatService.ask` calls `ragService.answer`.
3. Retrieval analyzes the question to structured semantic text/filters, embeds the semantic query, and searches chunks.
4. Context builder formats returned results; selected chat provider generates from original question plus context.
5. Chat service returns answer and mapped sources; hook appends them to browser chat state for display.

The shown route takes a question, not an explicit message-history array. Do not assume multi-turn conversation context is sent to the model. Empty retrieval is still passed into answer generation.

## 5. First admin setup → dashboard

1. `useAuth` checks `/api/auth/me` and `/api/auth/setup-admin` on mount (after optional cache hydration).
2. If no admin exists, the modal offers setup; setup route asks `AuthService` to check, Better Auth to create a user, and repository to set role `admin`.
3. Hook signs in immediately with those credentials and stores the returned user state.
4. Dashboard mounts domain hooks and loads feature data.

First-admin setup is an app-level check, not a database transaction spanning check and creation. More importantly, dashboard visibility does not enforce auth on unrelated backend routes.

## 6. Rebuild chunks after content edit

1. Drawer submits an update with `regenerateChunks` (or calls the dedicated regenerate endpoint).
2. Service updates document fields, deletes current chunk rows, chunks current/new content, and embeds each chunk.
3. New chunk rows are written for successful embeddings; document detail is fetched again and UI refreshed.

Because deletion precedes model calls, a failure after deletion can leave no chunks. This flow is not an atomic transaction with AI calls.
