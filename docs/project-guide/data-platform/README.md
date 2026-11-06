# Data platform: PostgreSQL, Prisma, and pgvector

[← Project guide](../README.md) · [Knowledge lifecycle](../services/knowledge.md) · [Search/RAG](../services/search-rag.md) · [Development setup](../operations/development.md)

## Database topology

The server connects to PostgreSQL through `DATABASE_URL`. Prisma schema is `server/prisma/schema.prisma`; Prisma config is `server/prisma.config.ts`; migrations are in `server/prisma/migrations/`; `server/src/prisma/db.ts` provides the runtime client. `server/src/prisma/generated/prisma/` is generated client code, not the source of model truth.

The Prisma datasource declares PostgreSQL. The chunk embedding field is `Unsupported("vector(768)")?`, so Prisma cannot provide ordinary typed vector operations. Chunk repositories use raw SQL for vector insertion/update/search. The database must have the pgvector extension available and schema/migrations must establish the vector type before those queries work.

## Domain tables

| Table/model | Purpose and relationships |
|---|---|
| `KnowledgeDocument` | Canonical full text, source/source ID, author, published/edited timestamps, category-like `contentType`; unique source identity. |
| `KnowledgeMetadata` | Optional one-to-one hashtags, mentions, reactions JSON, media flags/type, forwarded/replied flags, original author. Cascades with document. |
| `DocumentLink` | Label/URL records attached to metadata; cascades with metadata. |
| `KnowledgeChunk` | Searchable content, per-document index, nullable vector embedding; unique `(documentId, chunkIndex)`; cascades with document. |
| `TelegramIngestionLog` | Update audit fields; no declared FK to document. |
| `User`, `Session`, `Account`, `Verification` | Better Auth persistence tables. Sessions/accounts cascade with users. |

`contentType` is a string in current schema, not the Prisma enum described in some older documentation. The former category model/field should not be confused with it; inspect migrations for historical evolution.

## Repository access

Module repositories under `server/src/module/knowledge/repo/` implement service-facing interfaces. A second/lower-level tree exists under `server/src/lib/db/knowledge/repo/`, including direct search implementation imported by `server/src/lib/ai/rag.ts`. Trace import paths before editing a similarly named class. Prisma handles relational CRUD; parameterized `Prisma.sql` and raw query methods handle vector values and operators.

## Migration and vector caveats

- There are checked-in migrations and a Prisma config, but the app README does not define a trustworthy deployment migration process. Follow the project's intended migration command and inspect current DB state before applying schema changes.
- The physical vector width is fixed to 768. The environment accepts a configurable dimension, which can disagree with storage.
- Changing embedding model/provider requires re-embedding existing rows in a compatible vector space; do not mix vectors from unrelated models.
- Nullable embedding allows rows without vectors, but search ordering over nulls and repository behavior should be considered when diagnosing incomplete results.
- Relation cascades cover related knowledge data, while Telegram log document references remain informational strings.
