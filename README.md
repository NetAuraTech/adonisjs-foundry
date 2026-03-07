# AdonisJS Foundry

A production-ready boilerplate for AdonisJS v7 with Inertia.js and React. Foundry gives you a solid, well-architected starting point so you can focus on building your product from day one.

## Description

AdonisJS Foundry is built on AdonisJS v7 and follows a domain-driven architecture with a clean separation between services, repositories, and controllers. It ships with a complete authentication system, OAuth providers, user settings, email workflows, structured logging, and a React + Inertia frontend with SSR support — all wired up and ready to go.

## Key Features

- **Complete Authentication** — Registration, login, logout, email verification, password reset
- **OAuth Providers** — GitHub, Google, Facebook with account linking and unlinking
- **User Settings** — Profile, account credentials, email change, account deletion
- **Email Workflows** — Email change with dual confirmation (new + old address), password change notification
- **Security First** — Selector/validator tokens, attempt tracking, CSRF protection, unverified account protection
- **Domain-Driven Architecture** — Clean separation of services, repositories, and controllers
- **Structured Logging** — Categorized logs (AUTH, SECURITY, BUSINESS, API, DATABASE, PERFORMANCE) with Sentry integration
- **i18n Ready** — Full internationalization support (EN, FR) on both backend (AdonisJS i18n) and frontend (react-i18next)
- **Inertia + React** — Modern SPA experience with SSR support, no API boilerplate
- **Tailwind CSS v4** — Utility-first styling with a component library (atoms/molecules/organisms)
- **Type-Safe Routing** — Tuyau integration for end-to-end type-safe route generation
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
|---|-----------------------------|
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

### Token Security

All token-based workflows use the **selector/validator pattern**:

- **Selector** — stored in plain text for fast database lookup
- **Validator** — hashed before storage, never exposed
- **Full token** — `selector.validator` sent to the user via email

| Token Type | Expiry | Attempt Tracking |
|---|---|---|
| `PASSWORD_RESET` | 1 hour | Max 3 attempts |
| `EMAIL_VERIFICATION` | 24 hours | — |
| `EMAIL_CHANGE` | 24 hours | — |
| `USER_INVITATION` | 7 days | — |

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
│   ├── storage/                        # local_storage_adapter.ts, s3_storage_adapter.ts, nextcloud_storage_adapter.ts
│   └── transformers/                   # user_transformer.ts
├── domain/
│   ├── contracts/
│   │   └── backup/                     # storage_adapter.ts
│   ├── repositories/
│   │   ├── auth/                       # user_repository.ts, role_repository.ts, permission_repository.ts
│   │   └── core/                       # token_repository.ts
│   └── services/
│       ├── account/                    # account_service.ts
│       ├── auth/                       # auth_service.ts, social_service.ts, password_service.ts, email_verification_service.ts
│       ├── backup/                     # backup_service.ts
│       ├── logging/                    # log_service.ts, error_handler_service.ts
│       ├── mails/                      # mail_service.ts
│       └── profile/                    # profile_service.ts
├── events/
│   ├── account/                        # initiate_email_change.ts
│   ├── auth/                           # forgot_password.ts, user_registered.ts
│   └── profile/
├── exceptions/
│   ├── account/                        # email_already_exists_exception.ts
│   ├── auth/                           # invalid_current_password_exception.ts, provider_already_linked_exception.ts,
│   │                                   # provider_not_configured_exception.ts, unverified_account_exception.ts
│   ├── core/                           # invalid_token_exception.ts, max_attempts_exceeded_exception.ts
│   └── handler.ts
├── helpers/
│   ├── auth/                           # crsf.ts, oauth.ts, username.ts
│   └── core/                           # crypto.ts, encryption.ts
├── http/
│   ├── controllers/
│   │   ├── account/front/              # account_controller.ts, email_change_controller.ts
│   │   ├── auth/
│   │   │   ├── cms/
│   │   │   └── front/                  # session_controller.ts, register_controller.ts, forgot_password_controller.ts,
│   │   │                               # reset_password_controller.ts, email_verification_controller.ts, social_controller.ts
│   │   └── profile/front/              # profile_controller.ts
│   └── middleware/
│       ├── auth/                       # auth_middleware.ts, guest_middleware.ts, silent_auth_middleware.ts
│       └── core/                       # container_bindings_middleware.ts, detect_user_locale_middleware.ts, inertia_middleware.ts
├── listeners/
│   ├── account/                        # send_change_email_confirmation_email.ts, send_change_email_notification_email.ts
│   ├── auth/                           # send_forgot_password_email.ts, send_verification_email.ts
│   └── profile/
├── mails/
│   ├── account/                        # account_notification.ts
│   └── auth/                           # auth_notification.ts
├── models/
│   ├── auth/                           # user.ts, role.ts, permission.ts
│   └── core/                           # token.ts
├── types/                              # auth.ts, core.ts, logging.ts, mail.ts
└── validators/                         # auth.ts, account.ts, profile.ts

commands/
└── backup/                             # backup_run.ts, backup_list.ts, backup_restore.ts,
                                        # backup_cleanup.ts, backup_health_check.ts

inertia/
├── app.tsx
├── ssr.tsx
├── client.ts
├── components/
│   ├── atoms/                          # avatar.tsx, button.tsx, card.tsx, checkbox.tsx, heading.tsx, icon.tsx,
│   │                                   # input.tsx, label.tsx, nav_link.tsx, paragraph.tsx, section.tsx,
│   │                                   # select.tsx, select_option.tsx, textarea.tsx
│   ├── molecules/                      # auth_intro.tsx, auth_providers.tsx, banner.tsx, field.tsx
│   └── organisms/                      # footer.tsx, header.tsx, settings_layout.tsx
├── css/                                # Global styles
├── helpers/                            # avatar.ts, sanitization.ts, validation_rules.ts
├── hooks/                              # use_form_validation.ts
├── layouts/                            # default.tsx
├── lib/                                # i18n.ts, string.ts
├── locales/
│   ├── en/                             # auth.json, settings.json, validation.json
│   └── fr/                             # auth.json, settings.json, validation.json
├── pages/
│   ├── home.tsx
│   ├── auth/
│   │   ├── cms/
│   │   └── front/                      # login.tsx, register.tsx, forgot_password.tsx, reset_password.tsx, define_password.tsx
│   ├── errors/                         # not_found.tsx, server_error.tsx
│   └── settings/
│       ├── account/front/              # index.tsx, email_change.tsx
│       └── profile/front/              # index.tsx
├── types/                              # Frontend type definitions
└── utils/                              # font.ts
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

### Path Aliases

The project uses Node.js subpath imports for clean module resolution:

| Alias | Path |
|---|---|
| `#controllers/*` | `app/http/controllers/*` |
| `#services/*` | `app/domain/services/*` |
| `#repositories/*` | `app/domain/repositories/*` |
| `#models/*` | `app/models/*` |
| `#transformers/*` | `app/data/transformers/*` |
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

## Error Codes

| Code | HTTP | Description |
|---|---|---|
| `E_INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `E_EMAIL_EXISTS` | 409 | Email already taken |
| `E_EMAIL_NOT_VERIFIED` | 403 | Email not verified |
| `E_UNVERIFIED_ACCOUNT` | 403 | OAuth link attempt on unverified account |
| `E_PROVIDER_NOT_CONFIGURED` | 501 | OAuth provider not configured |
| `E_PROVIDER_ALREADY_LINKED` | 409 | OAuth account already linked to another user |
| `E_INVALID_CURRENT_PASSWORD` | 400 | Current password mismatch |
| `E_INVALID_TOKEN` | 400 | Token invalid, expired, or not found |
| `E_MAX_ATTEMPTS_EXCEEDED` | 429 | Too many token validation attempts |
| `E_RATE_LIMIT` | 429 | Too many requests |

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
