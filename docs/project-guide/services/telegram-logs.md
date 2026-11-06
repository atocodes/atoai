# Telegram ingestion logs

[← Project guide](../README.md) · [Knowledge ingestion](knowledge.md) · [Admin feature flow](../apps/admin/features.md) · [Server API](../apps/server/api.md)

## Purpose and model

`TelegramIngestionLog` records per-update outcomes separately from knowledge documents: message ID, chat metadata, author, content type, status (`success`, `skipped`, `failed`), raw text snippet, resulting document ID, chunk count, reason, source, metadata, and creation time. The schema adds indexes for status, timestamp, and message ID. `documentId` is a nullable string, not a declared relation.

The Telegraf handler records empty updates and certain forwarded updates as skipped, normalized skips as skipped, successful creates as success, and caught exceptions as failed unless their text looks like a duplicate. Logging occurs synchronously after processing decisions.

## Service and UI flow

`server/src/lib/telegram/bot.ts` calls `telegramLogService.log`. The service delegates to `TelegramLogRepoImpl`; if persistence throws, it logs the error and returns a transient fallback log object so ingestion flow is not interrupted. Such fallback entries do not exist in the database and will not appear in the dashboard.

The admin `useTelegramLogs` hook drives pagination, status/search filters, stats, refresh, delete, and clear. Components include `TelegramLogTable`, `TelegramLogStatsGrid`, and `TelegramLogDrawer`. API handlers are under `server/src/app/api/telegram/logs/`.

## Operational caveats

- A log's success means the service path returned a document and recorded a log attempt; it does not prove every expected chunk was embedded because per-chunk embedding errors are skipped.
- Duplicate classification uses application lookup/error-message matching, so error wording can affect whether an event is reported as skipped or failed.
- Log persistence failure is deliberately non-fatal to ingestion, which trades observability completeness for pipeline continuity.
- Log delete/clear endpoints have no explicit auth check in their route handlers as currently written.
