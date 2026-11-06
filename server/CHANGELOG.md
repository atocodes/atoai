# Changelog - server

All notable changes to the `server` application that have not yet been pushed to the remote repository.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.1]

### Added

- **Sources Feature Module (`src/module/sources/`)**:
  - **Prisma Schema & Migrations (`prisma/schema.prisma`)**:
    - Added `SourceType` enum (`TELEGRAM`, `WEBSITE`, `OTHER`) and `SourceStatus` enum (`ACTIVE`, `INACTIVE`, `ARCHIVED`, `DELETED`).
    - Added `Source` model with indexes on `type`, `status`, `channelId`, `username`, and `url`.
  - **Repository & Service (`src/module/sources/repo/`, `src/module/sources/service/`)**:
    - Implemented `SourceRepoImpl` for database operations including paginated querying, multi-field search (name, username, channelId, URL), filtering, updates, soft/hard deletes, and stats aggregation.
    - Implemented `SourceService` with business validation, channel permission verification (`isChannelAllowed`), and lifecycle management.
  - **REST API Endpoints (`src/app/api/sources/`)**:
    - `GET /api/sources`: List sources with pagination, search, and type/status filters.
    - `POST /api/sources`: Register new source with validation.
    - `GET /api/sources/[id]`: Retrieve detailed source information.
    - `PATCH /api/sources/[id]`: Partial update of source properties.
    - `DELETE /api/sources/[id]`: Remove a source.
    - `POST /api/sources/[id]/toggle`: Toggle source status between `ACTIVE` and `INACTIVE`.
    - `GET /api/sources/stats`: Aggregated metrics (total, active, inactive, archived, counts by type).
- **Blog Knowledge Pipeline (`src/lib/knowledge/blog/`)**:
  - Implemented end-to-end ingestion pipeline for blog posts:
    - **Parser (`blog.parser.ts`)**: Parses JSON, Markdown, or raw text into structured blog post entities.
    - **Cleaner (`blog.cleaner.ts`)**: Strips HTML tags, trims content, and formats composite searchable content (`title + excerpt + content`).
    - **Normalizer (`blog.normalizer.ts`)**: Converts cleaned blog post into the standardized `KnowledgeDocument` schema.
    - **Pipeline (`index.ts`)**: `createBlogKnowledge` coordinates parsing, deduplication, LLM category classification, embedding generation, and DB insertion.
  - Added support for `contentType: "blog"` / `sourceType: "blog"` in `POST /api/knowledge`.
- **Telegram Export Import Pipeline (`scripts/import-telegram.ts`)**:
  - Added batch import CLI script for Telegram chat history exports (`result.json`).
  - Supports cleaning, normalization, AI-powered message classification, embedding generation, and duplicate prevention with console progress reporting.

### Changed

- **Telegram Bot Ingestion (`src/lib/telegram/bot.ts`)**:
  - Integrated `sourceService.isChannelAllowed` check to ensure messages are only ingested from registered and active Telegram channels.
  - Disallowed or unknown channels are skipped and logged to `telegramLogService` with clear reasoning.
  - Gracefully handles duplicate knowledge documents by logging as `skipped` instead of `failed`.
- **Knowledge Ingestion Service (`src/module/knowledge/service/knowledge.service.ts`)**:
  - Enforced strict uniqueness by throwing a descriptive error when attempting to insert a document with an already existing `sourceId`.
- **Knowledge API Route (`src/app/api/knowledge/route.ts`)**:
  - Updated POST route response format to return `{ success: true, id: document.id }`.

### Fixed

- **Telegram Parser (`src/lib/knowledge/telegram/parser/telegram.parser.ts`)**:
  - Added fallback to `caption` for photo, video, or media messages when `text` is empty or undefined in `parseTelegramChannelMessage` and `parseTelegramMessage`.
- **Blog Ingestion Duplicate Handling (`src/lib/knowledge/blog/index.ts`)**:
  - Fixed duplicate error message referencing the normalized document rather than an undefined variable.
- **Console Log Cleanup**:
  - Removed extraneous debug `console.log` statements from chat provider, local Ollama service, and database service.
