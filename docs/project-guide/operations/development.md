# Configuration and local development

[← Project guide](../README.md) · [Server application](../apps/server/README.md) · [Admin application](../apps/admin/README.md) · [Data platform](../data-platform/README.md) · [Importers](importers.md)

## Applications and package commands

The server and admin are independent pnpm apps. `server/package.json` provides `dev`, `build` (Prisma generation then Next build), `start`, `lint`, `seed`, and `set-admin`. `admin.atoai/package.json` provides `dev` on port 3001, `build`, `start`, and `lint`. Each package declares pnpm 12.8.1.

Project READMEs in both apps are still stock create-next-app instructions. They say npm/yarn/pnpm options and omit this project's database, environment, provider, and two-app setup. Use package scripts and `.env.example` files as the more specific checked-in references, but still verify commands against current Prisma configuration.

## Environment inputs

`server/src/config/env.ts` uses Zod to validate environment at import time. It requires `DATABASE_URL`, Telegram token/secret/channel/webhook URL, `OLLAMA_API_KEY`, `CLOUD_OLLAMA_MODEL`, and `JINA_API_KEY`. It defaults embedding provider to Ollama, dimensions to 768, Gemini model, Jina model, local Ollama host, and Ollama embedding model. `GEMINI_API_KEY` is optional in the schema. `BETTER_AUTH_SECRET`, auth URLs, and admin URL appear in `.env.example` and are read elsewhere but are not validated by this env schema.

Notable mismatch: provider-specific credentials are required even if the provider is not selected. A minimal local Ollama-only environment still needs values for Telegram, Ollama cloud fields, and Jina because of module-load validation.

`admin.atoai/.env.example` defines `NEXT_PUBLIC_SERVER_URL`; `api-client.ts` also has a localhost fallback. This is a public browser env value and should point at the reachable server origin.

## Integrations

- PostgreSQL via Prisma; pgvector is used for chunk vectors.
- Telegram via Telegraf; server root route receives update JSON.
- Ollama, Gemini, and Jina adapters exist across chat and embedding layers. Selection knobs and required env values differ.
- Better Auth uses the server Prisma client and supports email/password plus bearer plugin.

## Local startup outline

1. Configure a PostgreSQL database and pgvector extension, then set `server/.env` using the example and the requirements above.
2. Inspect Prisma schema/config/migrations and apply the repository's chosen migration workflow. The README's generic Prisma instructions are not project-specific guidance.
3. Install and run `pnpm dev` in `server/`.
4. Set `NEXT_PUBLIC_SERVER_URL` in `admin.atoai/.env.local`, install, and run `pnpm dev` in `admin.atoai/` (port 3001).
5. Use initial admin setup flow or seed script after confirming configured database and credentials.

No command in this guide has been executed as part of documentation work. Validate provider connectivity and API behavior in a development environment before depending on an integration.
