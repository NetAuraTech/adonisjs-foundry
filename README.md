# AdonisJS Foundry

A production-ready boilerplate and headless CMS for AdonisJS v7 with Inertia.js and React. Foundry gives you a solid, well-architected starting point so you can focus on building your product from day one.

## Description

AdonisJS Foundry is built on AdonisJS v7 and follows a domain-driven architecture with a clean separation between services, repositories, and controllers. It ships with a complete authentication system, OAuth providers, user settings, email workflows, a full admin panel (CMS) with a visual page builder, file management, template system, role-based access control, user preferences, structured logging, caching, image optimization, SEO tooling, and a React + Inertia frontend with SSR support — all wired up and ready to go.

## Key Features

- **Complete Authentication** — Registration, login, logout, email verification, password reset
- **OAuth Providers** — GitHub, Google, Facebook with account linking and unlinking
- **User Invitation** — Admin-driven invitation flow with token-based acceptance
- **User Settings** — Profile, account credentials, email change, account deletion
- **User Preferences** — Theme (dark/light) with API-driven persistence
- **Email Workflows** — Email change with dual confirmation (new + old address), password change notification, admin invitation, contact form notification
- **Admin Panel (CMS)** — Dashboard, user management, page management, file management, template management with dedicated layout
- **Visual Page Builder** — Block-based page editor with real-time collaborative editing (SSE via Transmit), optimistic field locking, presence tracking, live preview, and draft auto-save
- **Block System** — 12 block types (section, grid, flex, title, paragraph, button, separator, icon, form, field, htmltext, image) with responsive props
- **Page Translations & Revisions** — Multi-locale pages with per-locale slugs, revision history with restore/pin, and content seeding between locales
- **File Management** — Upload, folder organization, per-locale named alt text system, multi-disk storage (local, S3, R2)
- **Image Optimization** — Server-side responsive variant generation (400w, 800w, 1200w WebP) via Sharp with CLS-preventing dimension extraction
- **Template System** — Page and block templates, create from existing page, apply template to page
- **Cache Service** — Redis-backed cache with namespace support, get-or-set pattern, pattern deletion
- **Contact Form** — Dynamic contact form block with event-driven email notification
- **SEO** — Dynamic sitemap.xml and robots.txt generation, per-page meta title/description/image, homepage designation
- **Content Sanitization** — Server-side DOMPurify (via jsdom) for all rich-text content
- **Role-Based Access Control** — Custom role/permission system with many-to-many pivot, permission checking, and frontend guards
- **Security First** — Selector/validator tokens, attempt tracking, CSRF protection, unverified account protection
- **Domain-Driven Architecture** — Clean separation of services, repositories, contracts, and controllers
- **Structured Logging** — Categorized logs (AUTH, SECURITY, BUSINESS, API, DATABASE, PERFORMANCE) with Sentry integration
- **i18n Ready** — Full internationalization support (EN, FR) on backend (AdonisJS i18n)
- **Inertia + React** — Modern SPA experience with SSR support, no API boilerplate
- **Real-Time Events** — AdonisJS Transmit (SSE) for live builder collaboration
- **Tailwind CSS v4** — Utility-first styling with a component library (atoms/molecules/organisms)
- **Type-Safe Routing** — Tuyau integration for end-to-end type-safe route generation
- **Pagination** — Generic pagination service with frontend pagination component
- **Dark/Light Theme** — Client-side theme toggle with server-side preference persistence
- **Frontend Guards** — Authenticated, role-based, and permission-based route guards
- **Docker Ready** — Dockerfile and docker-compose for development and production environments
- **Database Backup** — Full & differential backups with multi-storage (local, S3, Nextcloud), encryption, retention policy, and health checks

## Tech Stack

| Category             | Technology                                                        |
| -------------------- | ----------------------------------------------------------------- |
| **Backend**          | AdonisJS v7, Lucid ORM, VineJS                                    |
| **Frontend**         | React 19, Inertia.js, Tailwind CSS v4                             |
| **Language**         | TypeScript 5.9                                                    |
| **Database**         | PostgreSQL (primary), SQLite (dev alternative)                    |
| **Cache / Session**  | Redis                                                             |
| **Auth**             | Session-based (@adonisjs/auth), OAuth (@adonisjs/ally)            |
| **Authorization**    | Custom role/permission system (models, services, frontend guards) |
| **Email**            | @adonisjs/mail (SMTP) with Edge templates                         |
| **File Storage**     | @adonisjs/drive (local FS, S3, Cloudflare R2)                     |
| **Image Processing** | Sharp (responsive WebP variant generation)                        |
| **Real-Time**        | @adonisjs/transmit (SSE)                                          |
| **Sanitization**     | DOMPurify + jsdom (server-side HTML sanitization)                 |
| **Routing**          | Tuyau (type-safe client)                                          |
| **Icons**            | Iconify React                                                     |
| **Notifications**    | Sonner (toast)                                                    |
| **Monitoring**       | Sentry (@sentry/node)                                             |
| **Build**            | Vite 7, @adonisjs/assembler                                       |
| **Testing**          | Japa (unit, functional, browser)                                  |

## Quick Start

### Requirements

| Tool     | Version                     |
| -------- | --------------------------- |
| Node.js  | \>= 24.x                    |
| npm      | \>= 11.x                    |
| Database | PostgreSQL / MySQL / SQLite |

### Installation

```bash
# Clone the repository
git clone https://github.com/NetAuraTech/adonisjs-foundry.git my-app
cd my-app

# Install dependencies
npm install

# Start infrastructure (PostgreSQL, Redis, MailHog, Typesense)
docker compose up -d

# Configure environment
cp apps/web/.env.example apps/web/.env

# Generate app key and run migrations (from the app workspace)
cd apps/web
node ace generate:key
node ace migration:run

# Start the development server
npm run dev
```

The app is available at `http://localhost:3333`.

> [!NOTE]
> The application lives in the `apps/web` workspace. `node ace` commands always run from there; the npm scripts (`dev`, `build`, `test`, `lint`, `format`, `typecheck`, …) also work from the repo root.

> [!NOTE]
> This repository uses LF line endings (`oxfmt` enforces `endOfLine: lf` and `.gitattributes` sets `* text=auto`). On Windows, run `git config core.autocrlf false` before your first commit to keep the working tree LF-only and avoid CRLF churn.

### Create Your Project

AdonisJS Foundry is **not meant to be used as-is**. It is a boilerplate — you should create your own repository from it while keeping a link to the source so you can pull future updates.

#### 1. Create your new repository

```bash
# Create a new empty repo on GitHub/GitLab, then:
mkdir my-project && cd my-project
git init
```

#### 2. Add Foundry as an upstream remote

```bash
# Add the Foundry repo as a remote called "foundry"
git remote add foundry https://github.com/NetAuraTech/adonisjs-foundry.git

# Pull the entire codebase from Foundry's main branch
git fetch foundry
git merge foundry/main --allow-unrelated-histories
```

#### 3. Add your own origin remote

```bash
# Link your personal repo
git remote add origin git@github.com:your-username/my-project.git
git push -u origin main
```

#### 4. Pull future updates from Foundry

When a new version of Foundry is released, you can pull the changes into your project:

```bash
# Fetch the latest changes from Foundry
git fetch foundry

# Merge them into your branch (resolve conflicts if needed)
git merge foundry/main
```

> [!TIP]
> You can also cherry-pick specific commits instead of merging the entire branch if you only want selected features.

#### Summary of remotes

| Remote    | URL                                                   | Purpose                          |
| --------- | ----------------------------------------------------- | -------------------------------- |
| `origin`  | `git@github.com:your-username/my-project.git`         | Your project repository          |
| `foundry` | `https://github.com/NetAuraTech/adonisjs-foundry.git` | Upstream boilerplate (read-only) |

### Flavors & branches

This repository ships as **three flavor branches** — the same codebase, pruned to different surfaces. This README (on `main`) is the **`full`** flavor, the complete tree.

| Flavor      | Branch    | Pitch                                                                   |
| ----------- | --------- | ----------------------------------------------------------------------- |
| **full**    | `main`    | Inertia front + admin, CMS module and visual page builder (this README) |
| **inertia** | `inertia` | Hand-written Inertia front + admin, no CMS / page builder               |
| **api**     | `api`     | Headless REST backend (`/api/v1/*`), no frontend                        |

**Choosing a flavor:** want the CMS / visual builder → `full`. Want auth + admin + hand-written pages, no CMS → `inertia`. Want a headless backend consumed by an external front (Next.js, mobile, …) → `api`.

**How to get a flavor:** flavor branches are regenerated branches of `main` — check them out directly and note each carries its own README describing its conventions:

```bash
git checkout -b inertia origin/inertia   # or: git checkout -b api origin/api
```

**Upgrading:** flavors are not one-way doors — every flavor branch is derived from `main`, so anything it removes is recoverable. Upgrading is a documented manual `git` process, the inverse of each flavor's prune manifest: see `docs/flavors/README.md` and the [`api` → `full`](docs/flavors/api/upgrade-to-full.md) / [`inertia` → `full`](docs/flavors/inertia/upgrade-to-full.md) guides.

**How it works:** the `inertia` and `api` branches are CI-regenerated artifacts produced from `main` by the declarative prune manifests in `tooling/prune/flavors/` (see [ADR-010](docs/adr/010-flavor-prune-pipeline.md)). They are never edited by hand.

### Available Scripts

| Script               | Description                     |
| -------------------- | ------------------------------- |
| `npm run dev`        | Start the dev server with HMR   |
| `npm run build`      | Build for production            |
| `npm start`          | Start the production server     |
| `npm test`           | Run tests (Japa)                |
| `npm run test:front` | Run frontend tests (Vitest)     |
| `npm run lint`       | Run oxlint                      |
| `npm run format`     | Format code with oxfmt          |
| `npm run typecheck`  | Type-check backend and frontend |

## Configuration

### Environment Setup

Copy `apps/web/.env.example` to `apps/web/.env` and configure:

```env
# Node
TZ=UTC
PORT=3333
HOST=localhost
NODE_ENV=development

# App
LOG_LEVEL=info
APP_KEY=
APP_URL=http://localhost:3333
APP_NAME=AdonisJS Foundry

# Session
SESSION_DRIVER=redis

# Database
PG_HOST=127.0.0.1
PG_PORT=5432
PG_USER=user
PG_PASSWORD=password
PG_DB_NAME=app

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_SOCKET=

# Mail
MAIL_MAILER=smtp
MAIL_FROM_NAME=${APP_NAME}
MAIL_FROM_ADDRESS=contact@example.com

# SMTP
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USERNAME=username
SMTP_PASSWORD=password

# Sentry
SENTRY_DSN=<your_dsn_url>

# OAuth
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Drive (File Storage)
DRIVE_DISK=fs
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET=
R2_KEY=
R2_SECRET=
R2_BUCKET=
R2_ENDPOINT=

# File Upload
MAX_UPLOAD_SIZE=10

# Limiter
LIMITER_STORE=redis
```

### OAuth Setup

OAuth providers are **automatically enabled** when valid credentials are present. Providers with empty or `dummy` credentials are silently disabled — no code change required.

Register the following callback URLs in your OAuth app dashboards:

```
http://localhost:3333/oauth/github/callback
http://localhost:3333/oauth/google/callback
http://localhost:3333/oauth/facebook/callback
```

### Docker

The project includes Docker configurations for both development and production.

**Development** — Spin up PostgreSQL, Redis, Typesense, and MailHog:

```bash
docker compose up -d
```

**Production** — Multi-stage build with Nginx reverse proxy and 3 app replicas:

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Authentication

Foundry ships with a complete authentication system covering every standard flow.

### Flows

| Flow               | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| Registration       | Email + password, with automatic email verification                |
| Login              | Email + password (session-based)                                   |
| Logout             | Session invalidation + CSRF rotation                               |
| Password Reset     | Selector/validator token, 1 hour expiry, attempt tracking          |
| Email Verification | Token-based, sent on registration                                  |
| OAuth Login        | GitHub, Google, Facebook                                           |
| OAuth Linking      | Link/unlink providers from settings                                |
| Define Password    | Prompted after OAuth-only registration                             |
| Invitation         | Admin sends invite → user accepts via token link and sets password |

### Token Security

All token-based workflows use the **selector/validator pattern**:

- **Selector** — stored in plain text for fast database lookup
- **Validator** — hashed before storage, never exposed
- **Full token** — `selector.validator` sent to the user via email

| Token Type           | Expiry   | Attempt Tracking |
| -------------------- | -------- | ---------------- |
| `PASSWORD_RESET`     | 1 hour   | Max 3 attempts   |
| `EMAIL_VERIFICATION` | 24 hours | —                |
| `EMAIL_CHANGE`       | 24 hours | —                |
| `PENDING_INVITE`     | 7 days   | —                |

### Authentication Guards

Two guards are available in `config/auth.ts`, toggled by environment variable:

| Guard | Driver          | Env flag         | Default  |
| ----- | --------------- | ---------------- | -------- |
| `web` | Session cookies | `AUTH_GUARD_WEB` | enabled  |
| `api` | Opaque tokens   | `AUTH_GUARD_API` | disabled |

- **`web`** — the browser/Inertia guard. Session cookie, CSRF protection.
- **`api`** — opaque access tokens (`Authorization: Bearer`), designed for the REST API consumed by non-browser clients (mobile apps, scripts). Enabling it exposes the `/api/v1/auth/*` endpoints (login, logout, me). Token lifetime is configurable via `AUTH_API_TOKEN_EXPIRY` (default: `30d`).

The JSON API under `/api/admin/*` and `/api/settings/*` accepts **both** guards when `AUTH_GUARD_API=true`: a browser keeps using its session cookie while scripts authenticate with a Bearer token — permissions resolve identically either way. Inertia pages remain session-only, and `/api/v1/*` remains token-only: the two guards never overlap by accident.

For the `api` flavor (no session guard at all): set `AUTH_GUARD_WEB=false` and `AUTH_GUARD_API=true`.

**OAuth and mobile clients**: the OAuth flow relies on the browser session (state/nonce + flash messages) and always redirects back to the web app after a provider callback. A mobile client completes OAuth inside a system browser (the web app creates its session as usual), then obtains an API token via `POST /api/v1/auth/login` — OAuth-only users set a password first through the existing "define password" flow. No token is ever placed in a redirect URL.

## Admin Panel (CMS)

Foundry includes a full admin panel accessible at `/admin`, protected by authentication and permission middleware.

### Features

| Feature         | Description                                                                  |
| --------------- | ---------------------------------------------------------------------------- |
| Dashboard       | Overview page at `/admin`                                                    |
| User Management | Paginated list, invite, show, edit, delete — with role and status management |
| Page Management | Create, edit, publish/unpublish, delete pages with multi-locale translations |
| Page Builder    | Visual block-based editor with real-time collaboration, locking, and preview |
| Page Revisions  | Revision history per translation with restore and pin/unpin                  |
| File Management | Upload, folder organization, per-locale alt text, move, and delete           |
| Template System | Create, edit, delete templates — create from page and apply template to page |

### Admin Layout

The admin panel uses a dedicated layout (`inertia/layouts/admin.tsx`) with:

- **Sidebar** — Navigation component (`admin_sidebar.tsx`) with content and access-control sections
- **Header** — Admin-specific header (`admin_header.tsx`)
- **Main content** — Adaptive content area (`admin_main.tsx`)

## Page Builder

The page builder is a visual, block-based editor with real-time collaborative editing capabilities.

### Block Types

| Block       | Description                                                   | Container |
| ----------- | ------------------------------------------------------------- | --------- |
| `section`   | Full-width wrapper with background, padding, and anchor ID    | ✅        |
| `grid`      | Responsive column grid with configurable gap and alignment    | ✅        |
| `flex`      | Flexible container with direction, gap, align, justify, wrap  | ✅        |
| `title`     | Heading (h1–h4) with color and highlight color                | —         |
| `paragraph` | Text block with font-size, variant, and spacing               | —         |
| `button`    | CTA button with page/route/external link, icon, and alignment | —         |
| `separator` | Horizontal divider with spacing and color                     | —         |
| `icon`      | Iconify icon with color, background, and size                 | —         |
| `form`      | HTML form wrapper with route action                           | ✅        |
| `field`     | Form field (text, email, textarea, tel, select) with label    | —         |
| `htmltext`  | Raw HTML content (sanitized via DOMPurify)                    | —         |
| `image`     | Image with named alt text resolution and responsive variants  | —         |

All props support responsive values (`default`, `sm`, `md`, `lg`, `xl`) where applicable.

### Collaborative Editing

The builder uses **AdonisJS Transmit (SSE)** for real-time collaboration:

- **Presence tracking** — See who is currently editing a page translation
- **Optimistic field locking** — Lock a field while editing (5s TTL auto-renewed on heartbeat)
- **Lock conflict** — If another user holds a lock, the field is shown as read-only with their name/color
- **Auto-cleanup** — Locks and sessions are released on disconnect (tab close, network drop)
- **Draft sync** — In-progress content is saved to Redis so late-joining editors see the live state
- **Live preview** — Iframe preview with token-based authentication

### Content Pipeline

```
Client edits → API operation (POST) → Server validates → Broadcast to all peers (SSE)
                                     → Sanitize rich_text (DOMPurify)
                                     → Save revision before update
                                     → Persist to database
```

### Revisions

Each translation maintains a revision history. A revision is automatically saved before every content update. Revisions can be:

- **Restored** — Replaces the current content (a pre-restore revision is saved first)
- **Pinned** — Pinned revisions are excluded from auto-purge

## File Management

The CMS includes a complete file management system with folder organization, multi-disk storage, and per-locale alt text.

### Storage Disks

| Disk | Description                   | Config                   |
| ---- | ----------------------------- | ------------------------ |
| `fs` | Local filesystem (`storage/`) | Default, `DRIVE_DISK=fs` |
| `s3` | Amazon S3 or S3-compatible    | `DRIVE_DISK=s3`          |
| `r2` | Cloudflare R2                 | `DRIVE_DISK=r2`          |

All CMS files are stored under the `cms/` prefix to avoid colliding with the backup system.

### Image Optimization

When a page is rendered, `ImageOptimizerService` processes each referenced image:

1. Extracts original dimensions (width/height) for CLS prevention
2. Generates responsive WebP variants at 400w, 800w, and 1200w using Sharp (Lanczos3 kernel)
3. Skips SVGs and variants larger than the source
4. Returns variant URLs for `<img srcset>` rendering

### Alt Text System

Files support a **named alt text** system with locale-specific entries:

- **Named alts** — Stored in `file_alts` table, keyed by `(file_id, locale, key)`
- **Alt override** — Inline override per-block that bypasses the named system
- Resolution: `altOverride > named alt (by locale + key) > empty string`

## Template System

Templates allow saving and reusing page layouts and individual block configurations.

| Type    | Description                                    |
| ------- | ---------------------------------------------- |
| `page`  | Full page layout (entire block tree)           |
| `block` | Single pre-configured block with specific type |

- **Create from page** — Save a page's current content as a reusable template
- **Apply to page** — Replace a translation's content with a template (revision saved first)

## Contact Form

The `contact_form` block type renders a configurable contact form with:

- Dynamic field list (text, email, textarea, tel, select)
- Custom recipient email, submit label, and success message
- Event-driven email notification (`ContactFormSubmitted` → `SendContactFormEmail`)

## SEO

Foundry generates SEO essentials dynamically:

- **`/sitemap.xml`** — Auto-generated XML sitemap with all published page translations
- **`/robots.txt`** — Generated robots.txt blocking `/admin/*` and `/settings/*`
- **Meta tags** — Per-page `metaTitle`, `metaDescription`, and `metaImage` (Open Graph)
- **Homepage** — Any page can be designated as the homepage (`is_homepage` flag)

## User Settings

Settings are split into domains, each backed by a dedicated service, repository, and controller.

### Profile

- Username (unique, auto-generated from email on registration)
- Avatar

### Account

- Email change (confirmation link to new address + security notification to old address)
- Password change (requires current password verification)
- OAuth provider linking/unlinking
- Account deletion (requires password confirmation)

### Preferences

- Theme selection (dark/light) with API-driven persistence
- Accessible at `/settings/preferences`

## Authorization (RBAC)

Foundry implements a **custom role/permission system** without external authorization libraries:

### Backend

| Layer                  | Location                            | Responsibility                                                  |
| ---------------------- | ----------------------------------- | --------------------------------------------------------------- |
| **Role model**         | `src/identity/models/role.ts`       | Roles with `hasPermission()`, `isAdmin`, system role protection |
| **Permission model**   | `src/identity/models/permission.ts` | Permissions with system permission protection                   |
| **Pivot table**        | `role_permission`                   | Many-to-many relationship between roles and permissions         |
| **Role actions**       | `src/identity/actions/role/`        | Role business logic (create, update, delete, list)              |
| **Permission actions** | `src/identity/actions/permission/`  | Permission business logic (create, update, delete, list)        |
| **Seeders**            | `database/seeders/`                 | `role_seeder.ts`, `permission_seeder.ts` for default data       |

Permission checking is done via model methods: `role.hasPermission(slug)`, `role.assignPermission(id)`, `role.syncPermissions(ids)`.

### Frontend Guards

React components to protect pages and UI elements:

| Guard           | File                               | Description                                         |
| --------------- | ---------------------------------- | --------------------------------------------------- |
| `Authenticated` | `inertia/guards/authenticated.tsx` | Restrict access to authenticated users              |
| `HasRole`       | `inertia/guards/has_role.tsx`      | Restrict access by role                             |
| `CanAccess`     | `inertia/guards/can_access.tsx`    | Restrict access by permission (single, any, or all) |

Guards read the user's permissions from Inertia shared props via the `useAuth` hook (`can`, `canAny`, `canAll`).

## Backup

Foundry includes a full database backup system with automatic strategy selection, encryption, and retention policy. Backup storage uses the same `@adonisjs/drive` package as the CMS file system — all backup files are stored under the `backup/` prefix on the configured disk.

### Strategy

| Day                   | Type             | Description                                     |
| --------------------- | ---------------- | ----------------------------------------------- |
| Sunday (configurable) | **Full**         | Complete `pg_dump` of the entire database       |
| Monday – Saturday     | **Differential** | Only tables modified since the last full backup |

If no full backup exists when a differential is requested, a full backup is performed automatically.

### Ace Commands

| Command                                   | Description                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| `node ace backup:run`                     | Run a backup (auto-detects type based on schedule)                             |
| `node ace backup:run --type=full`         | Force a full backup                                                            |
| `node ace backup:run --type=differential` | Force a differential backup                                                    |
| `node ace backup:list`                    | List all available backups (with `--limit` flag)                               |
| `node ace backup:restore <filename>`      | Restore a backup (with `--force` to skip confirmation)                         |
| `node ace backup:cleanup`                 | Apply retention policy and delete old backups                                  |
| `node ace backup:health-check`            | Check backup system health (storage availability, last backup age, disk space) |

### Storage

Backups use the same Drive disks as the CMS file system (`fs`, `s3`, `r2`), configured via `BACKUP_STORAGE_DISK` (defaults to `fs`). All backup files are stored under the `backup/` prefix to avoid colliding with the `cms/` prefix used by file uploads.

| Disk | Description                          | Config                            |
| ---- | ------------------------------------ | --------------------------------- |
| `fs` | Local filesystem (`storage/backup/`) | Default, `BACKUP_STORAGE_DISK=fs` |
| `s3` | Amazon S3 or S3-compatible           | `BACKUP_STORAGE_DISK=s3`          |
| `r2` | Cloudflare R2                        | `BACKUP_STORAGE_DISK=r2`          |

### Pipeline

Each backup goes through: **pg_dump → gzip compression → AES-256-CBC encryption (optional) → upload to Drive → manifest written**.

### Retention Policy

| Window  | Default                  |
| ------- | ------------------------ |
| Daily   | 7 days                   |
| Weekly  | 4 weeks (Sunday backups) |
| Monthly | 3 months (1st of month)  |
| Yearly  | 1 per year (1st January) |

### Backup Environment Variables

```env
# Storage — uses the same Drive disks as CMS (fs, s3, r2)
BACKUP_STORAGE_DISK=fs

# Schedule & Encryption
BACKUP_TIME=02:00
BACKUP_ENCRYPTION_ENABLED=true

# Retention
BACKUP_RETENTION_DAILY=7
BACKUP_RETENTION_WEEKLY=4
BACKUP_RETENTION_MONTHLY=3
BACKUP_RETENTION_YEARLY=1

# Health
BACKUP_MAX_AGE_HOURS=25
BACKUP_MAX_SIZE_MB=500
BACKUP_MIN_FREE_SPACE_GB=5

# Notifications
BACKUP_NOTIFICATION_EMAIL=
BACKUP_NOTIFY_SUCCESS=false
BACKUP_NOTIFY_FAILURE=true
BACKUP_NOTIFY_HEALTH_CHECK=true

# Differential
BACKUP_EXCLUDED_TABLES=
```

## Architecture

Foundry follows a **domain-driven architecture** with a strict layering convention.

The application lives in the `apps/web` workspace (`@foundry/web`); the repo root holds the workspaces manifest, the single lockfile, repo-wide lint/format configs, the prune pipeline, CI, Docker and docs.

```
adonisjs-foundry/
├── apps/
│   └── web/                # The complete AdonisJS application (layout below)
├── docs/                   # Agent docs, ADRs, flavor matrix
├── tooling/
│   └── prune/              # Flavor prune pipeline (engine + declarative manifests)
├── .github/workflows/      # CI: tests, codegen drift check, flavor regeneration
├── docker-compose.yml      # Dev infrastructure (PostgreSQL, Redis, MailHog, Typesense)
├── docker-compose.prod.yml # Production stack (Nginx + app replicas)
└── Dockerfile              # Multi-stage production image
```

The `apps/web` layout:

```
app/
├── data/
│   └── transformers/                       # user_transformer.ts, role_transformer.ts, permission_transformer.ts,
│                                           # page_transformer.ts, page_translation_transformer.ts, page_revision_transformer.ts,
│                                           # file_transformer.ts, file_folder_transformer.ts, template_transformer.ts
├── domain/
│   ├── contracts/
│   │   └── cache/                          # cache_driver.ts
│   ├── repositories/
│   │   ├── auth/                           # user_repository.ts, role_repository.ts, permission_repository.ts
│   │   ├── core/                           # token_repository.ts
│   │   ├── file/                           # file_repository.ts, file_folder_repository.ts
│   │   ├── page/                           # page_repository.ts, page_translation_repository.ts, page_revision_repository.ts
│   │   ├── preferences/                    # preferences_repository.ts
│   │   └── template/                       # template_repository.ts
│   └── services/
│       ├── account/                        # account_service.ts
│       ├── auth/                           # auth_service.ts, social_service.ts, password_service.ts,
│       │                                   # email_verification_service.ts, invitation_service.ts,
│       │                                   # user_service.ts, role_service.ts, permission_service.ts
│       ├── backup/                         # backup_service.ts
│       ├── cache/                          # cache_service.ts
│       │   └── drivers/                    # redis_cache_driver.ts
│       ├── file/                           # file_service.ts, file_folder_service.ts, storage_service.ts,
│       │                                   # image_optimizer_service.ts
│       ├── logging/                        # log_service.ts
│       ├── mails/                          # mail_service.ts
│       ├── page/                           # page_service.ts, page_resolver_service.ts,
│       │                                   # builder_session_service.ts, sanitize_content.ts
│       ├── pagination/                     # pagination_service.ts
│       ├── preferences/                    # preference_service.ts
│       ├── profile/                        # profile_service.ts
│       └── template/                       # template_service.ts
├── events/
│   ├── account/                            # initiate_email_change.ts
│   ├── admin/                              # invite_user.ts
│   ├── auth/                               # forgot_password.ts, user_registered.ts
│   └── page/                               # contact_form_submitted.ts
├── exceptions/
│   ├── account/                            # email_already_exists_exception.ts
│   ├── auth/                               # invalid_current_password_exception.ts, provider_already_linked_exception.ts,
│   │                                       # provider_not_configured_exception.ts, unverified_account_exception.ts
│   ├── core/                               # invalid_token_exception.ts, max_attempts_exceeded_exception.ts, row_not_found_exception.ts
│   ├── file/                               # file_too_large_exception.ts, invalid_extension_exception.ts
│   ├── page/                               # missing_translation_exception.ts
│   └── handler.ts
├── helpers/
│   ├── auth/                               # crsf.ts, oauth.ts, username.ts
│   ├── core/                               # crypto.ts, encryption.ts, strip_empty_strings.ts
│   └── pagination/                         # extract_pagination.ts, get_pagination_params.ts
├── http/
│   ├── controllers/
│   │   ├── account/front/                  # account_controller.ts, email_change_controller.ts
│   │   ├── auth/
│   │   │   ├── cms/                        # users_controller.ts, users_create_controller.ts,
│   │   │   │                               # users_show_controller.ts, users_update_controller.ts
│   │   │   └── front/                      # session_controller.ts, register_controller.ts, forgot_password_controller.ts,
│   │   │                                   # reset_password_controller.ts, email_verification_controller.ts,
│   │   │                                   # social_controller.ts, accept_invitation_controller.ts
│   │   ├── core/cms/                       # dashboard_controller.ts
│   │   ├── file/
│   │   │   ├── api/                        # file_controller.ts
│   │   │   └── cms/                        # files_controller.ts, file_folders_controller.ts
│   │   ├── page/
│   │   │   ├── api/                        # builder_operations_controller.ts
│   │   │   ├── cms/                        # pages_controller.ts, pages_create_controller.ts, pages_show_controller.ts,
│   │   │   │                               # pages_update_controller.ts, pages_preview_controller.ts,
│   │   │   │                               # page_translations_controller.ts, page_revisions_controller.ts
│   │   │   └── front/                      # page_controller.ts, contact_controller.ts
│   │   ├── preferences/
│   │   │   ├── api/                        # theme_controller.ts
│   │   │   └── front/                      # preferences_controller.ts
│   │   ├── profile/front/                  # profile_controller.ts
│   │   └── template/cms/                   # templates_controller.ts
│   └── middleware/
│       ├── auth/                           # auth_middleware.ts, guest_middleware.ts, silent_auth_middleware.ts,
│       │                                   # permission_middleware.ts, role_middleware.ts
│       └── core/                           # container_bindings_middleware.ts, detect_user_locale_middleware.ts, inertia_middleware.ts
├── listeners/
│   ├── account/                            # send_change_email_confirmation_email.ts, send_change_email_notification_email.ts
│   ├── auth/                               # send_forgot_password_email.ts, send_verification_email.ts
│   └── page/                               # send_contact_form_email.ts
├── mails/
│   ├── account/                            # account_notification.ts
│   ├── admin/                              # invite_notification.ts
│   ├── auth/                               # auth_notification.ts
│   └── page/                               # contact_form_notification.ts
├── models/
│   ├── auth/                               # user.ts, role.ts, permission.ts
│   ├── core/                               # token.ts
│   ├── file/                               # file.ts, file_alt.ts, file_folder.ts
│   ├── page/                               # page.ts, page_translation.ts, page_revision.ts
│   ├── preferences/                        # user_preference.ts
│   └── template/                           # template.ts
├── services/                               # (empty — runtime service layer, see domain/services/)
├── types/                                  # auth.ts, builder.ts, core.ts, file.ts, font.ts, logging.ts,
│                                           # mail.ts, page.ts, pagination.ts, paragraph.ts, preferences.ts,
│                                           # template.ts, translations.ts
└── validators/                             # auth.ts, account.ts, builder.ts, contact.ts, file.ts,
                                            # page.ts, pagination.ts, preference.ts, profile.ts,
                                            # template.ts, user.ts

commands/
└── backup/                                 # backup_run.ts, backup_list.ts, backup_restore.ts,
                                            # backup_cleanup.ts, backup_health_check.ts

database/
├── factories/                              # user_factory.ts, page_factory.ts, file_factory.ts,
│                                           # file_folder_factory.ts, template_factory.ts
├── migrations/                             # create_users_table, create_roles_table, create_permissions_table,
│                                           # create_role_permissions_table, alter_users_table,
│                                           # create_remember_me_tokens_table, create_tokens_table,
│                                           # create_user_preferences_table, create_file_folders_table,
│                                           # create_files_table, create_file_alts_table,
│                                           # create_pages_table, create_page_translations_table,
│                                           # create_page_revisions_table, create_templates_table,
│                                           # alter_pages_table
├── seeders/                                # role_seeder.ts, permission_seeder.ts,
│                                           # cms/ (page_seeder.ts, template_seeder.ts)
├── schema.ts
└── schema_rules.ts

inertia/
├── app.tsx
├── ssr.tsx
├── client.ts
├── components/
│   ├── atoms/                              # avatar.tsx, button.tsx, card.tsx, checkbox.tsx, file_upload_input.tsx,
│   │                                       # floating_portal.tsx, heading.tsx, icon.tsx, input.tsx, label.tsx,
│   │                                       # modal.tsx, nav_link.tsx, paragraph.tsx, section.tsx, select.tsx,
│   │                                       # select_option.tsx, separator.tsx, textarea.tsx, user_status.tsx,
│   │                                       # table/ (table.tsx, table_body.tsx, table_cell.tsx, table_header.tsx,
│   │                                       #         table_header_cell.tsx, table_row.tsx)
│   ├── molecules/                          # auth/ (auth_intro.tsx, auth_providers.tsx), banner.tsx, field.tsx,
│   │                                       # image_picker.tsx, pagination.tsx, theme_toggle.tsx
│   ├── organisms/                          # footer.tsx, header.tsx, settings_layout.tsx, file_manager.tsx,
│   │                                       # admin/ (admin_header.tsx, admin_main.tsx, admin_sidebar.tsx),
│   │                                       # files/ (file_alt_editor.tsx)
│   └── cms/                                # CMS module subtree (prunable as a whole):
│                                           #   blocks/ (12 static block renderers), renderer/ (page/block renderer),
│                                           #   builder/ (BlockPicker.tsx, BlockTree.tsx, PresenceBar.tsx, ...),
│                                           #   editor/ (BlockPropsEditor.tsx, blocks/{type}_editor.tsx, ...),
│                                           #   hooks/, utils/, types/ (module-private)
├── css/                                    # app.css, safelist.ts
├── guards/                                 # authenticated.tsx, can_access.tsx, has_role.tsx
├── helpers/                                # authorization.ts, avatar.ts, oauth.tsx, sanitization.ts, validation_rules.ts
├── hooks/                                  # use_admin.ts, use_auth.ts, use_form_validation.ts, use_is_large.ts,
│                                           # use_nav_link_active.ts, use_scroll_reveal.ts, use_theme.ts, use_translation.ts
│                                           # (CMS-private hooks live in components/cms/hooks/)
├── layouts/                                # default.tsx, admin.tsx
├── lib/                                    # string.ts
├── pages/
│   ├── auth/
│   │   ├── admin/                          # index.tsx, form.tsx, show.tsx
│   │   └── front/                          # login.tsx, register.tsx, forgot_password.tsx, reset_password.tsx,
│   │                                       # define_password.tsx, accept_invitation.tsx
│   ├── cms/                                # CMS module pages (prunable as a whole):
│   │   ├── page/
│   │   │   ├── admin/                      # index.tsx, create.tsx, show.tsx, edit.tsx, revisions.tsx
│   │   │   └── front/                      # show.tsx, preview.tsx
│   │   └── template/                       # admin/ (index.tsx, edit.tsx), preview.tsx
│   ├── core/admin/                         # dashboard.tsx
│   ├── errors/                             # not_found.tsx, server_error.tsx
│   ├── file/admin/                         # index.tsx, folders.tsx
│   └── settings/
│       ├── account/front/                  # index.tsx, email_change.tsx
│       ├── preferences/front/              # index.tsx
│       └── profile/front/                  # index.tsx
├── types/                                  # paginated.d.ts (builder types live in components/cms/types/)
└── utils/                                  # file.ts, font.ts (CMS-private utils live in components/cms/utils/)

resources/
├── lang/
│   ├── en/                                 # admin.json, auth.json, exceptions.json,
│   │                                       # pagination.json, permissions.json, roles.json, settings.json,
│   │                                       # validation.json, cms/ (page.json, template.json, builder.json)
│   └── fr/                                 # same namespaces as en/
└── views/
    ├── emails/                             # account_email.edge, admin_invite_email.edge, auth_email.edge,
    │                                       # contact_form_email.edge
    └── inertia_layout.edge

start/
├── container.ts                            # IoC singleton bindings (CacheService, BuilderSessionService)
├── env.ts                                  # Environment variable validation
├── events.ts                               # Event/listener registration
├── extensions.ts                           # Model extensions
├── kernel.ts                               # HTTP kernel (middleware stack)
├── limiter.ts                              # Rate limiter configuration
├── routes.ts                               # All HTTP routes
├── transmit.ts                             # SSE channel authorization and lifecycle hooks
└── validator.ts                            # VineJS custom rules
```

### Conventions

| Layer                  | Responsibility                                                   |
| ---------------------- | ---------------------------------------------------------------- |
| **Controllers**        | Thin, delegate to services, handle HTTP concerns only            |
| **Services**           | Business logic, throw typed exceptions, log significant events   |
| **Repositories**       | All database access, no business logic                           |
| **Transformers**       | Shape data for the frontend (shared props)                       |
| **Exceptions**         | Typed, carry HTTP status and i18n-ready error codes              |
| **Events / Listeners** | Decouple side effects (emails, logging) from main flow           |
| **Guards (frontend)**  | Permission / role checks via `useAuth` hook and guard components |

### Path Aliases

The project uses Node.js subpath imports for clean module resolution (paths relative to `apps/web/`):

| Alias          | Path                   |
| -------------- | ---------------------- |
| `#transport/*` | `app/*`                |
| `#generated/*` | `.adonisjs/server/*`   |
| `#types/*`     | `types/*`              |
| `#providers/*` | `providers/*`          |
| `#database/*`  | `database/*`           |
| `#factories/*` | `database/factories/*` |
| `#shared/*`    | `src/shared/*`         |
| `#core/*`      | `src/core/*`           |
| `#identity/*`  | `src/identity/*`       |
| `#auth/*`      | `src/auth/*`           |
| `#account/*`   | `src/account/*`        |
| `#file/*`      | `src/file/*`           |
| `#log/*`       | `src/log/*`            |
| `#backup/*`    | `src/backup/*`         |
| `#tests/*`     | `tests/*`              |
| `#start/*`     | `start/*`              |
| `#config/*`    | `config/*`             |
| `#cms/*`       | `src/cms/*`            |

## Routes

### Home & Public Pages

| Method | Path             | Handler                           |
| ------ | ---------------- | --------------------------------- |
| GET    | `/`              | PageController.home (homepage)    |
| GET    | `/:slug`         | PageController.render             |
| GET    | `/:locale/:slug` | PageController.render (localized) |
| GET    | `/sitemap.xml`   | PageController.sitemap            |
| GET    | `/robots.txt`    | PageController.robots             |
| POST   | `/contact`       | ContactController.execute         |

### Guest Routes

| Method | Path                        | Handler                            | Throttling  |
| ------ | --------------------------- | ---------------------------------- | ----------- |
| GET    | `/login`                    | SessionController.render           | —           |
| POST   | `/login`                    | SessionController.execute          | 5 req / 15m |
| GET    | `/register`                 | RegisterController.render          | —           |
| POST   | `/register`                 | RegisterController.execute         | 3 req / 1h  |
| GET    | `/forgot-password`          | ForgotPasswordController.render    | —           |
| POST   | `/forgot-password`          | ForgotPasswordController.execute   | 3 req / 1h  |
| GET    | `/reset-password/:token`    | ResetPasswordController.render     | —           |
| POST   | `/reset-password`           | ResetPasswordController.execute    | 3 req / 15m |
| GET    | `/accept-invitation/:token` | AcceptInvitationController.render  | —           |
| POST   | `/accept-invitation`        | AcceptInvitationController.execute | 3 req / 15m |

### OAuth Routes

| Method | Path                        | Handler                   |
| ------ | --------------------------- | ------------------------- |
| GET    | `/oauth/define-password`    | SocialController.render   |
| POST   | `/oauth/define-password`    | SocialController.execute  |
| GET    | `/oauth/:provider`          | SocialController.redirect |
| GET    | `/oauth/:provider/callback` | SocialController.callback |
| POST   | `/oauth/:provider/unlink`   | SocialController.unlink   |

### Authenticated Routes

| Method | Path                                    | Handler                             |
| ------ | --------------------------------------- | ----------------------------------- |
| GET    | `/verify/:token`                        | EmailVerificationController.execute |
| POST   | `/logout`                               | SessionController.destroy           |
| GET    | `/settings`                             | Redirect → `/settings/profile`      |
| GET    | `/settings/profile`                     | ProfileController.render            |
| POST   | `/settings/profile`                     | ProfileController.execute           |
| GET    | `/settings/account`                     | AccountController.render            |
| POST   | `/settings/account`                     | AccountController.execute           |
| DELETE | `/settings/account`                     | AccountController.destroy           |
| GET    | `/settings/account/email_change/:token` | EmailChangeController.render        |
| POST   | `/settings/account/email_change`        | EmailChangeController.execute       |
| GET    | `/settings/preferences`                 | PreferencesController.render        |
| POST   | `/settings/preferences`                 | PreferencesController.execute       |

### Admin Routes — Users (CMS)

| Method | Path                    | Handler                       | Permission     |
| ------ | ----------------------- | ----------------------------- | -------------- |
| GET    | `/admin`                | DashboardController.render    | `admin.access` |
| GET    | `/admin/users`          | UsersController.render        | `users.view`   |
| GET    | `/admin/users/create`   | UsersCreateController.render  | `users.create` |
| POST   | `/admin/users/create`   | UsersCreateController.execute | `users.create` |
| GET    | `/admin/users/:id`      | UsersShowController.render    | `users.view`   |
| GET    | `/admin/users/:id/edit` | UsersUpdateController.render  | `users.update` |
| POST   | `/admin/users/:id/edit` | UsersUpdateController.execute | `users.update` |
| DELETE | `/admin/users/:id`      | UsersController.destroy       | `users.delete` |

### Admin Routes — Pages (CMS)

| Method | Path                                                        | Handler                            |
| ------ | ----------------------------------------------------------- | ---------------------------------- |
| GET    | `/admin/pages`                                              | PagesController.render             |
| GET    | `/admin/pages/create`                                       | PagesCreateController.render       |
| POST   | `/admin/pages/create`                                       | PagesCreateController.execute      |
| GET    | `/admin/pages/:id`                                          | PagesShowController.render         |
| GET    | `/admin/pages/:id/edit`                                     | PagesUpdateController.render       |
| POST   | `/admin/pages/:id/edit`                                     | PagesUpdateController.execute      |
| POST   | `/admin/pages/:id/publish`                                  | PagesUpdateController.publish      |
| POST   | `/admin/pages/:id/unpublish`                                | PagesUpdateController.unpublish    |
| POST   | `/admin/pages/:id/homepage`                                 | PagesController.setHomepage        |
| DELETE | `/admin/pages/:id`                                          | PagesController.destroy            |
| POST   | `/admin/pages/:id/translations`                             | PageTranslationsController.execute |
| GET    | `/admin/pages/:id/translations/:translationId/revisions`    | PageRevisionsController.index      |
| POST   | `/admin/pages/:id/translations/:tId/revisions/:rId/restore` | PageRevisionsController.restore    |
| POST   | `/admin/pages/:id/translations/:tId/revisions/:rId/keep`    | PageRevisionsController.toggleKeep |
| GET    | `/admin/pages/preview/:pageId`                              | PagesPreviewController.render      |

### Admin Routes — Files (CMS)

| Method | Path                       | Handler                       |
| ------ | -------------------------- | ----------------------------- |
| GET    | `/admin/files`             | FilesController.render        |
| POST   | `/admin/files/upload`      | FilesController.upload        |
| POST   | `/admin/files/:id/move`    | FilesController.move          |
| DELETE | `/admin/files/:id`         | FilesController.destroy       |
| POST   | `/admin/files/:id/alts`    | FilesController.upsertAlt     |
| DELETE | `/admin/files/:id/alts`    | FilesController.deleteAlt     |
| GET    | `/admin/files/folders`     | FileFoldersController.render  |
| POST   | `/admin/files/folders`     | FileFoldersController.execute |
| PUT    | `/admin/files/folders/:id` | FileFoldersController.update  |
| DELETE | `/admin/files/folders/:id` | FileFoldersController.destroy |

### Admin Routes — Templates (CMS)

| Method | Path                         | Handler                            |
| ------ | ---------------------------- | ---------------------------------- |
| GET    | `/admin/templates`           | TemplatesController.render         |
| POST   | `/admin/templates`           | TemplatesController.execute        |
| POST   | `/admin/templates/from-page` | TemplatesController.createFromPage |
| POST   | `/admin/templates/:id/apply` | TemplatesController.applyToPage    |
| PUT    | `/admin/templates/:id`       | TemplatesController.update         |
| DELETE | `/admin/templates/:id`       | TemplatesController.destroy        |

### API Routes

| Method | Path                                         | Handler                               | Auth           |
| ------ | -------------------------------------------- | ------------------------------------- | -------------- |
| POST   | `/api/settings/preferences/theme`            | ThemeController.execute               | Required       |
| POST   | `/api/admin/builder/operations`              | BuilderOperationsController.execute   | `pages.update` |
| GET    | `/api/admin/builder/presence/:translationId` | BuilderOperationsController.presence  | `pages.update` |
| POST   | `/api/admin/builder/draft/:translationId`    | BuilderOperationsController.saveDraft | `pages.update` |
| GET    | `/api/admin/page/preview/token`              | PagesPreviewController.token          | `pages.update` |
| GET    | `/api/admin/files`                           | FileController.list                   | Required       |
| GET    | `/api/admin/files/:id`                       | FileController.find                   | Required       |

When the `api` guard is enabled (`AUTH_GUARD_API=true`), the token-guarded
REST API is registered (see [Authentication Guards](#authentication-guards)).
These routes accept a Bearer token only — session cookies are ignored:

| Method | Path                  | Handler                 | Auth             |
| ------ | --------------------- | ----------------------- | ---------------- |
| POST   | `/api/v1/auth/login`  | TokenController.execute | Guest, throttled |
| POST   | `/api/v1/auth/logout` | TokenController.destroy | Bearer token     |
| GET    | `/api/v1/auth/me`     | MeController.show       | Bearer token     |

## Logging & Exception Handling

### LogService

Foundry provides a centralised `LogService` (`src/log/services/log_service.ts`) that wraps AdonisJS's built-in logger. It offers typed convenience methods for each log level (`debug`, `info`, `warn`, `error`, `fatal`) and domain-specific helpers that automatically attach the correct category and structured context.

#### Log Categories

| Category      | Helper Method                                   | Description                                                            |
| ------------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| `AUTH`        | `logAuth(action, context)`                      | Authentication events (login, registration, OAuth linking)             |
| `SECURITY`    | `logSecurity(message, context, level?)`         | Suspicious activity, access violations, audit trail                    |
| `API`         | `logApiRequest(ctx, duration?)`                 | Incoming HTTP requests (method, URL, IP, user agent, status, duration) |
| `DATABASE`    | `logQuery(query, duration, context?)`           | Database queries — auto-elevated to `WARN` if > 1 000 ms               |
| `PERFORMANCE` | `logPerformance(operation, duration, context?)` | Operation duration — auto-elevated to `WARN` if > 5 000 ms             |
| `BUSINESS`    | `logBusiness(event, context, metadata?)`        | Domain events useful for analytics and auditing                        |
| `SYSTEM`      | — (default)                                     | Fallback category for `log()` calls without an explicit category       |

#### Log Levels

`DEBUG` · `INFO` · `WARN` · `ERROR` · `FATAL`

All entries include a timestamp, category, and optional context / metadata / error block.

### Exception Handler

The global exception handler (`app/core/exceptions/handler.ts`) extends AdonisJS's built-in `ExceptionHandler`:

- **Debug mode** — verbose error display with stack traces (disabled in production)
- **Status pages** — Inertia-rendered error pages (`errors/not_found` for 404, `errors/server_error` for 500–599)
- **Sentry reporting** — unhandled exceptions are forwarded to Sentry via the `@sentry/node` SDK, bootstrapped by the internal `providers/sentry_provider.ts`

### Typed Exceptions

Each exception extends `@adonisjs/core/exceptions.Exception` and implements its own `handle` method with i18n-ready error messages. All exceptions support both JSON and session-flash responses.

#### Account

| Exception                     | Code             | HTTP | Description                             |
| ----------------------------- | ---------------- | ---- | --------------------------------------- |
| `EmailAlreadyExistsException` | `E_EMAIL_EXISTS` | 409  | Email already in use by another account |

#### Auth

| Exception                         | Code                         | HTTP | Description                                  |
| --------------------------------- | ---------------------------- | ---- | -------------------------------------------- |
| `InvalidCredentialsException`     | `E_INVALID_CREDENTIALS`      | 401  | Wrong email or password                      |
| `InvalidCurrentPasswordException` | `E_INVALID_CURRENT_PASSWORD` | 400  | Current password mismatch                    |
| `ProviderAlreadyLinkedException`  | `E_PROVIDER_ALREADY_LINKED`  | 409  | OAuth account already linked to another user |
| `ProviderNotConfiguredException`  | `E_PROVIDER_NOT_CONFIGURED`  | 501  | OAuth provider not configured                |
| `UnverifiedAccountException`      | `E_UNVERIFIED_ACCOUNT`       | 403  | Account not yet verified                     |
| `UnauthorizedException`           | `E_UNAUTHORIZED`             | 401  | Not logged in                                |
| `ForbiddenException`              | `E_FORBIDDEN`                | 403  | Missing role or permission                   |

#### Core

| Exception                      | Code                      | HTTP | Description                          |
| ------------------------------ | ------------------------- | ---- | ------------------------------------ |
| `InvalidTokenException`        | `E_INVALID_TOKEN`         | 400  | Token invalid, expired, or not found |
| `MaxAttemptsExceededException` | `E_MAX_ATTEMPTS_EXCEEDED` | 429  | Too many token validation attempts   |
| `RowNotFoundException`         | `E_ROW_NOT_FOUND`         | 404  | Requested resource not found         |
| `SlugExistsException`          | `E_SLUG_EXISTS`           | 409  | Slug already taken                   |

#### File

| Exception                   | Code                  | HTTP | Description                             |
| --------------------------- | --------------------- | ---- | --------------------------------------- |
| `FileTooLargeException`     | `E_FILE_TOO_LARGE`    | 413  | File exceeds the configured size limit  |
| `InvalidExtensionException` | `E_INVALID_EXTENSION` | 422  | File extension is not in the allow list |

#### Page

| Exception                     | Code                    | HTTP | Description                                  |
| ----------------------------- | ----------------------- | ---- | -------------------------------------------- |
| `MissingTranslationException` | `E_MISSING_TRANSLATION` | 404  | No translation for the requested locale/page |

## Contributing

Contributions are welcome!

### Development Setup

```bash
git clone https://github.com/NetAuraTech/adonisjs-foundry.git
cd adonisjs-foundry
npm install
docker compose up -d
cp apps/web/.env.example apps/web/.env
cd apps/web
node ace generate:key
node ace migration:run
npm run dev
```

### Contribution Guidelines

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes following the convention below
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/). Each commit message must have a **type**, an optional **scope**, and a clear **description**:

```
type(scope)
short description
Optional body listing what was added, changed, or removed.
```

**Types:**

| Type       | Usage                                                   |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature                                             |
| `fix`      | Bug fix                                                 |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs`     | Documentation only                                      |
| `chore`    | Tooling, config, dependencies                           |
| `test`     | Adding or updating tests                                |
| `perf`     | Performance improvement                                 |

**Examples:**

```
feat(auth)
Add OAuth account linking and unlinking
- Services: SocialService
- Controllers: SocialController
- Helpers: Oauth
- Exceptions: ProviderAlreadyLinkedException, ProviderNotConfiguredException
```

```
fix(token)
Throw InvalidTokenException on expired password reset token
```

```
refactor(account)
Move email change logic from controller to AccountService
```

## Changelog

### v1.4.0

#### Page Builder & CMS

- Visual block-based page editor with 12 block types: `section`, `grid`, `flex`, `title`, `paragraph`, `button`, `separator`, `icon`, `form`, `field`, `htmltext`, `image`
- Block content tree stored as typed JSON in `page_translations.content`
- All block props are type-safe via `BlockPropsMap` and support responsive values (`default`, `sm`, `md`, `lg`, `xl`)
- Block tree manipulation: add, move, delete, update props — each operation validated server-side
- Automatic revision creation before every content update (restorable, pinnable)
- Content seeding: create a new locale translation from an existing one

#### Real-Time Collaboration

- AdonisJS Transmit (SSE) integration for live builder collaboration
- Presence tracking: see who is editing a page translation in real-time (`PRESENCE_JOINED` / `PRESENCE_LEFT`)
- Optimistic field locking with 5-second TTL and heartbeat renewal (`LOCK_ACQUIRE` / `LOCK_RELEASE`)
- Lock conflict display: locked fields shown as read-only with user name and color
- Auto-cleanup on disconnect: all locks and presence released on tab close / network drop
- Draft sync via Redis: late-joining editors see the live state
- SSE channel authorization with permission check (`pages.update`)
- Live iframe preview with token-based authentication

#### Page System

- New models: `Page`, `PageTranslation`, `PageRevision`
- Multi-locale page support with per-locale slugs and independent translation status (draft/published/archived)
- Homepage designation (`is_homepage` flag) with CMS toggle
- Dynamic public routes: `/:slug` and `/:locale/:slug`
- `PageResolverService`: resolves stored `FileRef` to `ResolvedFile` with public URLs, alt text, dimensions, and variant URLs for Inertia rendering
- Server-side HTML content sanitization via `DOMPurify` + `jsdom` (`sanitize_content.ts`)
- Page scopes: `published` scope for query filtering
- New exceptions: `MissingTranslationException` (404)
- New validators: `page.ts`, `builder.ts`
- New transformers: `page_transformer.ts`, `page_translation_transformer.ts`, `page_revision_transformer.ts`
- New seeders: `page_seeder.ts`
- New factories: `page_factory.ts`

#### File Management

- New models: `File`, `FileAlt`, `FileFolder`
- Multi-disk storage via `@adonisjs/drive` (local FS, S3, Cloudflare R2)
- `StorageService`: abstraction layer over Drive with `cms/` prefix, env-based disk resolution, silent-delete semantics
- File upload with size validation (`MAX_UPLOAD_SIZE` env) and extension validation
- Folder system with nested hierarchy and alphabetical ordering
- Per-locale named alt text system (`file_alts` table, keyed by `file_id + locale + key`)
- Alt override per block for context-specific descriptions
- `beforeDelete` hook: auto-deletes physical file from storage when DB record is removed
- File move between folders
- New exceptions: `FileTooLargeException` (413), `InvalidExtensionException` (422)
- New validators: `file.ts`
- New transformers: `file_transformer.ts`, `file_folder_transformer.ts`
- New factories: `file_factory.ts`, `file_folder_factory.ts`

#### Image Optimization

- `ImageOptimizerService` using Sharp for on-the-fly responsive variant generation
- Generates WebP variants at 400w, 800w, and 1200w with Lanczos3 kernel resampling
- Extracts original dimensions (width/height) for CLS prevention
- Skips SVG files and variants larger than the source image
- Disk-cached variants to avoid redundant re-generation
- Variant URLs returned in `ResolvedFile.variants` for `<img srcset>` rendering

#### Template System

- New model: `Template` (page or block type)
- Create template from existing page content
- Apply template to a page translation (revision saved before overwrite)
- CMS CRUD with search and type filtering
- New validator: `template.ts`
- New transformer: `template_transformer.ts`
- New seeder: `template_seeder.ts`
- New factory: `template_factory.ts`

#### Cache Service

- `CacheService` with driver-based architecture (`CacheDriver` contract)
- `RedisCacheDriver` implementation with JSON serialization, TTL, pattern deletion, `remember()` (get-or-set), atomic increment, `keys()` via SCAN
- Namespace support via `cache.namespace('builder')` for key isolation
- Singleton IoC binding via `start/container.ts`
- Used by `BuilderSessionService` for sessions, locks, and drafts
- Used by `PageController` for rendered page content caching

#### Contact Form

- `contact_form` block type with configurable fields, recipient, and success message
- Event-driven architecture: `ContactFormSubmitted` event → `SendContactFormEmail` listener
- `ContactController` with `contactValidator`
- New email template: `contact_form_email.edge`
- New mail: `contact_form_notification.ts`

#### SEO

- Dynamic `sitemap.xml` generation from all published page translations
- Dynamic `robots.txt` generation (blocks `/admin/*` and `/settings/*`)
- Per-page meta: `metaTitle`, `metaDescription`, `metaImage` (Open Graph)
- Dedicated routes: `GET /sitemap.xml`, `GET /robots.txt`

#### Frontend

- Replaced `lucide-react` with `@iconify/react` for icon rendering
- Removed `react-i18next` and `i18next` — all translations now served via AdonisJS i18n backend
- Removed `inertia/locales/` directory and `inertia/lib/i18n.ts`
- New page renderer: `page_renderer.tsx` and `block_renderer.tsx` for the 12 block types
- 12 block rendering components in `inertia/components/atoms/blocks/`
- Builder components: `BlockPicker`, `BlockTree`, `LockedFieldWrapper`, `PresenceBar`, `PreviewIframe`
- Block editor forms: `BlockPropsEditor` with per-type editor (section, grid, flex, title, paragraph, button, separator, icon, form, field, htmltext, image)
- `responsive_control.tsx` for editing responsive breakpoint values
- `FileManager` organism and `ImagePicker` molecule for file selection in blocks
- `FileAltEditor` organism for managing per-locale alt text entries
- New atoms: `file_upload_input`, `floating_portal`, `modal`, `separator`
- New hooks: `useBuilderSync`, `useContactForm`, `useScrollReveal`, `useTranslation`
- New utils: `builder_reducer.ts`, `file.ts`, `responsive.ts`
- SSR enabled by default (`config/inertia.ts`, `inertia/ssr.tsx`)
- Removed `inertia/pages/home.tsx` — homepage now served by `PageController.home`

#### Backend Locales

- Replaced `admin.json`, `permissions.json`, `roles.json` with `cms.json` covering the full CMS surface (users, pages, files, templates)
- Added `page.json` for public page translations (contact form success message)
- Added `core.json` locale file

#### Infrastructure

- Added `@adonisjs/drive` provider for multi-disk file storage
- Added `@adonisjs/transmit` provider for SSE real-time events
- Added `sharp` dependency for server-side image processing
- Added `dompurify` + `jsdom` for server-side HTML sanitization
- New preloads: `#start/container`, `#start/transmit`
- New IoC singleton bindings: `CacheService`, `BuilderSessionService`
- New path aliases: `#factories/*`, `#policies/*`, `#abilities/*`
- New database migrations: `file_folders`, `files`, `file_alts`, `pages`, `page_translations`, `page_revisions`, `templates`, `alter_pages`
- `DRIVE_DISK`, `AWS_*`, `S3_*`, `R2_*`, `MAX_UPLOAD_SIZE`, `LIMITER_STORE` env variables added to `.env.example` and `start/env.ts`

### v1.3.0

- Added `PermissionMiddleware` and `RoleMiddleware` for robust, reusable route protection
- New structured Auth exceptions: `UnauthorizedException` and `ForbiddenException`

### v1.2.0

- Removed `ErrorHandlerService` in favor of AdonisJS's built-in exception handling (`ExceptionHandler`)
- Each exception now implements its own `handle` method with i18n-ready messages and dual response mode (JSON / session flash)
- Sentry error reporting moved to the global exception handler's `report` method
- New exceptions: `InvalidCredentialsException`, `SlugExistsException`

### v1.1.0

- Admin panel (CMS) with dashboard and user management (list, create, show, edit, delete)
- User invitation system with token-based acceptance flow
- User preferences system with dark/light theme persistence
- Custom role/permission system with model-level permission checking and frontend guards
- Frontend guards (Authenticated, HasRole, CanAccess)
- Pagination service with generic frontend component
- Theme toggle component with API-driven persistence
- Admin layout with sidebar, header, and main content area
- Table component library (table, table_body, table_cell, table_header, table_header_cell, table_row)
- User status indicator component
- New hooks: `useAdmin`, `useAuth`, `useTheme`, `useIsLarge`
- New locales: admin.json, core.json (EN + FR)
- Admin invite email template
- Additional path aliases: `#contracts/*`, `#tests/*`, `#generated/*`
- New exception: `RowNotFoundException`
- New helper: `strip_empty_strings`
- Pagination helpers: `extract_pagination`, `get_pagination_params`

### v1.0.0

- Initial release
- Complete authentication system (registration, login, logout, email verification, password reset)
- OAuth providers (GitHub, Google, Facebook) with account linking/unlinking
- Selector/validator token pattern with attempt tracking
- Remember-me token support
- User settings (profile, account, email change with dual confirmation, account deletion)
- Role-based access control (roles, permissions, role_permissions)
- Domain-driven architecture (services, repositories, contracts, events/listeners, transformers)
- Structured logging with categorized log service (AUTH, SECURITY, BUSINESS, API, DATABASE, PERFORMANCE)
- Sentry integration for error tracking
- VineJS form validation (backend) + client-side validation hook (`useFormValidation`)
- Edge email templates (auth & account notifications)
- Custom error pages (404, 500) rendered via Inertia
- API serializer provider for consistent JSON responses
- Inertia.js + React 19 frontend with SSR support
- Tailwind CSS v4 component library (atoms/molecules/organisms)
- Full i18n support (EN, FR) — backend (AdonisJS i18n) and frontend (react-i18next)
- Automatic locale detection middleware
- Docker setup (development + production with Nginx proxy)
- Type-safe routing with Tuyau
- Database backup system (full/differential, multi-storage, encryption, retention, health checks)

## License

AdonisJS Foundry is open-source software licensed under the [MIT License](LICENSE).

## Support

- Open an issue on [GitHub](https://github.com/NetAuraTech/adonisjs-foundry/issues)

---

**Made with ❤️ using [AdonisJS](https://adonisjs.com)**
