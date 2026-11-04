# AdonisJS Foundry — `api` flavor

A production-ready AdonisJS v7 backend exposed as a pure versioned REST API — no Inertia, no React, no admin UI, no public site, no CMS. Every backend capability reaches your external front (Next.js, Nuxt, a mobile app) through `/api/v1/*` behind API token authentication.

## What is included

- **Versioned REST API** — identity/token auth (`/api/v1/auth`), profile and account (`/api/v1/profile`, `/api/v1/account`) and the admin surface (`/api/v1/admin`) for users, roles, permissions, files, folders, dashboard, logs and maintenance.
- **API token authentication** — opaque Bearer tokens issued by `/api/v1/auth/login` (and `/register`). No cookies, no CSRF handling on the token-guarded surface.
- **File management** — upload, folders, multi-disk storage (local, S3, R2) and public file serving through drive.
- **Operational features** — Redis cache/locks, mail, i18n, rate limiting, audit logs, maintenance mode and a first-class CORS policy.

No view layer and no CMS ship in this repository: the Inertia/React/Vite stack and the page/template/builder module live on `main` only. You bring the front, and it consumes the API.

## Quick start

```bash
npm install
cp .env.example .env
node ace generate:key
node ace migration:run
npm run dev
```

The API is available at `http://localhost:3333/api/v1`.

## Authentication flow

1. `POST /api/v1/auth/login` with `email` + `password` returns the user payload and an API token.
2. Send the token in the `Authorization: Bearer <token>` header on every authenticated request.
3. `POST /api/v1/auth/logout` revokes the token; token lifetime is configured with `AUTH_API_TOKEN_EXPIRY` (default `30 days`).

Registration, email verification, password reset and invitation acceptance are `POST /api/v1/auth/*` endpoints. The authenticated identity, profile and account endpoints live at `/api/v1/profile` and `/api/v1/account`.

## Social login (OAuth API mode)

OAuth providers (GitHub, Google, Facebook) work headless: open `/oauth/{provider}` in a browser or webview, and after the provider callback the backend issues an API token and redirects to `AUTH_API_CLIENT_URL` with `?token=...&expires_at=...`. Your mobile app reads the token from the redirect and uses it as a Bearer token from then on. With `AUTH_API_CLIENT_URL` unset, the `/oauth/*` callback returns a 500 config error rather than a session.

## Admin surface (endpoint map)

Under `/api/v1/admin`, each resource is a thin controller reusing the shared domain layer — administrators are just API claimers, and the surface is exactly the non-CMS one built on `main` (#6/#7):

| Resource    | Endpoints                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------- |
| Users       | `GET/POST /users`, `GET/PUT/DELETE /users/:id`                                                 |
| Roles       | `GET/POST /roles`, `GET/PUT/DELETE /roles/:id`                                                 |
| Permissions | `GET /permissions`                                                                             |
| Files       | `GET/POST /files`, `GET/DELETE /files/:id`, `PUT /files/:id/move`, `PUT/DELETE /files/:id/alt` |
| Folders     | `GET/POST /folders`, `GET/PUT/DELETE /folders/:id`                                             |
| Dashboard   | `GET /dashboard`                                                                               |
| Logs        | `GET /logs`                                                                                    |
| Maintenance | `GET/PUT /maintenance`, `PUT /maintenance/toggle`                                              |

All of them require `Authorization: Bearer <token>` and enforce the usual permission middleware (`users.view`, `files.create`, ...).

## CORS

The REST API is consumed cross-origin by definition, so CORS is a config step, not a code change: set `CORS_ALLOWED_ORIGINS` in `.env` to a comma-separated list of your front origins

```
CORS_ALLOWED_ORIGINS=https://app.example.com,http://localhost:3000
```

Empty (the default) allows no cross-origin browser access.

## Security headers

The CSP and other security headers (shield) stay intact. External fronts connect through the API with Bearer tokens, and no CSRF cookie is involved on the token-guarded `/api/v1/*` surface.

## Upgrade path to `full`

Choosing this flavor is not a one-way door. See `docs/flavors/api/upgrade-to-full.md` for the documented manual path to recover the Inertia admin, the public site, the frontend tooling and the CMS.

## Available scripts

| Script              | Description                   |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start the dev server with HMR |
| `npm run build`     | Build for production          |
| `npm start`         | Start the production server   |
| `npm test`          | Run the backend test suite    |
| `npm run lint`      | Run oxlint                    |
| `npm run format`    | Format code with oxfmt        |
| `npm run typecheck` | Type-check the backend        |
