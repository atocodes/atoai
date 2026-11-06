# Admin application

[← Project guide](../../README.md) · [Feature flows](features.md) · [Server API](../server/api.md) · [Authentication](../../services/authentication.md)

## Role and structure

`admin.atoai/` is a separate Next.js 16 / React 19 browser application configured by `NEXT_PUBLIC_SERVER_URL` (defaults in code to `http://localhost:3000`). It provides the operator UI; business rules and persistence are on the server. The main page, `src/app/page.tsx`, composes the app as a client component and coordinates the active tab and modal/drawer selections.

Feature code is grouped under `src/features/{auth,knowledge,search,chat,telegram-logs,settings}`. Each feature generally contains types, a service wrapper, a hook for state/loading, and components. `src/lib/api-client.ts` centralizes requests to server routes; `src/lib/auth-client.ts` initializes the Better Auth client. `AdminHeader` supplies tab navigation and ingest/logout actions.

## Client-to-server lifecycle

1. The page mounts and calls `useAuth`.
2. `useAuth` reads a cached user, then verifies session and initial-admin state through auth feature services.
3. Feature hooks receive `!!user` and fetch their data when an admin user is present in client state.
4. Components update hook state or call feature service methods.
5. Services use the shared API client or Better Auth client to call the backend.
6. The page refreshes relevant datasets after mutations.

This is a UI flow only. API routes must independently enforce authorization; checked knowledge/chat/log routes currently do not all do so. See [server API](../server/api.md) and [authentication](../../services/authentication.md).

## Feature pages

See [feature flows](features.md) for the detailed mapping between hooks/components/services and backend routes. Feature domains are:

- authentication and initial setup
- knowledge ledger, manual ingestion, document details and chunks
- direct vector search playground
- RAG chat studio and source display
- Telegram ingestion log console
- account settings

`admin.atoai/README.md` remains a create-next-app template and does not describe these features. No browser-side persistence is authoritative; cached auth state is only an initial UI hint and is followed by server verification.
