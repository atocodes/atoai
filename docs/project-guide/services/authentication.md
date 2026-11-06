# Authentication and authorization

[← Project guide](../README.md) · [Server API](../apps/server/api.md) · [Admin application](../apps/admin/README.md) · [End-to-end workflows](../workflows.md)

## Authentication implementation

Better Auth is configured in `server/src/module/auth/service/auth.config.ts` with Prisma/PostgreSQL storage, email/password enabled, a bearer plugin, an additional `role` field defaulting to `user`, and trusted origins including the configured admin URL. `/api/auth/[...all]` delegates GET/POST to Better Auth's Next.js handler.

`AuthService.checkAdminStatus(headers)` first asks Better Auth for a session. If that fails, it reads a Bearer token and directly looks up a session row, checking expiry. It loads the user role and reports whether it equals `admin`. Errors are logged and converted to an unauthenticated response.

## Initial admin setup

`GET /api/auth/setup-admin` returns whether any admin exists. `POST` calls `setupInitialAdmin`, which checks for an existing admin, signs up by email/password through Better Auth, then promotes the created user through `AuthRepoImpl.setAdminRole`. The admin UI calls setup and then immediately signs in with the provided credentials.

This first-admin check and user creation are separate operations; concurrent setup calls are not visibly serialized. Inputs are forwarded from the request body and should receive explicit runtime validation if stronger guarantees are required.

## Admin UI session flow

`useAuth` initially loads a cached user if available, then verifies `/api/auth/me` and `/api/auth/setup-admin`. It only sets active `user` when the returned session is authenticated and admin. Login/setup/signout use the auth feature service. The shared server API client sends cookies (`credentials: include`) and Better Auth client handles sign-in/session operations.

The cache supports responsive UI startup; it is not proof of authorization. The backend must verify each protected request.

## Current authorization gap

The checked handlers for knowledge CRUD, search, chat, and Telegram log operations invoke services without checking a session/admin role. CORS in `src/proxy.ts` is not auth. The dashboard's modal gate does not protect direct HTTP calls. These operations therefore lack an explicit server-side authorization check in the current implementation.

The root Telegram update route similarly does not check `WEBHOOK_SECRET` even though the env schema requires it. A secret's presence in configuration does not authenticate incoming Telegram updates.

## Configuration concerns

`auth.config.ts` includes a fallback secret string if `BETTER_AUTH_SECRET` is absent. Meanwhile, the env example sets a value but `src/config/env.ts` does not validate `BETTER_AUTH_SECRET`, `BASE_URL`, `BETTER_AUTH_URL`, or `ADMIN_URL`. Deployment should verify effective Better Auth URL/secret settings explicitly. Do not treat example values as production-safe configuration.
