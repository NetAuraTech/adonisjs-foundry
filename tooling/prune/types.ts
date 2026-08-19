/**
 * Declarative prune pipeline — manifest schema and rewrite allowlist.
 *
 * A flavor manifest describes how to derive a flavor tree from a clean
 * checkout of `main`: which paths to delete, which allowlisted
 * config/composition files to rewrite, and which dependencies to prune.
 * The engine ({@link './engine'}) applies a manifest mechanically and fails
 * loudly when a referenced path no longer exists, so a stale manifest is
 * detected immediately instead of silently under-pruning a flavor branch.
 *
 * Only deletions, allowlisted-file rewrites, and dependency pruning are
 * supported — business code can never diverge per flavor by construction.
 */

/**
 * Files a flavor manifest may rewrite.
 *
 * Closed and versioned on `main`: only paths listed here can appear in a
 * manifest's `rewrite` map. This is the boundary that keeps flavor
 * variation confined to configuration and startup composition — never
 * business code. A path not in this set referenced by a manifest is a
 * validation error, caught before the engine runs.
 *
 * The set reflects ADR-0001's post-extraction composition layout:
 * - `adonisrc.ts` — provider/preload/command list varies per flavor.
 * - `config/features.ts` — feature flags toggled off for dropped domains.
 * - `config/database.ts` — Lucid migration `paths` drop the CMS folder.
 * - `config/shield.ts` — CSP `frame-src` hosts for the CMS iframe block.
 * - `start/{routes,events,nav,dashboard,container,transmit,sitemap,permissions}.ts`
 *   — startup composition: each registers domain contributors, and a flavor
 *   rewrites the file to drop the registrations of pruned domains.
 * - `start/asset_middleware.ts` — the server middleware for the view-layer
 *   asset pipeline (Vite + Inertia); the `api` flavor rewrites it to `[]`.
 * - `config/cors.ts` — CORS policy; the `api` flavor makes it an explicit
 *   env-driven allowlist (essential for a token-guarded REST backend).
 * - `start/env.ts` — environment validation; a flavor drops the variables of
 *   its pruned domains (e.g. the CMS content-policy vars) and adds its own.
 * - `.env.example` — the environment template mirrors the kept variables.
 * - `package.json` — scripts referencing pruned tooling (e.g. the Inertia
 *   typecheck, front Vitest) are removed; dependency maps are pruned through
 *   the manifest's `dependencies` field.
 * - `tsconfig.json` — a flavor that prunes the Inertia tree drops the
 *   project reference (`tsconfig.inertia.json`) and the `jsx` setting.
 * - `README.md` — flavor-specific rewrite documenting its conventions.
 */
export const REWRITE_ALLOWLIST = [
  'adonisrc.ts',
  'config/features.ts',
  'config/database.ts',
  'config/shield.ts',
  'config/cors.ts',
  'start/routes.ts',
  'start/events.ts',
  'start/nav.ts',
  'start/dashboard.ts',
  'start/container.ts',
  'start/transmit.ts',
  'start/sitemap.ts',
  'start/permissions.ts',
  'start/asset_middleware.ts',
  'start/env.ts',
  '.env.example',
  'package.json',
  'tsconfig.json',
  'README.md',
] as const

/** Type of a single allowlisted rewrite path. */
export type RewritePath = (typeof REWRITE_ALLOWLIST)[number]

/**
 * A rewrite entry: the full replacement content for one allowlisted file.
 *
 * The manifest supplies the file's complete post-prune content — the engine
 * overwrites the file verbatim, never merges. Keeping the replacement
 * declarative (a full file) means the flavor tree is reproducible from the
 * manifest alone, with no hidden engine logic.
 */
export interface RewriteEntry {
  /** Allowlisted path of the file to overwrite, relative to repo root. */
  path: RewritePath
  /** Full replacement content written to the file. */
  content: string
}

/**
 * A dependency to prune from `package.json`.
 *
 * The engine removes the listed package names from `dependencies`,
 * `devDependencies`, `optionalDependencies`, and `peerDependencies` of the
 * flavor's `package.json`, then rewrites the file. Only removal is
 * supported — a manifest cannot add or rename a dependency.
 */
export interface DependencyPrune {
  /** npm package names removed from every dependency map of package.json. */
  packages: string[]
}

/**
 * One flavor manifest.
 *
 * Describes how to derive a flavor from a clean checkout of `main`. Every
 * field is declarative and mechanical: the engine performs no inference.
 *
 * @example
 * const inertiaManifest: FlavorManifest = {
 *   flavor: 'inertia',
 *   delete: ['app/cms', 'app/http/controllers/page', ...],
 *   rewrites: [
 *     { path: 'start/routes.ts', content: '...' },
 *     ...
 *   ],
 *   dependencies: { packages: ['@adonisjs/transmit'] },
 * }
 */
export interface FlavorManifest {
  /** Flavor identifier — matches the branch name (`inertia`, `api`, ...). */
  flavor: string
  /**
   * Paths to delete, relative to repo root. Globs are not supported — every
   * entry is a literal file or directory path. The engine fails loudly if
   * any listed path does not exist on `main`, so a stale manifest is
   * detected before a flavor branch is published.
   */
  delete: string[]
  /**
   * Allowlisted config/composition files to rewrite with full replacement
   * content. Every `path` must appear in {@link REWRITE_ALLOWLIST}.
   */
  rewrites: RewriteEntry[]
  /**
   * Dependencies to prune from `package.json`. Omit when a flavor keeps the
   * full dependency set.
   */
  dependencies?: DependencyPrune
}
