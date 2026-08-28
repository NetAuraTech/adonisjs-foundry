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
 * The set reflects the two-workspace monorepo layout (ADR-0001's
 * post-extraction composition, re-anchored under the app workspace):
 * - `package.json` (root) — the root manifest's script names vary per flavor
 *   (e.g. `test:front` drops with the Inertia tree).
 * - `README.md` (root) — flavor-specific rewrite documenting its conventions.
 * - `apps/web/AGENTS.md` — the app-workspace convention doc.
 * - `apps/web/adonisrc.ts` — provider/preload/command list varies per flavor.
 * - `apps/web/config/features.ts` — feature flags toggled off for dropped domains.
 * - `apps/web/config/database.ts` — Lucid migration `paths` drop the CMS folder.
 * - `apps/web/config/shield.ts` — CSP `frame-src` hosts for the CMS iframe block.
 * - `apps/web/config/cors.ts` — CORS policy; the `api` flavor makes it an
 *   explicit env-driven allowlist (essential for a token-guarded REST backend).
 * - `apps/web/start/{routes,events,nav,dashboard,container,transmit,sitemap,
 *   permissions,asset_middleware,env}.ts` — startup composition: each
 *   registers domain contributors, and a flavor rewrites the file to drop the
 *   registrations of pruned domains. `asset_middleware.ts` is the server
 *   middleware for the view-layer asset pipeline (Vite + Inertia); the `api`
 *   flavor rewrites it to `[]`. `env.ts` drops the variables of pruned
 *   domains and adds the flavor's own.
 * - `apps/web/.env.example` — the environment template mirrors the kept variables.
 * - `apps/web/package.json` — scripts referencing pruned tooling (e.g.
 *   `test:front`) are removed; dependency maps are pruned through the
 *   manifest's `dependencies` field.
 * - `apps/web/tsconfig.json` — a flavor that prunes the Inertia tree drops the
 *   project reference (`tsconfig.inertia.json`) and the `jsx` setting.
 *
 * Deliberate exclusions: CI workflow copies, bundler/vitest configs
 * (`vite.config.ts`, `vitest.config.ts`), repo-wide lint configs, the root
 * tsconfig, and anything inside the design-system package — those stay
 * mechanically identical across flavors: the `api` flavor prunes the whole
 * package with a single directory delete, the `inertia` flavor keeps it
 * verbatim. The root `workspaces` glob field is flavor-invariant for the same
 * reason: a glob matching nothing is valid, so no flavor narrows it.
 */
export const REWRITE_ALLOWLIST = [
	'package.json',
	'README.md',
	'apps/web/AGENTS.md',
	'apps/web/adonisrc.ts',
	'apps/web/config/features.ts',
	'apps/web/config/database.ts',
	'apps/web/config/shield.ts',
	'apps/web/config/cors.ts',
	'apps/web/start/routes.ts',
	'apps/web/start/events.ts',
	'apps/web/start/nav.ts',
	'apps/web/start/dashboard.ts',
	'apps/web/start/container.ts',
	'apps/web/start/transmit.ts',
	'apps/web/start/sitemap.ts',
	'apps/web/start/permissions.ts',
	'apps/web/start/asset_middleware.ts',
	'apps/web/start/env.ts',
	'apps/web/.env.example',
	'apps/web/package.json',
	'apps/web/tsconfig.json',
] as const;

/** Type of a single allowlisted rewrite path. */
export type RewritePath = (typeof REWRITE_ALLOWLIST)[number];

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
	path: RewritePath;
	/** Full replacement content written to the file. */
	content: string;
}

/**
 * A targeted dependency prune for one package manifest.
 *
 * The engine removes the listed package names from `dependencies`,
 * `devDependencies`, `optionalDependencies`, and `peerDependencies` of the
 * targeted manifest, then rewrites that file. Only removal is supported — a
 * manifest cannot add or rename a dependency.
 */
export interface DependencyPrune {
	/**
	 * Manifest to prune, relative to repo root. Defaults to the root
	 * `package.json` when omitted.
	 */
	file?: string;
	/** npm package names removed from every dependency map of the targeted manifest. */
	packages: string[];
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
 *   delete: ['apps/web/app/cms', 'apps/web/app/http/controllers/page', ...],
 *   rewrites: [
 *     { path: 'apps/web/start/routes.ts', content: '...' },
 *     ...
 *   ],
 *   dependencies: [{ file: 'apps/web/package.json', packages: ['@adonisjs/transmit'] }],
 * }
 */
export interface FlavorManifest {
	/** Flavor identifier — matches the branch name (`inertia`, `api`, ...). */
	flavor: string;
	/**
	 * Paths to delete, relative to repo root. Globs are not supported — every
	 * entry is a literal file or directory path. The engine fails loudly if
	 * any listed path does not exist on `main`, so a stale manifest is
	 * detected before a flavor branch is published.
	 */
	delete: string[];
	/**
	 * Allowlisted config/composition files to rewrite with full replacement
	 * content. Every `path` must appear in {@link REWRITE_ALLOWLIST}.
	 */
	rewrites: RewriteEntry[];
	/**
	 * Dependency prunes, one per targeted package manifest. Omit when a flavor
	 * keeps the full dependency set.
	 */
	dependencies?: DependencyPrune[];
}
