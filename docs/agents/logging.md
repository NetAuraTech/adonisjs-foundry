# Logging

All structured logging goes through a central `LogService`, injected via DI (`@inject()`). Never call the raw logger directly from services or controllers — always go through `LogService`.

## Generic levels

`logService.debug/info/warn/error/fatal(entry)` — use for raw, level-driven logging without a specific domain meaning. `entry` accepts `message`, `category`, `context`, `metadata`, and optionally `error`.

## Domain-specific helpers (preferred over generic levels)

| Method | Category | Use for |
|---|---|---|
| `logAuth(action, context)` | AUTH | Login, registration, logout, token verification — dot-notation action (e.g. `login.success`, `social.linked`) |
| `logSecurity(message, context, level?)` | SECURITY | Suspicious activity, access violations, anything needing an audit trail. Defaults to WARN. |
| `logBusiness(event, context, metadata?)` | BUSINESS | Meaningful domain actions worth auditing or analytics (e.g. `page.created`, `template.applied`) |
| `logApiRequest(ctx, duration?)` | API | One call per HTTP request, typically from middleware |
| `logQuery(query, duration, context?)` | DATABASE | Raw SQL logging; auto-escalates to WARN above 1000ms |
| `logPerformance(operation, duration, context?)` | PERFORMANCE | Any measured operation; auto-escalates to WARN above 5000ms |

Prefer the domain helper that matches your context over calling `info`/`warn` directly — it standardizes the category and keeps log filtering meaningful.

## Context shape

Always pass a context object with at least `{ userId, userEmail }` when the action is tied to a user. Use `logService.extractContext(ctx)` inside a controller to build this from `HttpContext` automatically.

## Conventions

- Action/event identifiers use dot-notation: `domain.action` or `domain.action.result` (e.g. `register.failed.email_exists`, `email_verification.confirmed`).
- Log on every meaningful mutation (create/update/delete with business impact), not on every read.
- `metadata` is for additional structured detail not part of the standard context (e.g. `{ fileId, filename }`); don't put PII there that isn't already in `context`.
- Sensitive values (tokens, passwords) must never be logged in plain text — see `maskToken`-style helpers when logging anything token-related.