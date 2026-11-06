# Server API and request behavior

[← Server application](README.md) · [← Project guide](../../README.md) · [Authentication](../../services/authentication.md) · [Knowledge](../../services/knowledge.md)

## Route inventory

| Method | Path | Current behavior |
|---|---|---|
| `GET` | `/` | Returns `{ success: true }`. |
| `POST` | `/` | Parses JSON and calls Telegraf `bot.handleUpdate(data)`. |
| `GET`, `POST` | `/api/auth/[...all]` | Better Auth's Next.js handler, including email/password auth and bearer plugin behavior. |
| `GET` | `/api/auth/me` | Calls `authService.checkAdminStatus` and returns authenticated/user/isAdmin state. |
| `GET`, `POST` | `/api/auth/setup-admin` | Reports whether an admin exists; creates and promotes the first admin. |
| `POST` | `/api/auth/change-password` | Account password update handler. |
| `POST` | `/api/auth/change-email` | Account email update handler. |
| `GET`, `POST` | `/api/knowledge` | Lists documents or validates minimal required fields and creates a document. |
| `GET`, `PATCH`, `DELETE` | `/api/knowledge/[id]` | Reads, updates, or deletes a document. |
| `POST` | `/api/knowledge/[id]/regenerate` | Deletes and recreates chunks/embeddings for one document. |
| `PATCH`, `DELETE` | `/api/knowledge/[id]/chunks/[chunkId]` | Updates/re-embeds or deletes a chunk. |
| `GET` | `/api/knowledge/stats` | Returns aggregate knowledge counts. |
| `POST` | `/api/knowledge/search` | Validates `query` as a non-empty string, then performs direct vector search. |
| `POST` | `/api/chat` | Validates `question` as a string and returns generated answer plus source summaries. |
| `GET`, `DELETE` | `/api/telegram/logs` | Lists logs or clears the log table. |
| `GET`, `DELETE` | `/api/telegram/logs/[id]` | Reads or deletes one log. |
| `GET` | `/api/telegram/logs/stats` | Returns log statistics. |

## Route handling pattern

Routes commonly catch exceptions and return JSON with a `success: false` field and an error message. Basic validation is implemented inline, often only for the primary string or required fields. There is no shared request-schema middleware visible across all routes. `knowledgeService.list` clamps pagination (`page >= 1`, `1 <= limit <= 100`) after parsing query strings.

The admin API client in `admin.atoai/src/lib/api-client.ts` calls `fetch` with `credentials: "include"` and JSON headers, parses JSON, and throws on non-2xx responses. The backend proxy at `src/proxy.ts` handles CORS/preflight for `/api/:path*`, not authorization.

## Authorization boundary (critical)

`/api/auth/me` does check whether a session belongs to an admin. This is used by the admin UI to decide whether to display the dashboard. In contrast, the checked knowledge, search, chat, and Telegram log route handlers directly invoke domain services without calling `authService.checkAdminStatus` or another visible guard. The UI gate is not server authorization. This is the checked-in behavior; do not infer route protection from UI behavior or prior documentation.

The setup route checks for an existing admin in `AuthService.setupInitialAdmin` before signup/promotion. Other auth endpoints should be reviewed individually. The root webhook similarly has no visible shared-secret check despite the config variable.

## HTTP and side effects

- `POST /api/knowledge` can persist a document, call a chat model for smart chunking, call the embedding provider for each chunk, and write chunk rows.
- `PATCH /api/knowledge/[id]` can update document fields and optionally delete/recreate chunks and embeddings.
- `POST /api/knowledge/[id]/regenerate` deletes existing chunks before attempting to create replacements. Failures can therefore leave the document with no chunks.
- `POST /api/chat` performs query analysis, embedding, database search, and chat generation synchronously.
- Telegram endpoints can persist logs; log service failures are swallowed into transient fallback objects.

No API route in this inventory enqueues a durable background job.
