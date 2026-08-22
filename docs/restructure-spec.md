# Restructure specification

> **Status: locked.** Generated from the resolved tickets of
> [Map: monorepo + BFF restructure](https://github.com/NetAuraTech/adonisjs-foundry/issues/142)
> (all 13 tickets closed, no open fog). Each section cites the ticket that locked its
> decisions; the tickets hold the full discussion, this document is the consolidated
> hand-off.
>
> **The spec is the deliverable. Execution is a separate effort** — a fresh wayfinding
> map that starts from this document (see §8).

## 1. Destination and scope

The restructure mirrors an external reference project designated by the maintainer
(provided out-of-band; **per maintainer instruction it is not named or linked anywhere
in tracker or branch content**). Only the architecture carries over, not the reference's
stack: Foundry keeps React 19, Lucid, Inertia/React and npm.

In scope:

- Monorepo layout: `apps/web` + `packages/design-system` (§2)
- BFF split: `app/` = transport layer, `src/` = business layer, per-domain (§3)
- Design-system extraction (§4)
- CMS module prune-safety in the target layout (§5)
- Flavor prune pipeline adaptation to the monorepo (§6)
- Toolchain: oxlint + oxfmt, LF EOL, npm, mise (§7)
- Ordered migration plan with cumulative gates (§8)

Out of scope:

- **Executing the restructure itself** — a separate effort after this spec is locked.
- **Changing the flavor model** beyond prune adaptation — ADR-010 (branches as
  artifacts) stands.

Standing constraints:

- The app has **no production users**: a data wipe is permitted. The migration may
  rewrite the schema wholesale; no gate carries a data-preservation requirement.
- `main` CI stays green and the flavors stay regenerable **at every step** of the
  migration (§8 gates).
- A flavor remains a **strict subset of `main`** (ADR-010): deletions plus allowlisted
  rewrites only.

## 2. Monorepo layout

Source: [Monorepo layout: what moves where](https://github.com/NetAuraTech/adonisjs-foundry/issues/145),
[Research: AdonisJS app root move into apps/web](https://github.com/NetAuraTech/adonisjs-foundry/issues/146).

### 2.1 Stays at the repo root

| Entry                                                                                   | Note                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`, `CONTEXT.md`, `LICENSE`, `README.md`, `docs/`, `memory/`                   | repo-level docs and gitignored agent notes                                                                                                                                                                                                                                       |
| `.github/`                                                                              | CI; paths become workspace-aware (§6, §8)                                                                                                                                                                                                                                        |
| `tooling/`                                                                              | the prune pipeline operates on the whole repo                                                                                                                                                                                                                                    |
| `package.json`                                                                          | workspace root: `workspaces: ["apps/*", "packages/*"]`, npm `overrides` (root-only by npm design), `postinstall: "patch-package"`, the familiar script names as thin delegating wrappers (`npm run <script> -w @foundry/web`, `--workspaces` where several workspaces share one) |
| `patches/`                                                                              | root: npm installs once at the root, and the root `postinstall` is the one lifecycle that always fires                                                                                                                                                                           |
| `eslint.config.js`, `.prettierignore` → oxfmt config, `.editorconfig`, `.gitattributes` | repo-wide lint/format: one repo-wide config covering root + `apps/*` + `packages/*` + `tooling/` (path-scoped blocks)                                                                                                                                                            |
| `.gitignore`                                                                            | generic patterns (`node_modules`, `build`, `.env`, `public/assets`, `storage/*`) work unchanged under the workspaces                                                                                                                                                             |
| `Dockerfile`                                                                            | root; build context = whole repo; final stage moves to `WORKDIR /app/apps/web/build`                                                                                                                                                                                             |
| `docker-compose.yml`, `docker-compose.prod.yml`                                         | root: dev infra; prod stack keeps `build: .` (context = repo root). Root `docker:up` / `docker:stop` scripts operate on both                                                                                                                                                     |

### 2.2 Moves to `apps/web/` (app root, package `@foundry/web`)

The complete app tree:

- `app/` (transport layer), `src/` (business layer, per-domain per §3)
- `inertia/` — the React/Inertia tree, **name unchanged** (it is the Inertia app; avoids colliding with the glossary's Front term)
- `config/`, `database/`, `providers/`, `bin/`, `start/`, `commands/` (root-level ace commands — AdonisJS scans them relative to the app root)
- `tests/` — the Japa suite, `*.spec.ts` naming kept as-is (`unit/`, `functional/`, `integration/`, `fixtures/`)
- `public/`, `storage/`, `resources/` (`lang/{en,fr}` i18n + `views/emails`)
- `build/` (gitignored `node ace build` output)
- `.adonisjs/`, `ace.js`, `adonisrc.ts`
- `tsconfig.json`, `tsconfig.inertia.json`, `vite.config.ts`, `vitest.config.ts`
- `.env.example`, `.env.test` (`.env` stays gitignored)
- `package.json` — the real script definitions, the `imports` aliases, the `hotHook` boundaries and the dependency maps (all of which currently sit in the repo-root `package.json`)
- `AGENTS.md` — a per-app convention alongside the root one (created in PR 1)

### 2.3 New: `packages/design-system/`

Shape locked in §4.

### 2.4 Framework-anchoring facts

In AdonisJS v7 the app root is **not** `process.cwd()`: the `bin/` entries derive it
from their own file location (`new URL('../', import.meta.url)`) and every framework
subsystem — rc file loading, `.adonisjs/` codegen, config, env files, dev server,
bundler, test runner — anchors to that URL. Moving the app tree wholesale into
`apps/web/` is therefore **transparent to the framework**; the work sits outside the
app tree:

- workspace-delegated npm scripts; re-anchoring the root-anchored lint patterns and the prettier/oxfmt key
- Dockerfile rework: the deps stage copies workspace metadata, the build stage uses `npm run build --workspace=…`, `build/` no longer carries a usable lock file under workspaces
- CI path and script updates (`.env.test`, `.adonisjs/`, `inertia/`, `--workspace=`)
- one boundary-escaping alias: `#prune/* → ./tooling/prune/*.js` (used by `tooling/prune` and the app's prune tests)

Full facts and citations: `docs/research/adonis-app-root-move.md` on branch
[`research/adonis-app-root-move`](https://github.com/NetAuraTech/adonisjs-foundry/tree/research/adonis-app-root-move).

## 3. BFF split: `app/` transport, `src/` business

Sources: [Business layer organization](https://github.com/NetAuraTech/adonisjs-foundry/issues/143),
[Assign the scattered app/ layers across the BFF split](https://github.com/NetAuraTech/adonisjs-foundry/issues/147),
[Route organization](https://github.com/NetAuraTech/adonisjs-foundry/issues/148).

### 3.1 Domains

The 16 current action areas consolidate into **8 target domains**:

| Domain     | Content                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| `identity` | User, Role, Permission                                                   |
| `auth`     | login, register, social, password, invitation, email verification, Token |
| `account`  | self-service: account, profile, preferences                              |
| `file`     | File, FileFolder, FileAlt                                                |
| `log`      | Log Entry                                                                |
| `backup`   | Backup (no route file yet; business-only today)                          |
| `core`     | cross-cutting: dashboard, nav, sitemap, robots, health, maintenance      |
| `cms`      | Page + Template (prunable unit, ADR-0001)                                |

### 3.2 `src/` is per-domain co-location

One folder per domain. Per-layer organization (`src/services/<domain>/`, …) is
rejected: the current layer folders have already drifted (16 action areas vs 9 service
areas vs 5 repository areas, mismatched names), and per-domain co-location is the only
shape under which the prune pipeline's "if it dies with X, it lives in X" rule stays
mechanical (one domain = one prunable folder).

Each `src/<domain>/` contains any of the following subfolders, **created lazily**:

| Kind            | Content                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| `domain/`       | Pure domain objects: entities, identifiers, value objects                                                |
| `actions/`      | Write-side use cases                                                                                     |
| `queries/`      | Read-side query objects (adopted; the restructure refactors services and repositories to introduce them) |
| `repositories/` | Persistence                                                                                              |
| `services/`     | Domain services — business logic that belongs to neither actions nor queries; a first-class kind         |
| `models/`       | Lucid models (per-domain)                                                                                |
| `enums/`        | Domain enums                                                                                             |
| `types/`        | Domain types (lazily created; currently only `src/cms/types/`, §5)                                       |

### 3.3 Kernel and shared

- `src/core/` is the **kernel domain**: `domain/` holds the base classes (entity,
  identifier, value object); `contracts/` holds cross-cutting contracts (mail client,
  today's cache contract); `exceptions/` holds the kernel exceptions; `services/`
  holds the generic mail service (§3.5) plus `with_transaction` / `transaction_context`
  (today's `app/shared/`).
- Cross-domain services (e.g. the cache service) live in `src/shared/services/`.

### 3.4 Persistence and domain objects

- **Lucid is kept** as the single exception to the target shape: `models/` stays a
  per-domain layer kind; repositories/queries wrap Lucid models. No raw query builder,
  no schema-type codegen step.
- **Pure domain objects** (entities/identifiers/value objects built on the
  `src/core/domain/` base classes) are introduced in **every domain**; a complete
  data-layer restructure is in scope, and the data wipe permits a wholesale schema
  rewrite.

### 3.5 Layer assignments (the scattered `app/` layers)

- **Models** → `src/<domain>/models/` — `user`, `role`, `permission` to `identity`;
  `token` to `auth`; `log_entry` to `log`; `file`, `file_alt`, `file_folder` to
  `file`; `user_preference` to `account`. (CMS models already live under the CMS module.)
- **Validators** → per-domain under `app/<domain>/validators/`; the cross-domain ones
  (`maintenance`, `pagination`, `rest`, `rules`) go to `app/core/validators/`.
- **Events / listeners / mails: the chain is dissolved.** No event bus: actions call
  mail services directly. A **single generic mail service in the kernel `src/core/`**
  (generic over a type parameter `T`, the mail payload/variant; each call site passes
  the right `T`) depends on a mail-client contract in `src/core/contracts/`, bound on
  the app side to a wrapper around `@adonisjs/mail`. Edge templates remain in
  `resources/views/emails/`; the Mailable classes disappear; `BaseTokenListener`
  becomes a shared service of the auth domain.
- **`app/shared/`** → `src/core/` (`with_transaction`, `transaction_context`).
- **`app/types/`** stays a sibling of `app/` and `src/` at the app package root, alias
  `#types/*`, no split.
- **`app/exceptions/`** → per-domain under `src/<domain>/exceptions/` (plain-TS
  contracts thrown by actions): kernel ones (`base_http_exception`,
  `row_not_found_exception`, `slug_exists_exception`, `maintenance_exception`) to
  `src/core/exceptions/`; token/auth-flow ones (`invalid_token_exception`,
  `max_attempts_exceeded_exception`, the 8 `auth/*`) to `src/auth/exceptions/`; the
  Adonis `ExceptionHandler` to `app/core/exceptions/handler.ts`. (The reference
  project keeps exceptions in transport `app/core/exceptions/`; Foundry's per-domain
  placement under `src/` is a deliberate deviation.)
- **`app/helpers/` — dissolved, file by file** (no transit file):
  - to `src/core/`: `crypto`, `encryption`, `username` (pure utilities), `filter_routes`, `route_path`
  - to `src/auth/`: `oauth` (provider configuration; throws business exceptions)
  - to `src/cms/`: `preview_token` (page preview is CMS, ADR-0001)
  - to `app/core/`: `crsf` (session rotation), `load_user_role` (transformer preloads), `strip_empty_strings`, `extract_pagination` (transport-only consumers)
  - to `app/auth/`: `social_api_callback`, `api/error_response`
  - **deleted**: `pagination/get_pagination_params` (zero consumers)
- **`i18n_payloads/`** → per-domain `app/<domain>/i18n_payloads/`: identity 7, auth 5,
  account 4, file 3, log 1, core 5, cms 11 (36 files).
- **`app/data/transformers/`** → the transport side of the CMS unit, `app/cms/`,
  Page/Template nested per layer kind, mirroring `src/cms/`.

### 3.6 Target trees

`app/` — `app/http/` disappears as a layer; everything dissolves per-domain:

```
app/
  <domain>/            # identity, auth, account, file, log, backup, core
    routes.ts          # §3.7
    controllers/{admin,front,api}/
    transformers/
    validators/
    i18n_payloads/
    rest/              # per-domain REST resource declarations
    middleware/        # where domain-specific: auth (session auth), identity (permission/role)
  core/
    exceptions/handler.ts
    middleware/        # inertia, maintenance, container_bindings, detect_user_locale
    validators/        # pagination, rest, rules, maintenance
    i18n_payloads/     # common, dashboard, home, nest, maintenance_index
    rest/              # rest_adapter + page_adapter (shared)
    small shared helpers: csrf, load_user_role, strip_empty_strings, pagination extraction
  cms/                 # CMS transport unit (mirrors src/cms/, §5)
```

`src/`:

```
src/
  core/
    domain/            # base classes: entity, identifier, value object
    contracts/         # mail-client contract, cache contract
    exceptions/        # kernel exceptions
    services/          # generic mail service, with_transaction, transaction_context
  shared/
    services/          # cross-domain services (cache)
  <domain>/            # identity, auth, account, file, log, backup
    {domain,actions,queries,repositories,services,models,enums}/   # created lazily
  cms/                 # single prunable unit (§5); page/template nest per layer kind
    types/             # CMS types (a lazily-created layer kind)
    ...
```

### 3.7 Routes

- **One route file per domain**, `app/<domain>/routes.ts`, carrying the domain's
  front, admin, and api groups. A top-level `app/admin/` layout was **rejected**:
  Foundry's flavor constraint (ADR-0001) requires the CMS to stay a single prunable
  unit on the transport side (`app/cms/` = one directory deletion); a top-level
  `app/admin/` would split CMS transport into two deletions.
- **Home lives in core** in every flavor: `app/core/routes.ts` registers `GET /`
  once, named `core.home.render`. Today the live `GET /` on `main` is the CMS
  `page.home` route, while the hand-written home (`start/routes/front.routes.ts`) is
  dead on `main` and only registered in the `inertia` flavor by the prune manifest —
  in the target both collapse into the single core home route, and the CMS unit
  keeps contact + page rendering but not the home route.
- **`start/routes.ts`** is a pure per-domain import list (`#app/<domain>/routes` in a
  stable order) keeping the Foundry-specific machinery: `features.*` gating at the
  registration site, the maintenance wrapper group, and health registered outside the
  wrapper. **Health stays a standalone file in `start/`** (`start/health.ts`),
  registered before the wrapper. (The reference keeps its `/healthz` route in
  `app/core/routes.ts`; Foundry's standalone placement is a deliberate deviation.)
- **Middlewares and guards: relocated, unchanged.** Admin group:
  `.prefix('admin').as('admin').use([auth web])` + per-resource permission
  middleware. API groups: token guard (`api`) + throttle; the admin REST surface stays
  shared between web and api guards. `features.*` flags stay the registration gate
  (runtime + prune surface).

Legacy file mapping (11 files → 8 domains + standalone health):

| Current file                                                              | Target                                                  |
| ------------------------------------------------------------------------- | ------------------------------------------------------- |
| `front.routes.ts` (hand-written home)                                     | `app/core/routes.ts` (front group) — home lives in core |
| `core_public.routes.ts` (sitemap, robots)                                 | `app/core/routes.ts` (front group)                      |
| `health.routes.ts`                                                        | standalone in `start/`                                  |
| `auth.routes.ts`                                                          | `app/auth/routes.ts` (front group)                      |
| `settings.routes.ts` (profile, account, preferences)                      | `app/account/routes.ts` (front group)                   |
| `admin.routes.ts` → dashboard, maintenance                                | `app/core/routes.ts` (admin group)                      |
| `admin.routes.ts` → users, roles, permissions                             | `app/identity/routes.ts` (admin group)                  |
| `admin.routes.ts` → files, folders                                        | `app/file/routes.ts` (admin group)                      |
| `admin.routes.ts` → logs                                                  | `app/log/routes.ts` (admin group)                       |
| `cms_admin.routes.ts`                                                     | `app/cms/routes.ts` (admin group)                       |
| `cms_public.routes.ts` (contact, page rendering; home absorbed into core) | `app/cms/routes.ts` (front group)                       |
| `cms_rest_api.routes.ts`                                                  | `app/cms/routes.ts` (api group)                         |
| `admin_rest_api.routes.ts` → dashboard, maintenance                       | `app/core/routes.ts` (api group)                        |
| `admin_rest_api.routes.ts` → users, roles, permissions                    | `app/identity/routes.ts` (api group)                    |
| `admin_rest_api.routes.ts` → files, folders                               | `app/file/routes.ts` (api group)                        |
| `admin_rest_api.routes.ts` → logs                                         | `app/log/routes.ts` (api group)                         |
| `admin_rest_api.routes.ts` → profile, preferences/theme                   | `app/account/routes.ts` (api group)                     |
| `api.routes.ts` (token auth) → auth                                       | `app/auth/routes.ts` (api group)                        |
| `api.routes.ts` (token auth) → profile, account                           | `app/account/routes.ts` (api group)                     |
| (backup has no routes today)                                              | no route file; one is created if a first route appears  |

**Route naming.** Convention: `<domain>.<resource>.<intent>`. The admin group keeps
`.prefix('admin').as('admin')` producing `admin.<domain>.…`; the api groups keep the
`api.v1` group name. **URLs are frozen** — `/api/v1/…` is a versioned contract and no
URL changes in the migration. Route names are internal (frontend `route()` /
`urlFor()`, server `toRoute()`); the complete old→new name table is **Appendix B** —
every existing `route()` / `urlFor()` / `toRoute()` call site is rewritten against it.

### 3.8 Import aliases and layering rule

- One alias per domain: `#<domain>/* → src/<domain>/*` (the existing `#cms/*` pattern
  generalized), `#app/<domain>/* → app/<domain>/*` for transport code, `#core/* →
src/core/*`, `#types/* → types/*`, `#shared/*` kept. The four layer aliases
  (`#services/*`, `#actions/*`, `#repositories/*`, `#models/*`) are dropped.
- **`src/` never imports `app/`**; transport code may import business code.
- The layering rule is **lint-enforced** by a path-scoped `no-restricted-imports`
  override in the repo-wide linter config (the reference project's exact mechanism).

## 4. Design-system package

Sources: [Design-system boundary](https://github.com/NetAuraTech/adonisjs-foundry/issues/144),
[Design-system package shape](https://github.com/NetAuraTech/adonisjs-foundry/issues/149).

### 4.1 The boundary (two-facet test)

1. **Mechanical (lint-enforceable)**: package code must not import app code — neither
   at runtime nor as types. No codegen (`@generated/*`), no backend self-references
   (`#types/*`, `#helpers/*`, `#start/*`), no Inertia shared props, no hardcoded app
   API endpoints, no app i18n keys. Transitive coupling counts. Enforced by a root
   ESLint/oxlint `no-restricted-imports` rule scoped to `packages/design-system/**`.
2. **Semantic**: design primitives belong in the package; Foundry product screens
   (pages, page-level templates, CRUD screens) belong to the app.

### 4.2 Assignment

**Package — atoms**: button, nav_link (both re-exposed with an `href`-based API
instead of typed `route=`), input, modal, card, icon, heading, label, select,
select_option, checkbox, textarea, badge, section, separator, floating_portal,
paragraph, table/*, avatar (takes a `user` prop), user_status (takes status +
resolved-string props).

**Package — molecules**: banner, field (with an extension point for the `image` type —
the app injects the ImagePicker control), auth_intro, pagination (plain
`activePage`/`count` props + `pageChange` event), image_picker (data injected via a
query function; the app wraps the admin files endpoint).

**Package — organisms**: header (`appName` prop), footer (`appName` + children),
admin_header, admin_sidebar (menu injected), admin_main.

**Package — CSS**: the canonical `@theme` + custom variants + `@utility` + font
loading, as `src/css/app.css`.

**Package — types**: presentation tokens only (`FontSize`, `ParagraphVariants`,
`ParagraphSpacing`) — the backend consumes them via `import type`.

**App keeps**:

- atoms: file_upload_input, file_image (app file-domain types)
- molecules: theme_toggle (preferences API), auth_providers (auth)
- organisms: settings_layout (page template), file_manager, file_alt_editor (files-domain screens)
- everything under `guards/`, `hooks/` (use_auth, use_admin, use_theme,
  use_form_validation, use_interval, use_is_large, use_scroll_reveal), `helpers/`,
  `lib/`, `utils/`
- `components/cms/`, `components/dashboard_sections/`, `layouts/`, `pages/`,
  `types/` (Paginated/MetaData), `app.tsx`, `ssr.tsx`, `client.ts`, `types.ts`
- app CSS: `inertia/css/app.css`

**Components are 100% props/children**: no hooks, no lib/utils/helpers, no i18n
machinery, no `fetch` inside the package. The app injects user, `appName`, menu
entries (hrefs built with the typed `urlFor()`), resolved strings (the app resolves
via its `useTranslation` hook), and query functions for data-driven primitives.
Extending a component = composing it, not patching it.

### 4.3 Package shape

- **Name**: `@foundry/design-system` — private, scoped, consistent with the app
  package `@foundry/web`.
- **Source-only, no build**: no `dist/`; `package.json` `exports` maps one subpath per
  public component (`./button → ./src/atoms/button/button.tsx`, …) plus `./tokens`.
  The exports map is the public API; one folder per component, private children inside
  the owning folder.
- **Tailwind v4 (copy & extend)**: the canonical CSS entry lives in the package at
  `src/css/app.css` and is the copy Storybook imports. The app keeps a full copy at
  `apps/web/inertia/css/app.css` as the **theme-override surface** (editing the app's
  copy is the override mechanism; the app never `@import`s the package CSS) and adds
  an `@source` pointing at the package's `src` through the **real path** (not the
  `node_modules` symlink) so Tailwind detects the classes used inside package
  components. App-only annexes (e.g. the class safelist) stay in the app copy.
- **Consumption**: workspace dependency only, no Vite alias —
  `"@foundry/design-system": "*"` in `apps/web/package.json` (npm has no
  `workspace:` protocol); Vite resolves the linked package as source. React 19 is a
  `peerDependency` of the package (plus `devDependency` for Storybook/typecheck) so
  npm hoists a single copy. The app tsconfig keeps including only its own files;
  package types resolve through `exports` under `moduleResolution: bundler`.
- **Styling primitive**: `tailwind-variants` is the canonical component-styling
  primitive of the package — one `tv()` per component (`base` + `variants` +
  `defaultVariants`), `VariantProps<typeof x>` for typed props, built-in `twMerge`
  for `className` overrides from the app. A `dependencies` entry of the package. App
  components may adopt the same idiom (migration note, not a boundary rule).
- **`api` flavor interaction**: the `api` manifest adds `packages/design-system` to
  `delete`. The root `workspaces: ["apps/*", "packages/*"]` field is flavor-invariant
  (an npm glob that matches nothing is valid); the `api` flavor's
  `apps/web/package.json` rewrite drops the `@foundry/design-system` dependency
  (prune-engine workspace-level dependency pruning, §6).
- **Scripts / CI**: each workspace owns a `typecheck` script; the root `typecheck`
  fans out (`npm run typecheck --workspaces --if-present`), the app keeping its double
  typecheck (app + inertia). The package is **typecheck-only in CI**; Storybook is a
  local/dev tool; no test runner in the package (Storybook + typecheck only).
- **Zero-app-import boundary: double gate** — (1) mechanical: the package's own
  tsconfig/Vite cannot resolve the app's `#*` aliases, so an escaping import fails
  typecheck/build; (2) lint: a repo-wide override scoped to
  `packages/design-system/**` with `no-restricted-imports` (the app `#*` aliases +
  relative escapes toward `apps/`) for a fast, readable failure.

### 4.4 Downstream migration work (PR 3)

- Migrate 100+ `route=`/`routeParams=`/`qs=` call sites to `href={urlFor(...)}`
  (type safety stays at the call site — `urlFor` is typed by the codegen registry).
- Refactor package-bound components to data injection (avatar, user_status, header,
  footer, admin_sidebar, image_picker, pagination, button, nav_link, field).
- Split `app.css` into canonical blocks (→ package) and app layers (→ app).
- Relocate presentation types out of `app/types/`.
- Field `image` extension point.
- The `no-restricted-imports` boundary rule on the package.

## 5. CMS module: prunable units

Source: [CMS module prune-safety in the target layout](https://github.com/NetAuraTech/adonisjs-foundry/issues/150).

ADR-0001's rule — "if it dies when the CMS dies, it lives in one prunable unit" —
holds in the target layout as **17 entries, each exactly one directory or file
deletion** (vs ~35–45 today):

| Unit                   | Target path (under `apps/web/`)                  | Deletion                 |
| ---------------------- | ------------------------------------------------ | ------------------------ |
| Business layer         | `src/cms/`                                       | 1 directory              |
| Transport layer        | `app/cms/`                                       | 1 directory              |
| Migrations             | `database/migrations/cms/`                       | 1 directory              |
| Seeders                | `database/seeders/cms/`                          | 1 directory (new)        |
| Factories              | `database/factories/cms/`                        | 1 directory (new)        |
| i18n (en)              | `resources/lang/en/cms/`                         | 1 directory (new)        |
| i18n (fr)              | `resources/lang/fr/cms/`                         | 1 directory (new)        |
| Frontend pages         | `inertia/pages/cms/`                             | 1 directory              |
| Frontend components    | `inertia/components/cms/`                        | 1 directory              |
| Tests (unit)           | `tests/unit/cms/`                                | 1 directory (new layout) |
| Tests (integration)    | `tests/integration/cms/`                         | 1 directory (new layout) |
| Tests (functional)     | `tests/functional/cms/`                          | 1 directory (new layout) |
| CMS config             | `config/cms.ts`                                  | 1 file                   |
| Transmit config        | `config/transmit.ts`                             | 1 file                   |
| Transmit boot          | `start/transmit.ts`                              | 1 file                   |
| Ace command            | `commands/cms_normalize_migration_names.ts`      | 1 file                   |
| Contact email template | `resources/views/emails/contact_form_email.edge` | 1 file                   |

Decisions:

- **i18n namespaces**: `resources/lang/{en,fr}/cms/{page,template,builder}.json`
  (from six flat files). The `@adonisjs/i18n` FsLoader natively supports nested
  directories, so raw keys gain a prefix: `page.* → cms.page.*`, `template.* →
cms.template.*`, `builder.* → cms.builder.*`. Mechanical, confined to raw-key use
  sites; the frontend only consumes server-built payloads. Orphaned CMS strings in
  shared namespaces (`exceptions.json`, `permissions.json`) remain, as today — shared
  files are never rewritten by manifests.
- **Seeders**: `page_seeder.ts` + `template_seeder.ts` consolidate into
  `database/seeders/cms/` (Lucid scans `database/seeders` recursively).
- **Factories**: all factories unify under `database/factories/<domain>/`
  (`identity/`, `file/`, `log/`, `cms/`), mirroring the migrations layout. Factories
  are database-adjacent code, not business code; the move is a mechanical import
  rewrite (aliases `#factories/*`, `#cms/factories/*`).
- **Test tree**: restructures from `tests/<suite>/<kind>/<domain>` to
  `tests/<suite>/<domain>/<kind>` (per-domain co-location). CMS tests collapse to
  three directory deletions (one per suite). The CMS-only helper
  `tests/helpers/seed_dashboard.ts` moves into the CMS test tree; shared DB-seeding
  helpers stay in `tests/helpers/`. `routes_structure_cms.spec.ts` lands in
  `tests/integration/cms/`.
- **CMS types**: `app/cms/types/` (page, template, builder, dashboard) moves to
  `src/cms/types/` — these types die with the CMS, so they live in the prunable unit;
  the `#cms/types/*` alias the frontend already uses is preserved.
- **Confirmed as-is**: `src/cms/` + `app/cms/` (controllers, transformers, validators,
  i18n payloads, rest, routes.ts inside `app/cms/`; preview-token helper and CMS
  exceptions inside `src/cms/`); `database/migrations/cms/`; `inertia/pages/cms/` +
  `inertia/components/cms/`; `inertia/lib/dashboard_sections.ts` is prune-safe by
  design (glob registry — a pruned flavor registers no CMS cards); `config/cms.ts`,
  `config/transmit.ts`, `start/transmit.ts` (config files must live in `config/` by
  framework convention; `adonisrc.ts` is rewritten per flavor anyway).

## 6. Flavor prune pipeline adaptation

Source: [Flavor prune pipeline adaptation to the monorepo](https://github.com/NetAuraTech/adonisjs-foundry/issues/151).

The engine stays **path-based and mechanical** — no workspace awareness. The monorepo
re-anchors everything that was repo-root-relative to its new location, with three
targeted generalizations.

### 6.1 Engine (`tooling/prune/`)

- `delete` and `rewrite` remain literal repo-root-relative paths; the `api` flavor
  simply adds `packages/design-system` to its delete list.
- `dependencies` gains per-`package.json` targeting: an array of
  `{ file?: string, packages: string[] }` (default `file` = root `package.json`).
  Needed by the `inertia` flavor, which prunes `@adonisjs/transmit` and
  `@adonisjs/transmit-client` from `apps/web/package.json`.
- The drift seam is generalized: every rewritten `package.json` is compared against
  the main file **at the same path** (version + all dependency ranges).

### 6.2 REWRITE_ALLOWLIST (target layout)

```
package.json
README.md
apps/web/AGENTS.md
apps/web/adonisrc.ts
apps/web/.env.example
apps/web/package.json
apps/web/tsconfig.json
apps/web/config/{features,database,shield,cors}.ts
apps/web/start/{routes,events,nav,dashboard,container,transmit,sitemap,permissions,asset_middleware,env}.ts
```

Excluded on purpose: `.github/workflows/*` (flavor branches run no CI — the copies
stay inert), `vite.config.ts`/`vitest.config.ts` (deleted by `api`, kept by `inertia`
— never rewritten), lint configs (overrides scoped to a removed directory simply match
nothing), no root `tsconfig.json` (typecheck is an npm fan-out, not `tsc -b`), and
nothing under `packages/design-system` (deleted whole by `api`, kept verbatim by
`inertia`).

### 6.3 Manifests

- **`api`**: full rewrites of the root `package.json` (keeps the `workspaces` glob,
  root scripts, and `postinstall` + `patch-package`; drops `#prune/*`,
  `@poppinss/ts-exec`, and `overrides` — the `$@adonisjs/inertia` self-reference
  dangles once no workspace declares it) and of `apps/web/package.json` (drops
  `test:front`, the Inertia half of `typecheck`, the `#cms/*` alias, and the
  frontend/CMS dependency stacks). Delete list = the current api entries re-anchored
  under `apps/web/`, plus `packages/design-system`, `tooling/prune`, and the prune
  tests at their new home.
- **`inertia`**: delete list = the 17 CMS units of §5 re-anchored under `apps/web/`;
  rewrites re-anchored; `dependencies` prunes transmit from `apps/web/package.json`.
  No root-level change.

### 6.4 CI cascade (`flavor-prune.yml`)

Same five stages, re-anchored:

1. `npm ci` at the root (pre-prune).
2. Apply the manifest.
3. `npm ci` at the root (post-prune) — **no lockfile regeneration step**: flavor
   branches keep main's superset lockfile, and `npm ci` tolerates stale workspace
   entries (a workspace directory listed in the lockfile but deleted from the tree is
   not installed and leaves no broken link — the same superset pattern the `api`
   branch already ships today).
4. Codegen: `cp apps/web/.env.test apps/web/.env`, then `node ace codegen` in the app
   workspace, run in the background and **watched on the command's own completion
   marker** (`Codegen files generated`), with the process killed once the marker
   appears (the warmup app keeps the event loop alive; the poll cap remains only as a
   CI safety net). Verified: the command regenerates the whole `.adonisjs` tree —
   assembler indexes **and** the Tuyau registry — content-identical to what the
   dev-server boot produced. **Main's `ci.yml` codegen-drift job adopts the same
   `ace codegen` invocation.**
5. Per-flavor gates: typecheck as a root fan-out (`--workspaces --if-present`),
   lint/format at the root, `test:front` delegated with `--if-present` (the script is
   absent from the pruned app's `package.json`), backend tests in the app workspace.
   Commit + force-push unchanged.

### 6.5 Tests & docs

- Prune engine tests move with the Japa seam to `apps/web/tests/unit/prune/`
  (deleted by both flavors, as today); the drift test resolves the repo root relative
  to its own file location instead of `process.cwd()`.
- `apps/web/AGENTS.md` joins the allowlist: the `api` flavor rewrites a headless
  variant, exactly as it already does for `README.md`. `packages/design-system/AGENTS.md`
  is never rewritten (the package is deleted whole or kept verbatim).
- `docs/flavors/{api,inertia}/upgrade-to-full.md`: mechanism unchanged (hand-written
  inverse of each manifest; `docs/` survives every flavor), content re-anchored to the
  monorepo paths — the `api` upgrade doc also covers re-adding
  `packages/design-system/` and the workspace install.

**Constraint preserved:** a flavor remains a strict subset of `main` (ADR-010).

## 7. Toolchain

Sources: [Research: oxfmt/oxlint, Yarn 4 and mise](https://github.com/NetAuraTech/adonisjs-foundry/issues/158)
(facts: `docs/research/tooling-comparison.md` on branch
[`research/tooling-comparison`](https://github.com/NetAuraTech/adonisjs-foundry/tree/research/tooling-comparison)),
[Toolchain selection](https://github.com/NetAuraTech/adonisjs-foundry/issues/159) (decision).

1. **Lint/format: full switch to oxlint + oxfmt.** ESLint 10 and Prettier 3 leave
   devDependencies (~85×/9× faster on the foundry code).
   - `naming-convention`, `max-len`, `unicorn/no-for-loop` dropped — no oxlint
     equivalent.
   - The three surviving behavioral `@adonisjs/eslint-plugin` rules
     (`prefer-lazy-controller-import`, `prefer-adonisjs-inertia-link`,
     `prefer-adonisjs-inertia-form`) dropped — conveniences with no oxlint expression.
     `prefer-lazy-listener-import` is moot under the direct-mail-services decision.
   - `no-backend-import-in-frontend` re-expressed as a path-scoped
     `no-restricted-imports` override on `inertia/**` (static alias list from the
     frozen alias map) — the reference project's exact mechanism; it carries both the
     §3.8 layering rule and the §4.1 package boundary.
   - `consistent-type-imports` dropped: the non-type-aware oxlint version
     false-positives on `inject(Class)` value usage; the type-aware path
     (`oxlint-tsgolint`, native binary) is recorded as a follow-up option, not part
     of this switch. Inline-type-imports remains a review convention.
   - React linting enabled via the oxlint React plugin (`react-hooks` among them) —
     Foundry runs no React lint today.
   - One-time reformat of ~101 files (~10 % of the repo), overlapping with the EOL
     normalization below.
2. **EOL policy: LF everywhere** — forced by oxfmt (no `endOfLine: auto`): keep
   `.gitattributes * text=auto`, document `core.autocrlf=false` in the README,
   one-time normalization of the 96 working-tree files. Closes the current
   inconsistency where `lint:ci` passes and `format:ci` fails on the same tree.
3. **Package manager: npm confirmed.** The Yarn 4 facts (no npm lockfile importer →
   fresh-resolution drift across ~60 ranges; corepack removed from Node 25+; repo-wide
   CI/Docker/prune-pipeline rewrite) do not justify overriding the standing decision;
   catalog/`workspaces focus` gains are modest at two workspaces.
4. **mise: add `mise.toml` pinning `node = "24"`** (the CI major). Local only: CI keeps
   `actions/setup-node` on 24; `engines.node >=24` stays as the floor for non-mise
   users.

## 8. Migration plan and gates

Source: [Migration order and gates (spec core)](https://github.com/NetAuraTech/adonisjs-foundry/issues/152).

### 8.1 Order of the big moves

**Monorepo first, then BFF, then design-system.** The app-root move is
framework-transparent (§2.4), so it is the most mechanical change and is done first;
the BFF reorg is the most semantic change and operates on the final structure; the
design-system extraction is orthogonal (disjoint files) and additive on a stable
backend.

**Three PRs**, each atomic and squash-merged to a single commit so a revert is
trivial:

1. **PR 1 — Monorepo**: `git mv` the app to `apps/web/` + root adaptations +
   prune-pipeline adaptation (the flavor-prune adaptation is in the _same_ PR so the
   flavors regenerate green from the first commit).
2. **PR 2 — BFF reorg**: in place, inside `apps/web/`.
3. **PR 3 — Design-system extraction**: create `packages/design-system/`, migrate
   components, lint boundary rule.

### 8.2 PR 1 — Monorepo: internal steps

1. `git mv` the complete app tree to `apps/web/` (§2.2 entry list).
2. Root `package.json`: add `workspaces: ["apps/*", "packages/*"]`; delegate
   app-level scripts to the workspace (`npm run --workspace`).
3. Re-anchor repo-wide lint patterns (`app/`, `inertia/`, … → `apps/web/app/`,
   `apps/web/inertia/`, …).
4. Re-anchor the formatter config key if path-based.
5. Dockerfile rework: `WORKDIR /app/apps/web`, build context = repo, `build/` no
   longer self-contained.
6. CI path and script updates (`.env.test`, `.adonisjs/`, `inertia/`, `--workspace=`);
   the `ci.yml` codegen-drift job adopts `node ace codegen` watched on its completion
   marker (§6.4 stage 4).
7. One boundary-escaping alias: `#prune/* → ./tooling/prune/*.js`.
8. Prune-pipeline adaptation (REWRITE_ALLOWLIST re-anchored, CI cascade, drift seam)
   — §6.
9. Docs: root AGENTS.md re-anchored, `apps/web/AGENTS.md` created, CONTEXT.md updated.

The `git mv` is the first commit; the adaptations follow. The root
`package-lock.json` is regenerated by a root `npm install` in the PR (workspaces make
it the single lockfile).

### 8.3 PR 2 — BFF reorg: the semantic core

The full mapping of the 16 action areas to the 8 domains and the target `app/`/`src/`
trees are locked in §3 (not restated). Refinements:

- **Helpers**: dissolved directly, file by file, in the same PR — no transit file.
- **Mail service**: a single generic mail service in the kernel `src/core/`, generic
  over a type parameter `T` (the mail payload/variant); each call site passes the
  right `T`. The mail-client contract stays in `src/core/contracts/`, bound on the
  app side to a wrapper around `@adonisjs/mail`. The events/listeners/mails chain is
  dissolved (no event bus); actions call the core mail service directly.
- **Route names**: rewritten per the Appendix B table; URLs frozen.

### 8.4 PR 3 — Design-system extraction

The component list (package vs app) is locked in §4 (not restated). Storybook is a
devDependency of the package, local-only, no root script, no CI. The
`no-restricted-imports` boundary rule on `packages/design-system/**` is defined in
this PR.

### 8.5 Gates

Cumulative — after **each** merge, `main` passes _all_ gates (with 0 users the prod
risk is nil and a fix-up PR is an acceptable rollback, but the gates stay as the
repo's contract):

- `npm run lint` (root, re-anchored patterns)
- `npm run typecheck` (fan-out to workspaces; PR 3 adds the package's typecheck)
- `npm run test:back` (Japa) and `npm run test:front` (Vitest)
- Codegen drift: `node ace codegen` idempotent (`.adonisjs/` content-identical)
- Flavor regeneration: `inertia` and `api` branches regenerate green
- App boots (`node ace serve` in `apps/web/`)
- Frontend builds (`vite build` in `apps/web/`)

PR 3 additionally: the `api` flavor deletes `packages/design-system` (drift seam
handles the package removal).

### 8.6 Conventions-docs sync

Each PR updates the docs it impacts (no separate docs PR):

- PR 1 re-anchors the root docs and creates the per-app `AGENTS.md`.
- PR 2 updates `docs/agents/domain-services.md`, `domain-repositories.md`,
  `models.md` (the `src/<domain>/` shape changes).
- PR 3 updates the design-system documentation.

### 8.7 Hand-off

This map resolved to a locked set of decisions; this document is their consolidated
form. The execution effort is a **fresh wayfinding effort** (its own map) that starts
from this spec and opens the execution tickets.

## Appendix A — Research pointers

| Branch                                                                                                                    | Findings doc                              | What it establishes                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`research/adonis-app-root-move`](https://github.com/NetAuraTech/adonisjs-foundry/tree/research/adonis-app-root-move)     | `docs/research/adonis-app-root-move.md`   | The app root is derived from the `bin/` entries' file location, never `process.cwd()`; the move is framework-transparent; the real work sits outside the app tree (§2.4)                                                                      |
| [`research/reference-architecture`](https://github.com/NetAuraTech/adonisjs-foundry/tree/research/reference-architecture) | `docs/research/reference-architecture.md` | The maintainer-designated reference project's architecture (not named, per instruction) validates the locked decisions strongly; two flags — exceptions placement and health route placement — are deliberate Foundry deviations (§3.5, §3.7) |
| [`research/tooling-comparison`](https://github.com/NetAuraTech/adonisjs-foundry/tree/research/tooling-comparison)         | `docs/research/tooling-comparison.md`     | Empirical oxlint/oxfmt vs ESLint/Prettier runs on the foundry code; Yarn 4 vs npm facts; mise assessment; the Windows CRLF root cause and the LF-everywhere fix (§7)                                                                          |

## Appendix B — Route names: old → new

The complete mapping of every existing route name (the `ALL` registry of
`.adonisjs/server/routes.d.ts` before the migration, plus `front.home`, the `inertia`
flavor's home name — its route file is not registered on `main`) to its target name
under the §3.7 convention. Group prefixes are kept verbatim (`admin.`, `api.v1.`,
`api.v1.admin.`); the target domain is inserted after the prefix; the resource and
intent segments are kept as-is, except the locked rename families (`settings.* →
account.*`, `front.home → core.*`) and the REST API group, where the controller-class
artifacts of the current auto-generated names (`*_api`) collapse to the URL resource.
Every `route()` / `urlFor()` / `toRoute()` call site is rewritten against this table.

### Framework and health (unchanged)

| Old name           | New name  |
| ------------------ | --------- |
| `drive.fs.serve`   | unchanged |
| `event_stream`     | unchanged |
| `subscribe`        | unchanged |
| `unsubscribe`      | unchanged |
| `health.liveness`  | unchanged |
| `health.readiness` | unchanged |

### Core front (`front.routes.ts` + `core_public.routes.ts` → `app/core/routes.ts`)

| Old name                                        | New name            |
| ----------------------------------------------- | ------------------- |
| `front.home` (the `inertia` flavor's home name) | `core.home.render`  |
| `sitemap.show`                                  | `core.sitemap.show` |
| `robots.show`                                   | `core.robots.show`  |

### Auth front (`auth.routes.ts` → `app/auth/routes.ts`) — unchanged

Already `auth.<resource>.<intent>`: `auth.session.render`, `auth.session.execute`,
`auth.register.render`, `auth.register.execute`, `auth.forgot_password.render`,
`auth.forgot_password.execute`, `auth.reset_password.render`, `auth.reset_password.execute`,
`auth.accept_invitation.render`, `auth.accept_invitation.execute`, `auth.session.destroy`,
`auth.email_verification.execute`, `auth.social.render`, `auth.social.execute`,
`auth.social.redirect`, `auth.social.callback`, `auth.social.unlink` — all **unchanged**.

### Account front (`settings.routes.ts` → `app/account/routes.ts`)

| Old name                        | New name                       |
| ------------------------------- | ------------------------------ |
| `settings.profile.render`       | `account.profile.render`       |
| `settings.profile.execute`      | `account.profile.execute`      |
| `settings.account.render`       | `account.account.render`       |
| `settings.account.execute`      | `account.account.execute`      |
| `settings.account.destroy`      | `account.account.destroy`      |
| `settings.email_change.render`  | `account.email_change.render`  |
| `settings.email_change.execute` | `account.email_change.execute` |
| `settings.preferences.render`   | `account.preferences.render`   |
| `settings.preferences.execute`  | `account.preferences.execute`  |
| `settings.index`                | `account.index`                |

### Admin web — core (`admin.routes.ts` → `app/core/routes.ts`)

| Old name                            | New name                        |
| ----------------------------------- | ------------------------------- |
| `admin.dashboard.render`            | `admin.core.dashboard.render`   |
| `admin.settings.maintenance.render` | `admin.core.maintenance.render` |
| `admin.settings.maintenance.update` | `admin.core.maintenance.update` |
| `admin.settings.maintenance.toggle` | `admin.core.maintenance.toggle` |

### Admin web — identity (`admin.routes.ts` → `app/identity/routes.ts`)

| Old name                           | New name                                    |
| ---------------------------------- | ------------------------------------------- |
| `admin.users.render`               | `admin.identity.users.render`               |
| `admin.users_create.render`        | `admin.identity.users_create.render`        |
| `admin.users_create.execute`       | `admin.identity.users_create.execute`       |
| `admin.users.destroy`              | `admin.identity.users.destroy`              |
| `admin.users_show.render`          | `admin.identity.users_show.render`          |
| `admin.users_update.render`        | `admin.identity.users_update.render`        |
| `admin.users_update.execute`       | `admin.identity.users_update.execute`       |
| `admin.roles.render`               | `admin.identity.roles.render`               |
| `admin.roles_create.render`        | `admin.identity.roles_create.render`        |
| `admin.roles_create.execute`       | `admin.identity.roles_create.execute`       |
| `admin.roles.destroy`              | `admin.identity.roles.destroy`              |
| `admin.roles_show.render`          | `admin.identity.roles_show.render`          |
| `admin.roles_update.render`        | `admin.identity.roles_update.render`        |
| `admin.roles_update.execute`       | `admin.identity.roles_update.execute`       |
| `admin.permissions.render`         | `admin.identity.permissions.render`         |
| `admin.permissions_create.render`  | `admin.identity.permissions_create.render`  |
| `admin.permissions_create.execute` | `admin.identity.permissions_create.execute` |
| `admin.permissions.destroy`        | `admin.identity.permissions.destroy`        |
| `admin.permissions_update.render`  | `admin.identity.permissions_update.render`  |
| `admin.permissions_update.execute` | `admin.identity.permissions_update.execute` |

### Admin web — file (`admin.routes.ts` → `app/file/routes.ts`)

| Old name                     | New name                          |
| ---------------------------- | --------------------------------- |
| `admin.files.render`         | `admin.file.files.render`         |
| `admin.files.upload`         | `admin.file.files.upload`         |
| `admin.files.move`           | `admin.file.files.move`           |
| `admin.files.destroy`        | `admin.file.files.destroy`        |
| `admin.files.upsert_alt`     | `admin.file.files.upsert_alt`     |
| `admin.files.delete_alt`     | `admin.file.files.delete_alt`     |
| `admin.file_folders.render`  | `admin.file.file_folders.render`  |
| `admin.file_folders.execute` | `admin.file.file_folders.execute` |
| `admin.file_folders.update`  | `admin.file.file_folders.update`  |
| `admin.file_folders.destroy` | `admin.file.file_folders.destroy` |

### Admin web — log (`admin.routes.ts` → `app/log/routes.ts`)

| Old name            | New name                |
| ------------------- | ----------------------- |
| `admin.logs.render` | `admin.log.logs.render` |

### Admin web — cms (`cms_admin.routes.ts` → `app/cms/routes.ts`)

| Old name                           | New name                               |
| ---------------------------------- | -------------------------------------- |
| `admin.pages.render`               | `admin.cms.pages.render`               |
| `admin.pages_create.render`        | `admin.cms.pages_create.render`        |
| `admin.pages_create.execute`       | `admin.cms.pages_create.execute`       |
| `admin.pages_show.render`          | `admin.cms.pages_show.render`          |
| `admin.pages_update.render`        | `admin.cms.pages_update.render`        |
| `admin.pages_update.execute`       | `admin.cms.pages_update.execute`       |
| `admin.pages_update.publish`       | `admin.cms.pages_update.publish`       |
| `admin.pages_update.unpublish`     | `admin.cms.pages_update.unpublish`     |
| `admin.pages.set_homepage`         | `admin.cms.pages.set_homepage`         |
| `admin.pages.destroy`              | `admin.cms.pages.destroy`              |
| `admin.page_translations.execute`  | `admin.cms.page_translations.execute`  |
| `admin.page_revisions.index`       | `admin.cms.page_revisions.index`       |
| `admin.page_revisions.restore`     | `admin.cms.page_revisions.restore`     |
| `admin.page_revisions.toggle_keep` | `admin.cms.page_revisions.toggle_keep` |
| `admin.pages_preview.render`       | `admin.cms.pages_preview.render`       |
| `admin.templates.render`           | `admin.cms.templates.render`           |
| `admin.templates.execute`          | `admin.cms.templates.execute`          |
| `admin.templates.apply_to_page`    | `admin.cms.templates.apply_to_page`    |
| `admin.templates.update`           | `admin.cms.templates.update`           |
| `admin.templates.destroy`          | `admin.cms.templates.destroy`          |
| `admin.templates_preview.render`   | `admin.cms.templates_preview.render`   |
| `admin.templates.edit`             | `admin.cms.templates.edit`             |

### CMS public front (`cms_public.routes.ts` → `app/cms/routes.ts`)

| Old name                                     | New name                                                |
| -------------------------------------------- | ------------------------------------------------------- |
| `contact.execute`                            | `cms.contact.execute`                                   |
| `page.home` (serves `GET /` on `main` today) | `core.home.render` — absorbed into the core home (§3.7) |
| `page.localised.render`                      | `cms.page.localised.render`                             |
| `page.render`                                | `cms.page.render`                                       |

### Admin REST API — identity (`admin_rest_api.routes.ts` → `app/identity/routes.ts`)

| Old name                                | New name                                  |
| --------------------------------------- | ----------------------------------------- |
| `api.v1.admin.users_api.index`          | `api.v1.admin.identity.users.index`       |
| `api.v1.admin.users_create_api.store`   | `api.v1.admin.identity.users.store`       |
| `api.v1.admin.users_show_api.show`      | `api.v1.admin.identity.users.show`        |
| `api.v1.admin.users_update_api.update`  | `api.v1.admin.identity.users.update`      |
| `api.v1.admin.users_delete_api.destroy` | `api.v1.admin.identity.users.destroy`     |
| `api.v1.admin.roles_api.index`          | `api.v1.admin.identity.roles.index`       |
| `api.v1.admin.roles_create_api.store`   | `api.v1.admin.identity.roles.store`       |
| `api.v1.admin.roles_show_api.show`      | `api.v1.admin.identity.roles.show`        |
| `api.v1.admin.roles_update_api.update`  | `api.v1.admin.identity.roles.update`      |
| `api.v1.admin.roles_delete_api.destroy` | `api.v1.admin.identity.roles.destroy`     |
| `api.v1.admin.permissions_api.index`    | `api.v1.admin.identity.permissions.index` |

### Admin REST API — file (`admin_rest_api.routes.ts` → `app/file/routes.ts`)

| Old name                                  | New name                             |
| ----------------------------------------- | ------------------------------------ |
| `api.v1.admin.files_api.index`            | `api.v1.admin.file.files.index`      |
| `api.v1.admin.files_upload_api.store`     | `api.v1.admin.file.files.store`      |
| `api.v1.admin.files_show_api.show`        | `api.v1.admin.file.files.show`       |
| `api.v1.admin.files_api.move`             | `api.v1.admin.file.files.move`       |
| `api.v1.admin.files_delete_api.destroy`   | `api.v1.admin.file.files.destroy`    |
| `api.v1.admin.files_alt_api.upsert_alt`   | `api.v1.admin.file.files.upsert_alt` |
| `api.v1.admin.files_alt_api.delete_alt`   | `api.v1.admin.file.files.delete_alt` |
| `api.v1.admin.folders_api.index`          | `api.v1.admin.file.folders.index`    |
| `api.v1.admin.folders_api.store`          | `api.v1.admin.file.folders.store`    |
| `api.v1.admin.folders_show_api.show`      | `api.v1.admin.file.folders.show`     |
| `api.v1.admin.folders_show_api.children`  | `api.v1.admin.file.folders.children` |
| `api.v1.admin.folders_update_api.update`  | `api.v1.admin.file.folders.update`   |
| `api.v1.admin.folders_delete_api.destroy` | `api.v1.admin.file.folders.destroy`  |

### Admin REST API — account (`admin_rest_api.routes.ts` → `app/account/routes.ts`)

| Old name                     | New name                                   |
| ---------------------------- | ------------------------------------------ |
| `api.v1.admin.theme.execute` | `api.v1.admin.account.preferences.execute` |

### Admin REST API — core (`admin_rest_api.routes.ts` → `app/core/routes.ts`)

| Old name                              | New name                               |
| ------------------------------------- | -------------------------------------- |
| `api.v1.admin.dashboard_api.index`    | `api.v1.admin.core.dashboard.index`    |
| `api.v1.admin.maintenance_api.index`  | `api.v1.admin.core.maintenance.index`  |
| `api.v1.admin.maintenance_api.update` | `api.v1.admin.core.maintenance.update` |
| `api.v1.admin.maintenance_api.toggle` | `api.v1.admin.core.maintenance.toggle` |

### Admin REST API — log (`admin_rest_api.routes.ts` → `app/log/routes.ts`)

| Old name                      | New name                      |
| ----------------------------- | ----------------------------- |
| `api.v1.admin.logs_api.index` | `api.v1.admin.log.logs.index` |

### CMS REST API (`cms_rest_api.routes.ts` → `app/cms/routes.ts`)

| Old name                                     | New name                                         |
| -------------------------------------------- | ------------------------------------------------ |
| `api.v1.admin.pages_api.index`               | `api.v1.admin.cms.pages.index`                   |
| `api.v1.admin.pages_create_api.store`        | `api.v1.admin.cms.pages.store`                   |
| `api.v1.admin.pages_show_api.show`           | `api.v1.admin.cms.pages.show`                    |
| `api.v1.admin.pages_update_api.update`       | `api.v1.admin.cms.pages.update`                  |
| `api.v1.admin.pages_delete_api.destroy`      | `api.v1.admin.cms.pages.destroy`                 |
| `api.v1.admin.pages_update_api.publish`      | `api.v1.admin.cms.pages.publish`                 |
| `api.v1.admin.pages_update_api.unpublish`    | `api.v1.admin.cms.pages.unpublish`               |
| `api.v1.admin.pages_api.set_homepage`        | `api.v1.admin.cms.pages.set_homepage`            |
| `api.v1.admin.page_translations_api.store`   | `api.v1.admin.cms.page_translations.store`       |
| `api.v1.admin.page_revisions_api.index`      | `api.v1.admin.cms.page_revisions.index`          |
| `api.v1.admin.page_revisions_api.restore`    | `api.v1.admin.cms.page_revisions.restore`        |
| `api.v1.admin.page_revisions_api.toggle`     | `api.v1.admin.cms.page_revisions.toggle`         |
| `api.v1.admin.pages_preview_token.token`     | `api.v1.admin.cms.pages_preview.token`           |
| `api.v1.admin.templates.index`               | `api.v1.admin.cms.templates.index`               |
| `api.v1.admin.templates.store`               | `api.v1.admin.cms.templates.store`               |
| `api.v1.admin.templates.update`              | `api.v1.admin.cms.templates.update`              |
| `api.v1.admin.templates.destroy`             | `api.v1.admin.cms.templates.destroy`             |
| `api.v1.admin.templates.create_from_page`    | `api.v1.admin.cms.templates.create_from_page`    |
| `api.v1.admin.templates_preview_token.token` | `api.v1.admin.cms.templates_preview.token`       |
| `api.v1.admin.builder_operations.execute`    | `api.v1.admin.cms.builder_operations.execute`    |
| `api.v1.admin.builder_operations.presence`   | `api.v1.admin.cms.builder_operations.presence`   |
| `api.v1.admin.builder_operations.save_draft` | `api.v1.admin.cms.builder_operations.save_draft` |

### Token API (`api.routes.ts` → `app/auth/routes.ts` + `app/account/routes.ts`)

| Old name                                   | New name                               |
| ------------------------------------------ | -------------------------------------- |
| `api.v1.auth.token.execute`                | `api.v1.auth.login.execute`            |
| `api.v1.auth.register_api.store`           | `api.v1.auth.register.store`           |
| `api.v1.auth.forgot_password_api.store`    | `api.v1.auth.forgot_password.store`    |
| `api.v1.auth.reset_password_api.store`     | `api.v1.auth.reset_password.store`     |
| `api.v1.auth.email_verification_api.store` | `api.v1.auth.email_verification.store` |
| `api.v1.auth.accept_invitation_api.store`  | `api.v1.auth.accept_invitation.store`  |
| `api.v1.auth.token.destroy`                | `api.v1.auth.logout.destroy`           |
| `api.v1.auth.me.show`                      | unchanged                              |
| `api.v1.profile.profile_api.show`          | `api.v1.account.profile.show`          |
| `api.v1.profile.profile_api.update`        | `api.v1.account.profile.update`        |
| `api.v1.account.account_api.update`        | `api.v1.account.account.update`        |
| `api.v1.account.account_api.destroy`       | `api.v1.account.account.destroy`       |
