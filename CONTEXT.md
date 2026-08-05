# AdonisJS Foundry

A production-ready boilerplate and headless CMS: authentication, an admin panel with a visual page builder, file management, and a template system, built on a domain-driven backend.

## Language

### Content

**Page**:
A publishable unit in the CMS, identified by its `defaultLocale` and an optional homepage flag. A Page owns one or more PageTranslations and has no content of its own — all renderable content lives on its translations.
_Avoid_: Article, post, document

**PageTranslation**:
The locale-specific content of a Page: slug, title, meta fields, block tree, and publish status (draft/published/archived). A Page has exactly one PageTranslation per locale.
_Avoid_: Translation, locale version, page content

**PageRevision**:
A saved snapshot of a PageTranslation's content, created automatically before every update. A PageRevision can be restored or pinned (kept) to exclude it from auto-purge.
_Avoid_: Version, history entry, backup (this is unrelated to the Backup system)

**Block**:
A single node in a PageTranslation's content tree (one of 12 types: section, grid, flex, title, paragraph, button, separator, icon, form, field, htmltext, image). Container blocks (section, grid, form) can hold child Blocks.
_Avoid_: Component, widget, element

**Template**:
A reusable, saved Block tree — either a full `page` template (an entire layout) or a `block` template (a single pre-configured Block). Distinct from a PageRevision: a Template is intentionally saved for reuse, a Revision is an automatic safety snapshot.
_Avoid_: Layout, preset, snippet

### Collaboration (Page Builder)

**Builder Session**:
A user's active editing presence on a specific PageTranslation, tracked in the cache (Redis) with a TTL, not in the database. Ends on disconnect or timeout.
_Avoid_: Connection, editing state

**Lock**:
A short-lived (5s, heartbeat-renewed) claim on a single field of a Block within a Builder Session, preventing two editors from overwriting the same field simultaneously. Always scoped to one field, never a whole Block or Page.
_Avoid_: Mutex, claim, reservation

**Draft**:
The in-progress, unsaved content of a PageTranslation being edited live, kept in cache so late-joining editors see current state. Distinct from a PageRevision (a saved, persisted snapshot) and from the PageTranslation's own `content` column (the last persisted version).
_Avoid_: Autosave, working copy

### Files

**File**:
An uploaded asset (image, document, etc.) stored on a configured Drive disk under the `cms/` prefix, with metadata (size, mime type, dimensions for images).
_Avoid_: Asset, upload, media

**FileFolder**:
A nesting container for Files, supporting hierarchical organization. Deleting a FileFolder does not delete its Files or child folders — they move to root.
_Avoid_: Directory, category, album

**FileAlt**:
A named, per-locale alt-text entry for a File (keyed by file + locale + key), resolved at render time. Distinct from an inline alt override set directly on a Block's image props.
_Avoid_: Alt text (when referring to the inline override — use "alt override" for that case)

### Auth & Access

**User**:
An account in the system, with a Role, optional OAuth provider links, and a verification state (unverified/verified/pending invite).
_Avoid_: Account, member (Account is reserved for the settings area: credentials, not identity)

**Role**:
A named collection of Permissions assigned to Users. System roles cannot be modified or deleted.
_Avoid_: Group, team

**Permission**:
A single grantable capability (slug-based, e.g. `users.create`), assigned to Roles via a many-to-many pivot. Never assigned directly to a User.
_Avoid_: Right, scope, ability

**Token**:
A short-lived credential following the selector/validator pattern (plain-text selector for lookup, hashed validator for verification), used for password reset, email verification, email change, and pending invites. Never a session or auth token — those are handled separately by `@adonisjs/auth`.
_Avoid_: Code, OTP, link token

**Invitation**:
The admin-driven flow of creating a passwordless User and sending them a PENDING*INVITE Token to set their own password and activate the account.
\_Avoid*: Onboarding, signup link

### Operations

**Backup**:
A point-in-time database export (full or differential), stored on a Drive disk under the `backup/` prefix — entirely separate from CMS file storage and from PageRevisions.
_Avoid_: Snapshot, dump (when referring to the feature as a whole; "dump" is fine for the literal `pg_dump` step)

### Logging & Audit

**Log Entry**:
A single persisted row of the audit trail (`log_entries` table), written by `LogService` alongside its usual pino output (write-through). Carries a Level, a Category, a Message, an optional Actor, and a JSON context.
_Avoid_: Audit record, event row

**Category**:
The broad classification of a Log Entry (`auth`, `api`, `database`, `security`, `performance`, `business`, `system`), deciding both its admin tab and its persistence/retention rules. Security and business entries are always persisted.
_Avoid_: Channel, stream

**Event (slug)**:
The dot-notation identifier of a business or security occurrence embedded in a Log Entry's message (e.g. `page.published`, `user.invited`, `logs.pruned`). It answers "what happened"; the Actor answers "who".
_Avoid_: Action type, activity kind

**Actor**:
The User responsible for a Log Entry, persisted as first-class columns (`actor_id`, `actor_email`) so the trail survives user deletion (`ON DELETE SET NULL`).
_Avoid_: Author, initiator

**Retention**:
The pruning policy applied to Log Entries by the `logs:prune` command: entries older than the retention window are deleted, then the `persistence.maxEntries` soft cap is enforced (CNIL-aligned).
_Avoid_: Expiration, TTL (TTL belongs to cache entries)

## Example Dialogue

**Dev**: Should this saved layout be called a Template or a Revision?
**Domain**: Template — it's intentionally saved for reuse. A Revision is the automatic snapshot taken before every edit; the developer doesn't choose to create one.

**Dev**: Is the Draft the same as the PageTranslation's content?
**Domain**: No. The Draft is the live, unsaved in-progress state held in cache during editing. The PageTranslation's `content` column only updates once the edit is actually saved.

**Dev**: Can a Permission belong directly to a User?
**Domain**: No, only to a Role. A User's effective permissions always come through their Role.

**Dev**: Is a password reset link a session token?
**Domain**: No — it's a Token (selector/validator pattern), single-purpose and short-lived. Session/auth tokens are handled by `@adonisjs/auth`, not this Token model.
