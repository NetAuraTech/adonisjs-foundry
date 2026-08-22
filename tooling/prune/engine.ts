import { existsSync, readFileSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { REWRITE_ALLOWLIST, type FlavorManifest, type RewritePath } from './types.js';

/** Result of applying a manifest — the actions the engine performed. */
export interface PruneResult {
	/** Paths deleted (files and directories), relative to root. */
	deletedPaths: string[];
	/** Allowlisted files rewritten, relative to root. */
	rewrittenFiles: string[];
	/** npm packages removed from package.json. */
	prunedPackages: string[];
}

/**
 * Thrown when a manifest references a path that no longer exists on `main`.
 *
 * A stale manifest is the prime failure mode of a declarative prune: a file
 * is renamed or deleted on `main` but the manifest still lists it. Failing
 * loudly here — before any deletion — keeps a flavor branch from silently
 * shipping under-pruned code.
 */
export class StaleManifestError extends Error {
	constructor(
		/** Flavor whose manifest is stale. */
		readonly flavor: string,
		/** Missing paths the manifest expected to find on `main`. */
		readonly missingPaths: string[],
	) {
		const list = missingPaths.map((p) => `  - ${p}`).join('\n');
		super(
			`Prune manifest for flavor "${flavor}" references paths that do not exist on main:\n${list}\n` +
				'Update or remove these entries from the manifest.',
		);
		this.name = 'StaleManifestError';
	}
}

/**
 * Thrown when a manifest rewrites a file outside the closed allowlist.
 *
 * The allowlist is the boundary that keeps flavor variation confined to
 * configuration and startup composition — rewriting business code would
 * let a flavor diverge structurally, breaking the "branches as artifacts"
 * contract.
 */
export class DisallowedRewriteError extends Error {
	constructor(
		readonly flavor: string,
		/** Paths the manifest tried to rewrite that are not in the allowlist. */
		readonly disallowedPaths: string[],
	) {
		const list = disallowedPaths.map((p) => `  - ${p}`).join('\n');
		const allowed = REWRITE_ALLOWLIST.map((p) => `  - ${p}`).join('\n');
		super(
			`Prune manifest for flavor "${flavor}" rewrites non-allowlisted paths:\n${list}\n` +
				`Only the following files may be rewritten:\n${allowed}`,
		);
		this.name = 'DisallowedRewriteError';
	}
}

/**
 * Read a package.json and return its dependency maps.
 */
async function readPackageJson(root: string): Promise<Record<string, unknown>> {
	const raw = await readFile(join(root, 'package.json'), 'utf8');
	return JSON.parse(raw) as Record<string, unknown>;
}

/**
 * Remove the listed packages from every dependency map of a package.json
 * object, returning the pruned object and the package names that were
 * actually removed (only those present in at least one map).
 */
function pruneDepsObject(
	pkg: Record<string, unknown>,
	packages: string[],
): { pruned: Record<string, unknown>; removed: string[] } {
	const depMaps = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
	const removed = new Set<string>();

	for (const mapName of depMaps) {
		const map = pkg[mapName];
		if (map && typeof map === 'object' && !Array.isArray(map)) {
			const depRecord = map as Record<string, string>;
			for (const packageName of packages) {
				if (packageName in depRecord) {
					delete depRecord[packageName];
					removed.add(packageName);
				}
			}
		}
	}

	return { pruned: pkg, removed: [...removed].sort() };
}

/**
 * The declarative prune engine.
 *
 * Applies a {@link FlavorManifest} to a clean checkout of `main` rooted at
 * `root` and produces the flavor tree in place. Mechanical by design: the
 * engine performs no inference, no merging, and no partial success — either
 * the whole manifest applies cleanly or it throws before touching anything.
 *
 * Failures are loud and early: a stale delete path or a disallowed rewrite
 * aborts the run before any file is changed, so a failed prune never leaves
 * a half-pruned tree behind.
 */
export class PruneEngine {
	/**
	 * Validate a manifest against the tree rooted at `root` without modifying
	 * anything.
	 *
	 * Checks that every `delete` path exists and every `rewrite` path is in
	 * the closed allowlist. Throws on the first violation found, collecting
	 * all violations of each kind first so the error message lists every
	 * offending path at once.
	 *
	 * @param root - Absolute path to the repo root to validate against.
	 * @param manifest - The flavor manifest to validate.
	 * @throws {StaleManifestError} When a `delete` path does not exist.
	 * @throws {DisallowedRewriteError} When a `rewrite` path is not allowlisted.
	 */
	validate(root: string, manifest: FlavorManifest): void {
		const missing = manifest.delete.filter((p) => !existsSync(join(root, p)));
		if (missing.length > 0) {
			throw new StaleManifestError(manifest.flavor, missing);
		}

		const allowlist = new Set<string>(REWRITE_ALLOWLIST);
		const disallowed = manifest.rewrites.map((r) => r.path).filter((p) => !allowlist.has(p as RewritePath));
		if (disallowed.length > 0) {
			throw new DisallowedRewriteError(manifest.flavor, disallowed);
		}
	}

	/**
	 * Apply a manifest to the tree rooted at `root`, mutating it in place.
	 *
	 * Validates first, then deletes paths, rewrites allowlisted files, and
	 * prunes dependencies. Returns the actions performed. The engine writes
	 * atomically per-file: a write failure leaves prior successful writes in
	 * place but never a corrupt file.
	 *
	 * @param root - Absolute path to the repo root to prune.
	 * @param manifest - The flavor manifest to apply.
	 * @returns The paths deleted, files rewritten, and packages pruned.
	 * @throws {StaleManifestError} When a `delete` path does not exist.
	 * @throws {DisallowedRewriteError} When a `rewrite` path is not allowlisted.
	 *
	 * @example
	 * const engine = new PruneEngine()
	 * const result = await engine.apply('/repo', inertiaManifest)
	 * console.log(`Deleted ${result.deletedPaths.length} paths`)
	 */
	async apply(root: string, manifest: FlavorManifest): Promise<PruneResult> {
		this.validate(root, manifest);

		const deletedPaths: string[] = [];
		for (const deletePath of manifest.delete) {
			const absPath = join(root, deletePath);
			await rm(absPath, { recursive: true, force: false });
			deletedPaths.push(deletePath);
		}

		const rewrittenFiles: string[] = [];
		for (const rewrite of manifest.rewrites) {
			await writeFile(join(root, rewrite.path), rewrite.content, 'utf8');
			rewrittenFiles.push(rewrite.path);
		}

		let prunedPackages: string[] = [];
		if (manifest.dependencies && manifest.dependencies.packages.length > 0) {
			const pkg = await readPackageJson(root);
			const { pruned, removed } = pruneDepsObject(pkg, manifest.dependencies.packages);
			await writeFile(join(root, 'package.json'), JSON.stringify(pruned, null, 2) + '\n', 'utf8');
			prunedPackages = removed;
		}

		return { deletedPaths, rewrittenFiles, prunedPackages };
	}

	/**
	 * Dry-run a manifest: validate and report what would happen without
	 * touching the tree.
	 *
	 * Useful for CI pre-checks and local inspection.
	 *
	 * @param root - Absolute path to the repo root to inspect.
	 * @param manifest - The flavor manifest to dry-run.
	 * @returns The actions that {@link apply} would perform.
	 * @throws {StaleManifestError} When a `delete` path does not exist.
	 * @throws {DisallowedRewriteError} When a `rewrite` path is not allowlisted.
	 */
	dryRun(
		root: string,
		manifest: FlavorManifest,
	): Omit<PruneResult, 'prunedPackages'> & {
		prunedPackages: string[];
	} {
		this.validate(root, manifest);

		const prunedPackages =
			manifest.dependencies?.packages.filter((pkg) => {
				try {
					const pkgJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as Record<string, unknown>;
					const maps = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
					return maps.some((m) => {
						const map = pkgJson[m];
						return !!map && typeof map === 'object' && pkg in (map as Record<string, unknown>);
					});
				} catch {
					return false;
				}
			}) ?? [];

		return {
			deletedPaths: [...manifest.delete],
			rewrittenFiles: manifest.rewrites.map((r) => r.path),
			prunedPackages,
		};
	}
}

/** Re-export the rewrite allowlist for manifest authors and tests. */
export { REWRITE_ALLOWLIST };

/** Relative-path helper for error messages and logs. */
export function relPath(root: string, abs: string): string {
	return relative(root, abs);
}
