# Admin feature flows

[← Admin application](README.md) · [← Project guide](../../README.md) · [Knowledge service](../../services/knowledge.md) · [Search/RAG](../../services/search-rag.md) · [Telegram logs](../../services/telegram-logs.md)

## Dashboard composition

`src/app/page.tsx` owns `activeTab`, whether the manual ingest modal is open, and the selected document/log. It invokes `useAuth`, `useKnowledge(!!user)`, and `useTelegramLogs(!!user)`, then passes returned state and callbacks into feature components. Authentication loading renders a connection state. An unauthenticated user sees `AdminAuthModal`.

## Feature map

| Feature | State and UI | Service/API path | Important behavior |
|---|---|---|---|
| Auth | `features/auth/hooks/useAuth.ts`, `AdminAuthModal.tsx` | `features/auth/services/auth.service.ts`; Better Auth client and `/api/auth/me`, `/api/auth/setup-admin` | Cached user is displayed while an asynchronous verification runs. Login/setup errors are kept in hook state. Setup immediately signs in after creating the initial admin. |
| Knowledge | `features/knowledge/hooks/useKnowledge.ts`, `KnowledgeTable.tsx`, `KnowledgeStatsGrid.tsx`, `IngestModal.tsx`, `DocumentDrawer.tsx` | `features/knowledge/services/knowledge.service.ts` → `/api/knowledge`, stats, detail, chunk, regenerate routes | Hook owns pagination/search/filter/loading and refresh. Drawer inspects document/chunks and exposes update/delete/rebuild operations. Actual chunking and embedding are server-side. |
| Vector search | `features/search/hooks/useVectorSearch.ts`, `VectorPlayground.tsx` | `features/search/services/search.service.ts` → `/api/knowledge/search` | Sends query and options; displays ranked chunk results and distances. It directly exercises retrieval, without answer generation. |
| Chat | `features/chat/hooks/useRAGChat.ts`, `RAGChatStudio.tsx` | `features/chat/services/chat.service.ts` → `/api/chat` | Keeps conversational display state in the browser and renders returned source summaries. The server endpoint receives a question; this is not evidence that prior turns are sent as model history. |
| Telegram logs | `features/telegram-logs/hooks/useTelegramLogs.ts`, table/stats/drawer components | `features/telegram-logs/services/telegram-log.service.ts` → `/api/telegram/logs*` | Supports list/filter/pagination, inspect, delete, clear, stats, and refresh. |
| Settings | `features/settings/hooks/useSettings.ts`, `AdminSettingsView.tsx` | settings service → `/api/auth/change-email`, `/api/auth/change-password` | Account changes are server requests and auth state can be refreshed. |

## State, errors, and authorization

Feature hooks manage loading and local results; the server owns document and log state. `api-client.ts` includes cookies and throws when a response is not successful. Hooks/components catch or surface errors according to their feature implementation. A client-side hidden modal or tab is not a security boundary. Confirm backend route checks independently; see [API authorization](../server/api.md#authorization-boundary-critical).

## Caveat: UI promises versus route behavior

The UI may describe certain calls as admin operations, but several corresponding API routes currently lack explicit auth guards. Also, the API client's `checkAdminStatus` is a UI decision point; it does not automatically attach a guard to unrelated API requests. Treat the feature as functionally wired but review/implement server-side authorization before exposing it beyond a trusted environment.
