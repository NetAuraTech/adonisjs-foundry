# AdonisJS Foundry

A production-ready boilerplate for AdonisJS v7 with Inertia.js and React. Foundry gives you a solid, well-architected starting point so you can focus on building your product from day one.

## Description

AdonisJS Foundry is built on AdonisJS v7 and follows a domain-driven architecture with a clean separation between services, repositories, and controllers. It ships with a complete authentication system, OAuth providers, user settings, email workflows, a full admin panel (CMS), role-based access control, user preferences, structured logging, and a React + Inertia frontend with SSR support — all wired up and ready to go.

## Key Features

- **Complete Authentication** — Registration, login, logout, email verification, password reset
- **OAuth Providers** — GitHub, Google, Facebook with account linking and unlinking
- **User Invitation** — Admin-driven invitation flow with token-based acceptance
- **User Settings** — Profile, account credentials, email change, account deletion
- **User Preferences** — Theme (dark/light) with API-driven persistence
- **Email Workflows** — Email change with dual confirmation (new + old address), password change notification, admin invitation
- **Admin Panel (CMS)** — Dashboard, user management (list, create, show, edit, delete) with dedicated layout
- **Role-Based Access Control** — Custom role/permission system with many-to-many pivot, permission checking, and frontend guards
- **Security First** — Selector/validator tokens, attempt tracking, CSRF protection, unverified account protection
- **Domain-Driven Architecture** — Clean separation of services, repositories, contracts, and controllers
- **Structured Logging** — Categorized logs (AUTH, SECURITY, BUSINESS, API, DATABASE, PERFORMANCE) with Sentry integration
- **i18n Ready** — Full internationalization support (EN, FR) on both backend (AdonisJS i18n) and frontend (react-i18next)
- **Inertia + React** — Modern SPA experience with SSR support, no API boilerplate
- **Tailwind CSS v4** — Utility-first styling with a component library (atoms/molecules/organisms)
- **Type-Safe Routing** — Tuyau integration for end-to-end type-safe route generation
- **Pagination** — Generic pagination service with frontend pagination component
- **Dark/Light Theme** — Client-side theme toggle with server-side preference persistence
- **Frontend Guards** — Authenticated, role-based, and permission-based route guards
- **Docker Ready** — Dockerfile and docker-compose for development and production environments
- **Database Backup** — Full & differential backups with multi-storage (local, S3, Nextcloud), encryption, retention policy, and health checks

## Tech Stack

| Category | Technology |
|---|---|
| **Backend** | AdonisJS v7, Lucid ORM, VineJS |
| **Frontend** | React 19, Inertia.js, Tailwind CSS v4 |
| **Language** | TypeScript 5.9 |
| **Database** | PostgreSQL (primary), SQLite (dev alternative) |
| **Cache / Session** | Redis |
| **Auth** | Session-based (@adonisjs/auth), OAuth (@adonisjs/ally) |
| **Authorization** | Custom role/permission system (models, services, frontend guards) |
| **Email** | @adonisjs/mail (SMTP) with Edge templates |
| **Routing** | Tuyau (type-safe client) |
| **Icons** | Lucide React |
| **Notifications** | Sonner (toast) |
| **Monitoring** | Sentry (@rlanz/sentry) |
| **Build** | Vite 7, @adonisjs/assembler |
| **Testing** | Japa (unit, functional, browser) |

## Quick Start

### Requirements

| Tool | Version                     |
|---|---|
| Node.js | \>= 24.x                    |
| npm | \>= 11.x                    |
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
cp .env.example .env

# Generate app key
node ace generate:key

# Run migrations
node ace migration:run

# Start the development server
npm run dev
```

The app is available at `http://localhost:3333`.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Build for production |
| `npm start` | Start the production server |
| `npm test` | Run tests (Japa) |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Type-check backend and frontend |

## Configuration

### Environment Setup

Copy `.env.example` to `.env` and configure:

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

| Flow | Description |
|---|---|
| Registration | Email + password, with automatic email verification |
| Login | Email + password (session-based) |
| Logout | Session invalidation + CSRF rotation |
| Password Reset | Selector/validator token, 1 hour expiry, attempt tracking |
| Email Verification | Token-based, sent on registration |
| OAuth Login | GitHub, Google, Facebook |
| OAuth Linking | Link/unlink providers from settings |
| Define Password | Prompted after OAuth-only registration |
| Invitation | Admin sends invite → user accepts via token link and sets password |

### Token Security

All token-based workflows use the **selector/validator pattern**:

- **Selector** — stored in plain text for fast database lookup
- **Validator** — hashed before storage, never exposed
- **Full token** — `selector.validator` sent to the user via email

| Token Type           | Expiry | Attempt Tracking |
|----------------------|---|---|
| `PASSWORD_RESET`     | 1 hour | Max 3 attempts |
| `EMAIL_VERIFICATION` | 24 hours | — |
| `EMAIL_CHANGE`       | 24 hours | — |
| `PENDING_INVITE`     | 7 days | — |

## Admin Panel (CMS)

Foundry includes a full admin panel accessible at `/admin`, protected by authentication middleware.

### Features

| Feature | Description |
|---|---|
| Dashboard | Overview page at `/admin` |
| User List | Paginated user list with status indicators |
| User Create | Invite new users via email |
| User Show | View detailed user profile |
| User Edit | Update user information, role, and status |
| User Delete | Remove user accounts |

### Admin Layout

The admin panel uses a dedicated layout (`inertia/layouts/admin.tsx`) with:

- **Sidebar** — Navigation component (`admin_sidebar.tsx`)
- **Header** — Admin-specific header (`admin_header.tsx`)
- **Main content** — Adaptive content area (`admin_main.tsx`)

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

| Layer | Location | Responsibility |
|---|---|---|
| **Role model** | `app/models/auth/role.ts` | Roles with `hasPermission()`, `isAdmin`, system role protection |
| **Permission model** | `app/models/auth/permission.ts` | Permissions with system permission protection |
| **Pivot table** | `role_permission` | Many-to-many relationship between roles and permissions |
| **Role service** | `app/domain/services/auth/role_service.ts` | Role business logic |
| **Permission service** | `app/domain/services/auth/permission_service.ts` | Permission business logic |
| **Seeders** | `database/seeders/` | `role_seeder.ts`, `permission_seeder.ts` for default data |

Permission checking is done via model methods: `role.hasPermission(slug)`, `role.assignPermission(id)`, `role.syncPermissions(ids)`.

### Frontend Guards

React components to protect pages and UI elements:

| Guard | File | Description |
|---|---|---|
| `Authenticated` | `inertia/guards/authenticated.tsx` | Restrict access to authenticated users |
| `HasRole` | `inertia/guards/has_role.tsx` | Restrict access by role |
| `CanAccess` | `inertia/guards/can_access.tsx` | Restrict access by permission (single, any, or all) |

Guards read the user's permissions from Inertia shared props via the `useAuth` hook (`can`, `canAny`, `canAll`).

## Backup

Foundry includes a full database backup system with automatic strategy selection, multiple storage providers, encryption, and retention policy.

### Strategy

| Day | Type | Description |
|---|---|---|
| Sunday (configurable) | **Full** | Complete `pg_dump` of the entire database |
| Monday – Saturday | **Differential** | Only tables modified since the last full backup |

If no full backup exists when a differential is requested, a full backup is performed automatically.

### Ace Commands

| Command | Description |
|---|---|
| `node ace backup:run` | Run a backup (auto-detects type based on schedule) |
| `node ace backup:run --type=full` | Force a full backup |
| `node ace backup:run --type=differential` | Force a differential backup |
| `node ace backup:list` | List all available backups (with `--limit` flag) |
| `node ace backup:restore <filename>` | Restore a backup (with `--force` to skip confirmation) |
| `node ace backup:cleanup` | Apply retention policy and delete old backups |
| `node ace backup:health-check` | Check backup system health (storage availability, last backup age, disk space) |

### Storage Providers

| Provider | Description |
|---|---|
| **Local** | Always enabled, stores in `storage/backups` |
| **S3** | S3/S3-compatible (MinIO, etc.), enabled via env vars |
| **Nextcloud** | WebDAV-based, enabled via env vars |

All providers implement the `StorageAdapter` contract (`app/domain/contracts/backup/storage_adapter.ts`).

### Pipeline

Each backup goes through: **pg_dump → gzip compression → AES-256-CBC encryption (optional) → upload to all storages → manifest written**.

### Retention Policy

| Window | Default |
|---|---|
| Daily | 7 days |
| Weekly | 4 weeks (Sunday backups) |
| Monthly | 3 months (1st of month) |
| Yearly | 1 per year (1st January) |

### Backup Environment Variables

```env
# Storage - Local
BACKUP_LOCAL_PATH=storage/backups

# Storage - S3
BACKUP_S3_ENABLED=false
BACKUP_S3_BUCKET=
BACKUP_S3_REGION=us-east-1
BACKUP_S3_ENDPOINT=
BACKUP_S3_ACCESS_KEY_ID=
BACKUP_S3_SECRET_ACCESS_KEY=
BACKUP_S3_PATH=backups

# Storage - Nextcloud
BACKUP_NEXTCLOUD_ENABLED=false
BACKUP_NEXTCLOUD_URL=
BACKUP_NEXTCLOUD_USERNAME=
BACKUP_NEXTCLOUD_PASSWORD=
BACKUP_NEXTCLOUD_PATH=/backups

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

```
app/
├── data/
│   ├── storage/                            # local_storage_adapter.ts, s3_storage_adapter.ts, nextcloud_storage_adapter.ts
│   └── transformers/                       # user_transformer.ts, role_transformer.ts, permission_transformer.ts
├── domain/
│   ├── contracts/
│   │   └── backup/                         # storage_adapter.ts
│   ├── repositories/
│   │   ├── auth/                           # user_repository.ts, role_repository.ts, permission_repository.ts
│   │   ├── core/                           # token_repository.ts
│   │   └── preferences/                    # preferences_repository.ts
│   └── services/
│       ├── account/                        # account_service.ts
│       ├── auth/                           # auth_service.ts, social_service.ts, password_service.ts,
│       │                                   # email_verification_service.ts, invitation_service.ts,
│       │                                   # user_service.ts, role_service.ts, permission_service.ts
│       ├── backup/                         # backup_service.ts
│       ├── logging/                        # log_service.ts
│       ├── mails/                          # mail_service.ts
│       ├── pagination/                     # pagination_service.ts
│       ├── preferences/                    # preference_service.ts
│       └── profile/                        # profile_service.ts
├── events/
│   ├── account/                            # initiate_email_change.ts
│   ├── admin/                              # invite_user.ts
│   ├── auth/                               # forgot_password.ts, user_registered.ts
│   └── profile/
├── exceptions/
│   ├── account/                            # email_already_exists_exception.ts
│   ├── auth/                               # invalid_current_password_exception.ts, provider_already_linked_exception.ts,
│   │                                       # provider_not_configured_exception.ts, unverified_account_exception.ts
│   ├── core/                               # invalid_token_exception.ts, max_attempts_exceeded_exception.ts, row_not_found_exception.ts
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
│   │   ├── preferences/
│   │   │   ├── api/                        # theme_controller.ts
│   │   │   └── front/                      # preferences_controller.ts
│   │   └── profile/front/                  # profile_controller.ts
│   └── middleware/
│       ├── auth/                           # auth_middleware.ts, guest_middleware.ts, silent_auth_middleware.ts
│       └── core/                           # container_bindings_middleware.ts, detect_user_locale_middleware.ts, inertia_middleware.ts
├── listeners/
│   ├── account/                            # send_change_email_confirmation_email.ts, send_change_email_notification_email.ts
│   ├── auth/                               # send_forgot_password_email.ts, send_verification_email.ts
│   └── profile/
├── mails/
│   ├── account/                            # account_notification.ts
│   └── auth/                               # auth_notification.ts
├── models/
│   ├── auth/                               # user.ts, role.ts, permission.ts
│   └── core/                               # token.ts
├── types/                                  # auth.ts, core.ts, logging.ts, mail.ts
└── validators/                             # auth.ts, account.ts, profile.ts

commands/
└── backup/                                 # backup_run.ts, backup_list.ts, backup_restore.ts,
                                            # backup_cleanup.ts, backup_health_check.ts

database/
├── migrations/                             # create_users_table, create_roles_table, create_permissions_table,
│                                           # create_role_permissions_table, alter_users_table,
│                                           # create_remember_me_tokens_table, create_tokens_table,
│                                           # create_user_preferences_table
├── seeders/                                # role_seeder.ts, permission_seeder.ts
├── schema.ts
└── schema_rules.ts

inertia/
├── app.tsx
├── ssr.tsx
├── client.ts
├── assets/                                 # logo.png
├── components/
│   ├── atoms/                              # avatar.tsx, button.tsx, card.tsx, checkbox.tsx, heading.tsx, icon.tsx,
│   │                                       # input.tsx, label.tsx, nav_link.tsx, paragraph.tsx, section.tsx,
│   │                                       # select.tsx, select_option.tsx, textarea.tsx, user_status.tsx,
│   │                                       # table/ (table.tsx, table_body.tsx, table_cell.tsx, table_header.tsx,
│   │                                       #         table_header_cell.tsx, table_row.tsx)
│   ├── molecules/                          # auth/ (auth_intro.tsx, auth_providers.tsx), banner.tsx, field.tsx,
│   │                                       # pagination.tsx, theme_toggle.tsx
│   └── organisms/                          # footer.tsx, header.tsx, settings_layout.tsx,
│                                           # admin/ (admin_header.tsx, admin_main.tsx, admin_sidebar.tsx)
├── css/                                    # Global styles
├── guards/                                 # authenticated.tsx, can_access.tsx, has_role.tsx
├── helpers/                                # authorization.ts, avatar.ts, oauth.tsx, sanitization.ts, validation_rules.ts
├── hooks/                                  # use_admin.ts, use_auth.ts, use_form_validation.ts, use_is_large.ts, use_theme.ts
├── layouts/                                # default.tsx, admin.tsx
├── lib/                                    # i18n.ts, string.ts
├── locales/
│   ├── en/                                 # admin.json, auth.json, core.json, settings.json, validation.json
│   └── fr/                                 # admin.json, auth.json, core.json, settings.json, validation.json
├── pages/
│   ├── home.tsx
│   ├── auth/
│   │   ├── cms/                            # index.tsx, form.tsx, show.tsx
│   │   └── front/                          # login.tsx, register.tsx, forgot_password.tsx, reset_password.tsx,
│   │                                       # define_password.tsx, accept_invitation.tsx
│   ├── core/cms/                           # dashboard.tsx
│   ├── errors/                             # not_found.tsx, server_error.tsx
│   └── settings/
│       ├── account/front/                  # index.tsx, email_change.tsx
│       ├── preferences/front/              # index.tsx
│       └── profile/front/                  # index.tsx
├── types/                                  # Frontend type definitions
└── utils/                                  # font.ts

resources/
├── lang/
│   ├── en/                                 # admin.json, auth.json, core.json, settings.json, validation.json
│   └── fr/                                 # admin.json, auth.json, core.json, settings.json, validation.json
└── views/emails/                           # account_email.edge, admin_invite_email.edge, auth_email.edge
```

### Conventions

| Layer | Responsibility |
|---|---|
| **Controllers** | Thin, delegate to services, handle HTTP concerns only |
| **Services** | Business logic, throw typed exceptions, log significant events |
| **Repositories** | All database access, no business logic |
| **Transformers** | Shape data for the frontend (shared props) |
| **Exceptions** | Typed, carry HTTP status and i18n-ready error codes |
| **Events / Listeners** | Decouple side effects (emails, logging) from main flow |
| **Guards (frontend)** | Permission / role checks via `useAuth` hook and guard components |

### Path Aliases

The project uses Node.js subpath imports for clean module resolution:

| Alias | Path |
|---|---|
| `#controllers/*` | `app/http/controllers/*` |
| `#services/*` | `app/domain/services/*` |
| `#repositories/*` | `app/domain/repositories/*` |
| `#contracts/*` | `app/domain/contracts/*` |
| `#models/*` | `app/models/*` |
| `#transformers/*` | `app/data/transformers/*` |
| `#storage/*` | `app/data/storage/*` |
| `#validators/*` | `app/validators/*` |
| `#exceptions/*` | `app/exceptions/*` |
| `#middleware/*` | `app/http/middleware/*` |
| `#events/*` | `app/events/*` |
| `#listeners/*` | `app/listeners/*` |
| `#mails/*` | `app/mails/*` |
| `#helpers/*` | `app/helpers/*` |
| `#types/*` | `app/types/*` |

| `#config/*` | `config/*` |
| `#start/*` | `start/*` |
| `#database/*` | `database/*` |
| `#providers/*` | `providers/*` |
| `#tests/*` | `tests/*` |
| `#generated/*` | `.adonisjs/server/*` |

## Routes

### Home

| Method | Path | Handler |
|---|---|---|
| GET | `/` | Inertia render (`home`) |

### Guest Routes

| Method | Path | Handler |
|---|---|---|
| GET | `/login` | SessionController.render |
| POST | `/login` | SessionController.execute |
| GET | `/register` | RegisterController.render |
| POST | `/register` | RegisterController.execute |
| GET | `/forgot-password` | ForgotPasswordController.render |
| POST | `/forgot-password` | ForgotPasswordController.execute |
| GET | `/reset-password/:token` | ResetPasswordController.render |
| POST | `/reset-password` | ResetPasswordController.execute |
| GET | `/accept-invitation/:token` | AcceptInvitationController.render |
| POST | `/accept-invitation` | AcceptInvitationController.execute |

### OAuth Routes

| Method | Path | Handler |
|---|---|---|
| GET | `/oauth/define-password` | SocialController.render |
| POST | `/oauth/define-password` | SocialController.execute |
| GET | `/oauth/:provider` | SocialController.redirect |
| GET | `/oauth/:provider/callback` | SocialController.callback |
| POST | `/oauth/:provider/unlink` | SocialController.unlink |

### Authenticated Routes

| Method | Path | Handler |
|---|---|---|
| GET | `/verify/:token` | EmailVerificationController.execute |
| POST | `/logout` | SessionController.destroy |
| GET | `/settings` | Redirect → `/settings/profile` |
| GET | `/settings/profile` | ProfileController.render |
| POST | `/settings/profile` | ProfileController.execute |
| GET | `/settings/account` | AccountController.render |
| POST | `/settings/account` | AccountController.execute |
| DELETE | `/settings/account` | AccountController.destroy |
| GET | `/settings/account/email_change/:token` | EmailChangeController.render |
| POST | `/settings/account/email_change` | EmailChangeController.execute |
| GET | `/settings/preferences` | PreferencesController.render |
| POST | `/settings/preferences` | PreferencesController.execute |

### Admin Routes (CMS)

| Method | Path | Handler |
|---|---|---|
| GET | `/admin` | DashboardController.render |
| GET | `/admin/users` | UsersController.render |
| GET | `/admin/users/create` | UsersCreateController.render |
| POST | `/admin/users/create` | UsersCreateController.execute |
| GET | `/admin/users/:id` | UsersShowController.render |
| GET | `/admin/users/:id/edit` | UsersUpdateController.render |
| POST | `/admin/users/:id/edit` | UsersUpdateController.execute |
| DELETE | `/admin/users/:id` | UsersController.destroy |

### API Routes

| Method | Path | Handler |
|---|---|---|
| POST | `/api/settings/preferences/theme` | ThemeController.execute |

## Logging & Exception Handling

### LogService

Foundry provides a centralised `LogService` (`app/domain/services/logging/log_service.ts`) that wraps AdonisJS's built-in logger. It offers typed convenience methods for each log level (`debug`, `info`, `warn`, `error`, `fatal`) and domain-specific helpers that automatically attach the correct category and structured context.

#### Log Categories

| Category | Helper Method | Description |
|---|---|---|
| `AUTH` | `logAuth(action, context)` | Authentication events (login, registration, OAuth linking) |
| `SECURITY` | `logSecurity(message, context, level?)` | Suspicious activity, access violations, audit trail |
| `API` | `logApiRequest(ctx, duration?)` | Incoming HTTP requests (method, URL, IP, user agent, status, duration) |
| `DATABASE` | `logQuery(query, duration, context?)` | Database queries — auto-elevated to `WARN` if > 1 000 ms |
| `PERFORMANCE` | `logPerformance(operation, duration, context?)` | Operation duration — auto-elevated to `WARN` if > 5 000 ms |
| `BUSINESS` | `logBusiness(event, context, metadata?)` | Domain events useful for analytics and auditing |
| `SYSTEM` | — (default) | Fallback category for `log()` calls without an explicit category |

#### Log Levels

`DEBUG` · `INFO` · `WARN` · `ERROR` · `FATAL`

All entries include a timestamp, category, and optional context / metadata / error block.

### Exception Handler

The global exception handler (`app/exceptions/handler.ts`) extends AdonisJS's built-in `ExceptionHandler`:

- **Debug mode** — verbose error display with stack traces (disabled in production)
- **Status pages** — Inertia-rendered error pages (`errors/not_found` for 404, `errors/server_error` for 500–599)
- **Sentry reporting** — unhandled exceptions are forwarded to Sentry via `@rlanz/sentry`

### Typed Exceptions

Each exception extends `@adonisjs/core/exceptions.Exception` and implements its own `handle` method with i18n-ready error messages. All exceptions support both JSON and session-flash responses.

#### Account

| Exception | Code | HTTP | Description |
|---|---|---|---|
| `EmailAlreadyExistsException` | `E_EMAIL_EXISTS` | 409 | Email already in use by another account |

#### Auth

| Exception | Code | HTTP | Description |
|---|---|---|---|
| `InvalidCredentialsException` | `E_INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `InvalidCurrentPasswordException` | `E_INVALID_CURRENT_PASSWORD` | 400 | Current password mismatch |
| `ProviderAlreadyLinkedException` | `E_PROVIDER_ALREADY_LINKED` | 409 | OAuth account already linked to another user |
| `ProviderNotConfiguredException` | `E_PROVIDER_NOT_CONFIGURED` | 501 | OAuth provider not configured |
| `UnverifiedAccountException` | `E_UNVERIFIED_ACCOUNT` | 403 | Account not yet verified |

#### Core

| Exception | Code | HTTP | Description |
|---|---|---|---|
| `InvalidTokenException` | `E_INVALID_TOKEN` | 400 | Token invalid, expired, or not found |
| `MaxAttemptsExceededException` | `E_MAX_ATTEMPTS_EXCEEDED` | 429 | Too many token validation attempts |
| `RowNotFoundException` | `E_ROW_NOT_FOUND` | 404 | Requested resource not found |
| `SlugExistsException` | `E_SLUG_EXISTS` | 409 | Slug already taken |

## Contributing

Contributions are welcome!

### Development Setup

```bash
git clone https://github.com/NetAuraTech/adonisjs-foundry.git
cd adonisjs-foundry
npm install
docker compose up -d
cp .env.example .env
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

| Type | Usage |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs` | Documentation only |
| `chore` | Tooling, config, dependencies |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |

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
- Additional path aliases: `#contracts/*`, `#storage/*`, `#tests/*`, `#generated/*`
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
