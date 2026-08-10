# Upgrading the `api` flavor to `full`

The `api` flavor is headless: it ships no view layer, no session auth UI, and no
public site — the whole backend is the versioned, token-guarded REST API
(`/api/v1/*`). Choosing it is **not a one-way door**: the flavor is derived from
`main` by the declarative prune manifest at `tooling/prune/flavors/api.manifest.ts`
(deleted on the flavor branch), so every removed artifact is recoverable from the
`full` tree.

This guide is the manual inverse of that manifest. It lists the artifacts to
recover and the flags to flip. There is no tooling — the process is a `git` merge
plus a few manual edits.

## Strategy

Start from the `full` tree (`main`) and either:

1. **Merge `main` into your project** and remove the flavor-specific files you
   replaced, or
2. **Cherry-pick the deleted directories** back onto the flavor branch.

The artifact inventory below mirrors the manifest's `delete` list. Prefer
restoring whole directories over individual files.

## 1. Recover the frontend tree

| Artifact                    | From (`main`)                                    |
| --------------------------- | ------------------------------------------------ |
| Frontend app and pages      | `inertia`                                        |
| Frontend project reference  | `tsconfig.inertia.json`                          |
| Vite / Vitest configs       | `vite.config.ts`, `vitest.config.ts`             |
| Inertia / Vite config files | `config/inertia.ts`, `config/vite.ts`            |
| Inertia middleware          | `app/http/middleware/core/inertia_middleware.ts` |

Then reinstall the packages pruned by the manifest:

```bash
npm install @adonisjs/inertia @adonisjs/vite @inertiajs/react react react-dom \
  sonner html-to-image @iconify/react @fontsource/cormorant-garamond \
  @fontsource/jost @fontsource/playfair-display tailwindcss @tailwindcss/vite
npm install -D @vitejs/plugin-react vite vitest @types/react @types/react-dom
```

## 2. Recover the session auth, admin UI and public site

| Artifact                               | From (`main`)                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| Guest/session auth controllers         | `app/http/controllers/auth/front`, `auth/admin`                                       |
| Self-service (account/profile/prefs)   | `app/http/controllers/{account,profile,preferences}/front`                            |
| Admin Inertia controllers              | `app/http/controllers/{core,file,log,maintenance}/admin`                              |
| CMS Inertia controllers (admin + site) | `app/http/controllers/page/admin`, `page/front`, `template/admin`                     |
| Home + SEO controllers                 | `app/http/controllers/core/front`                                                     |
| Route modules                          | `start/routes/{front,core_public,cms_admin,cms_public,settings,admin,auth}.routes.ts` |

## 3. Restore the composition rewrites

The flavor rewrites several allowlisted composition files. Restore the `main`
version of each:

- `config/features.ts` — re-enables `auth`, `settings` and `admin` (the `api`
  flavor keeps only `adminApi` and `cms`; `admin` is off even though
  `/api/v1/admin` stays, because the flag gates the Inertia admin UI).
- `start/routes.ts` — re-registers the auth, settings, admin, CMS and public
  route modules.
- `config/cors.ts` — restores the default dev-origin policy (the `api` flavor
  rewrote it to read `CORS_ALLOWED_ORIGINS`).
- `start/asset_middleware.ts` — restores the Vite + Inertia server middleware.
- `start/env.ts` — restores the `CORS_ALLOWED_ORIGINS`-independent env set (the
  variable is harmless to keep; the `full` env template simply does not use it).
- `.env.example` — restores `AUTH_GUARD_WEB=true` / `AUTH_GUARD_API=false` so
  session login works again.
- `adonisrc.ts` — restores the Inertia/Vite providers, commands, preloads,
  `indexPages`, the Vite `buildStarting` hook, and `withSharedProps: true`.
- `package.json` — restores the front scripts (`test:front`, the Inertia
  typecheck reference) and the front deps listed in step 1.
- `tsconfig.json` — restores the `tsconfig.inertia.json` project reference and
  the `jsx` compiler option.
- `README.md` — restore the `full` README (or keep the flavor one).

## 4. Restore the pruned tests

| Artifact                        | From (`main`)                                                                                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Browser E2E suite               | `tests/browser`                                                                                                                          |
| Inertia-page functional suites  | `tests/functional/dashboard`, `tests/functional/maintenance`                                                                             |
| SEO endpoint suites             | `tests/functional/core/seo_endpoints.spec.ts`, `tests/functional/cms/seo_endpoints_cms.spec.ts`                                          |
| Inertia-page dashboard suite    | `tests/functional/cms/admin_dashboard_cms.spec.ts`                                                                                       |
| Full-router structure snapshots | `tests/integration/routes_structure.spec.ts`, `tests/integration/routes_structure_cms.spec.ts`                                           |
| Playwright-only test helpers    | `tests/helpers/browser/{login,visit_page,fill_field,field_is_filled,seed_dashboard,wait_for_builder_ready,wait_for_inertia_response}.ts` |

## 5. Regenerate the codegen

The flavor deletes `.adonisjs` (generated indexes). Restarting the dev server
regenerates it against the now-full source tree:

```bash
npm run dev
```

## Acceptance check

After the upgrade, run the full gate suite:

```bash
npm run lint && npm run format && npm run typecheck && npm run test:front
npm run test -- unit integration functional
```

The login page is back at `/login`, the admin at `/admin`, and the public site
renders pages again — while `/api/v1/*` keeps working.
