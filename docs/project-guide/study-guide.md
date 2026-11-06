# Repository navigation and study sequence

[← Project guide](README.md) · [Server](apps/server/README.md) · [Admin](apps/admin/README.md) · [Workflows](workflows.md)

## Repository navigation

```text
server/
  src/app/             HTTP route entry points and root Telegram webhook
  src/module/          auth, knowledge, chat, Telegram log services/repos/interfaces
  src/lib/ai/           chat + embedding adapters, prompts, retrieval and answer stages
  src/lib/knowledge/    Telegram/Markdown parser-cleaner-normalizer pipelines
  src/lib/db/           Prisma setup and lower-level knowledge DB/search operations
  prisma/               schema, migrations, seed
  scripts/               importers and standalone checks
admin.atoai/
  src/app/              dashboard shell and app styling
  src/features/         feature components, hooks, service wrappers, types
  src/lib/               API client and Better Auth client
docs/project-guide/      this implementation-oriented guide
```

Watch for similarly named services/repos in `server/src/module/` and `server/src/lib/db/`. The import statement reveals which is active for a given code path.

## Suggested study sequence

1. Read [system architecture](README.md) and [current discrepancies](README.md#known-documentationcode-differences).
2. Read [end-to-end workflows](workflows.md) once to get the call graph.
3. Trace manual knowledge creation: admin modal → feature hook/service → API route → `KnowledgeService` → chunker/embedder → repo/schema.
4. Trace Telegram ingestion separately: root route → bot → source pipeline → knowledge service → log service.
5. Study [data platform](data-platform/README.md), then [search/RAG](services/search-rag.md); compare direct vector search with chat retrieval.
6. Study [authentication](services/authentication.md) and inspect each route's auth behavior before changing access policy.
7. Read admin [feature flows](apps/admin/features.md), matching each service wrapper to its server route.
8. Review [configuration](operations/development.md) and [importers](operations/importers.md) before running scripts or changing provider/database setup.

## Change tracing checklist

For a behavior change, follow one complete path:

1. UI or external event input and shape.
2. Hook/service or route validation and authorization.
3. Domain service decisions and fallback behavior.
4. Repository query and transaction boundaries.
5. Schema/migration effects.
6. Response mapping, UI refresh, logging, and failure behavior.

For AI changes, also identify provider selection, prompt, runtime output validation, expected embedding width, and whether old stored data must be regenerated. For imports, confirm idempotent source IDs and the target database before executing the script.
