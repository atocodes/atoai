# Server application

[← Project guide](../../README.md) · [API behavior](api.md) · [Knowledge](../../services/knowledge.md) · [Search/RAG](../../services/search-rag.md) · [Authentication](../../services/authentication.md) · [Data platform](../../data-platform/README.md)

## Role

`server/` is a Next.js App Router application (Next 16, TypeScript) that acts as the backend API, Telegram bot webhook consumer, AI orchestration layer, and persistence adapter. In development, its package script runs `next dev` on the default port 3000.

## Request and dependency layers

- `src/app/` contains route handlers. Routes parse request input, call services, and shape JSON responses.
- `src/module/` contains auth, knowledge, chat, and Telegram-log interfaces, services, and repository implementations.
- `src/lib/ai/` contains provider adapters, prompts, embeddings, validation helpers, and RAG stages.
- `src/lib/knowledge/` contains Telegram and Markdown parsing, cleanup, normalization, and domain types.
- `src/lib/db/knowledge/` contains database-level knowledge abstractions and chunking/search helpers.
- `src/prisma/db.ts` provides the Prisma client; generated code is in `src/prisma/generated/prisma/`.
- `src/proxy.ts` adds CORS response headers and handles preflight for `/api/:path*`.

Services often instantiate concrete default adapters when constructor arguments are omitted. This makes services usable directly from routes but means dependency selection is partly module-level rather than centrally wired.

## Backend composition

`src/lib/ai/rag.ts` creates singleton search, retrieval, context, and answer services. Knowledge and log modules similarly export default service instances. API endpoints import those instances. The Telegram bot imports `knowledgeService` and `telegramLogService` and dispatches events through Telegraf.

There is no visible queue or durable background-job system. Ingestion, classification, chunking, embeddings, and database writes are awaited in the request/script flow. Long or slow AI operations therefore affect webhook/API latency and can fail after a document has already been written.

## Main entry points

| Entry | Source |
|---|---|
| Telegram update webhook | `src/app/route.ts` → `src/lib/telegram/bot.ts` |
| Knowledge CRUD | `src/app/api/knowledge/` → `src/module/knowledge/service/` |
| Direct vector search | `src/app/api/knowledge/search/route.ts` → search service/repository |
| RAG chat | `src/app/api/chat/route.ts` → chat service → `src/lib/ai/rag.ts` |
| Better Auth | `src/app/api/auth/[...all]/route.ts` → `src/module/auth/service/auth.config.ts` |
| Telegram log API | `src/app/api/telegram/logs/` → Telegram log service/repository |

See [API behavior](api.md) for methods and boundaries, [configuration](../../operations/development.md) for env setup, and the domain pages for complete flows.

## Important implementation cautions

- `src/app/route.ts` does not validate `WEBHOOK_SECRET`; see [authentication and request boundaries](../../services/authentication.md).
- The auth layer is not applied globally to routes. Several management endpoints call services directly without checking a session or admin role.
- `src/config/env.ts` validates env at module load and requires Telegram, Ollama, and Jina settings even if some corresponding providers are not selected.
- Prisma vector width is fixed at 768 in the schema.
- `server/README.md` is still a generic Next.js template; it is not a reliable deployment/runbook.
