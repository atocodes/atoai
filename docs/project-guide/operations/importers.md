# Importers and utility scripts

[← Project guide](../README.md) · [Knowledge lifecycle](../services/knowledge.md) · [Development setup](development.md) · [End-to-end workflows](../workflows.md)

## Telegram desktop export importer

`server/scripts/import-telegram.ts` loads the Telegram export through `load-telegram-export.ts`, parses its `messages` array, skips unsupported and forwarded messages, cleans and normalizes messages, skips IDs already present, classifies content, and calls the lower-level `knowledgeService.create`. It reports counters and catches errors per message so later items continue.

The source parser expects Telegram export objects with `type: "message"`, IDs, date, author/from fields, text/text_entities, and optional forward/reply data. The importer and live webhook share parser/cleaner/normalizer code but use different entry shapes and currently differ in handling/counters. A forwarded message branch logs and continues without incrementing the `skippedCount` counter.

`load-telegram-export.ts` is responsible for finding/loading the input file. Inspect it before running; the input location is part of the importer contract.

## Markdown importer

`server/scripts/import.md.ts` scans a `data/md/` directory relative to script or current working directory, reads all filenames, parses/cleans/normalizes each document, classifies it, and calls `knowledgeService.create`. It continues per-document on errors. Despite an unused `INIT.md` path variable, the current implementation reads every directory entry and does not visibly filter by extension. It expects the input directory to exist; an absent candidate path can be caught by the loader and produce no data.

The Markdown parser/normalizer determines generated source IDs and date/author defaults. Read those files before relying on repeat import deduplication; unique source IDs must be stable.

## Other scripts

- `server/prisma/seed.ts`: seed behavior for initial admin values, configurable through `INITIAL_ADMIN_*` env variables; inspect before use because seed writes auth data.
- `server/scripts/set-admin.ts`: CLI role promotion. The package exposes it as `pnpm set-admin`.
- `server/scripts/tests/`: standalone scripts for vector, search, retrieval, query builder, embeddings, and answer behavior. They are scripts, not a unified test-runner suite.
- `server/scripts/load-telegram-export.ts`: export loader helper.

## Side effects and safe operation

These importers write directly to the configured database and call external/local AI services synchronously. They do not show a transaction spanning classifier, embeddings, and persistence, nor a durable retry queue. Source ID uniqueness is the main duplicate protection. Confirm the target `DATABASE_URL`, expected input files, provider availability, and idempotency assumptions before execution.
