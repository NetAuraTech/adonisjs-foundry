import '@japa/assert';
import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test } from '@japa/runner';
import { PruneEngine, REWRITE_ALLOWLIST } from '../../../../../tooling/prune/engine.js';
import type { FlavorManifest } from '../../../../../tooling/prune/types.js';

/**
 * Manifest drift seam.
 *
 * The fastest, cheapest CI check in the prune pipeline: every `delete` path in
 * every flavor manifest exists on `main`, every `rewrite` path is in the closed
 * allowlist, and no `package.json` rewrite (root or workspace) ever drifts from
 * the file main carries at the same path (version and dependency ranges). The
 * `workspaces` glob field is flavor-invariant — a glob matching nothing is
 * valid, so no flavor ever narrows it — and a workspace package that a flavor
 * deletes wholesale must be pruned from every rewritten manifest that still
 * references it (the engine's workspace-level dependency pruning), or the
 * flavor's `npm ci` breaks on a workspace package whose directory is gone.
 * Catches a renamed or deleted file — or a dependency bump
 * on main that desyncs the frozen rewrite from the lock file — before the
 * engine ever runs in a flavor job, so a stale manifest is reported at push
 * time (breaking this unit test) instead of at publication time (breaking the
 * flavor pipeline's `npm ci`).
 *
 * This suite discovers manifests dynamically from `tooling/prune/flavors/`, so
 * it stays correct as flavors are added (issues #5 and #8 will drop
 * `inertia.manifest.ts` and `api.manifest.ts` there — this test will then
 * validate them with no edits needed here).
 */

/**
 * Absolute path to the repo root, derived from this file's location
 * (`apps/web/tests/unit/prune/` → five levels up) rather than cwd, since Japa
 * now runs from the `apps/web` workspace.
 */
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '..');

/** Directory holding flavor manifest files. */
const FLAVORS_DIR = join(REPO_ROOT, 'tooling', 'prune', 'flavors');

/** Load every `*.manifest.ts` file from the flavors directory. */
async function loadAllManifests(): Promise<{ flavor: string; manifest: FlavorManifest }[]> {
	if (!existsSync(FLAVORS_DIR)) {
		return [];
	}

	const entries = await readdir(FLAVORS_DIR);
	const files = entries.filter((f) => f.endsWith('.manifest.ts'));
	const manifests: { flavor: string; manifest: FlavorManifest }[] = [];

	for (const file of files) {
		const url = pathToFileURL(join(FLAVORS_DIR, file)).href;
		const mod = (await import(url)) as Record<string, unknown>;
		const flavor = file.replace(/\.manifest\.ts$/, '');
		const exported = mod[`${flavor}Manifest`] ?? mod.default ?? mod.manifest;
		if (exported && typeof exported === 'object') {
			manifests.push({ flavor, manifest: exported as FlavorManifest });
		}
	}

	return manifests;
}

test.group('Manifest drift seam', () => {
	test('every delete path in every manifest exists on main', async ({ assert }) => {
		const manifests = await loadAllManifests();

		if (manifests.length === 0) {
			assert.isTrue(true, 'no flavor manifests yet — drift seam is a no-op until #5/#8');
			return;
		}

		const missing: { flavor: string; path: string }[] = [];
		for (const { flavor, manifest } of manifests) {
			for (const relPath of manifest.delete) {
				if (!existsSync(join(REPO_ROOT, relPath))) {
					missing.push({ flavor, path: relPath });
				}
			}
		}

		assert.deepEqual(
			missing,
			[],
			`stale delete paths found — update the manifest(s):\n` +
				missing.map((m) => `  - [${m.flavor}] ${m.path}`).join('\n'),
		);
	});

	test('every rewrite path in every manifest is in the closed allowlist', async ({ assert }) => {
		const manifests = await loadAllManifests();
		const allowlist = new Set(REWRITE_ALLOWLIST);

		if (manifests.length === 0) {
			assert.isTrue(true, 'no flavor manifests yet — allowlist seam is a no-op until #5/#8');
			return;
		}

		const disallowed: { flavor: string; path: string }[] = [];
		for (const { flavor, manifest } of manifests) {
			for (const rewrite of manifest.rewrites) {
				if (!allowlist.has(rewrite.path)) {
					disallowed.push({ flavor, path: rewrite.path });
				}
			}
		}

		assert.deepEqual(
			disallowed,
			[],
			`non-allowlisted rewrites found — only config/composition files may be rewritten:\n` +
				disallowed.map((d) => `  - [${d.flavor}] ${d.path}`).join('\n'),
		);
	});

	test('the engine validates every manifest against main without error', async ({ assert }) => {
		const manifests = await loadAllManifests();

		if (manifests.length === 0) {
			assert.isTrue(true, 'no flavor manifests yet — engine validation is a no-op until #5/#8');
			return;
		}

		const engine = new PruneEngine();
		for (const { manifest } of manifests) {
			engine.validate(REPO_ROOT, manifest);
		}

		assert.isTrue(true, 'all manifests pass engine validation against main');
	});

	test('every package.json rewrite never drifts from main', async ({ assert }) => {
		const manifests = await loadAllManifests();

		if (manifests.length === 0) {
			assert.isTrue(true, 'no flavor manifests yet — package.json drift seam is a no-op until #5/#8');
			return;
		}

		const drifted: { flavor: string; detail: string }[] = [];
		for (const { flavor, manifest } of manifests) {
			for (const rewrite of manifest.rewrites) {
				if (rewrite.path !== 'package.json' && !rewrite.path.endsWith('/package.json')) {
					continue;
				}

				const mainPkg = JSON.parse(readFileSync(join(REPO_ROOT, rewrite.path), 'utf8')) as {
					version: string;
					dependencies?: Record<string, string>;
					devDependencies?: Record<string, string>;
				};
				const parsed = JSON.parse(rewrite.content) as {
					version?: string;
					dependencies?: Record<string, string>;
					devDependencies?: Record<string, string>;
				};

				if (parsed.version !== mainPkg.version) {
					drifted.push({
						flavor,
						detail: `${rewrite.path}: version is ${parsed.version ?? '(missing)'} (main is ${mainPkg.version})`,
					});
				}

				// The flavor pipeline runs `npm ci` with main's lock file, so every range
				// in the frozen rewrite must still be satisfied by it: the rewrite may
				// omit packages main no longer (or never) needs in that flavor, but it may
				// never carry a range main has since bumped — that is exactly what breaks
				// the flavor's install.
				for (const label of ['dependencies', 'devDependencies'] as const) {
					const rewriteDeps = parsed[label] ?? {};
					const mainDeps = mainPkg[label] ?? {};
					for (const [name, range] of Object.entries(rewriteDeps)) {
						if (!(name in mainDeps)) {
							drifted.push({
								flavor,
								detail: `${rewrite.path}: ${label}.${name} is not a dependency on main anymore`,
							});
						} else if (mainDeps[name] !== range) {
							drifted.push({
								flavor,
								detail: `${rewrite.path}: ${label}.${name} is ${range} (main is ${mainDeps[name]})`,
							});
						}
					}
				}
			}
		}

		assert.deepEqual(
			drifted,
			[],
			'every package.json rewrite must stay in sync with main — update the manifest when main bumps its version or dependency ranges:\n' +
				drifted.map((d) => `  - [${d.flavor}] ${d.detail}`).join('\n'),
		);
	});

	test('the workspaces glob field is flavor-invariant', async ({ assert }) => {
		const manifests = await loadAllManifests();

		if (manifests.length === 0) {
			assert.isTrue(true, 'no flavor manifests yet — workspaces seam is a no-op until #5/#8');
			return;
		}

		// The root workspaces manifest is the monorepo's composition surface: a
		// flavor that deletes a whole package directory (e.g. the headless flavor
		// deleting the design-system package) must keep main's globs verbatim,
		// because a glob matching nothing is valid. Narrowing the globs per
		// flavor would make the root rewrite diverge from main for no install
		// benefit and would silently un-link future packages added to main.
		const narrowed: { flavor: string; detail: string }[] = [];
		for (const { flavor, manifest } of manifests) {
			for (const rewrite of manifest.rewrites) {
				if (rewrite.path !== 'package.json' && !rewrite.path.endsWith('/package.json')) {
					continue;
				}

				const mainPkg = JSON.parse(readFileSync(join(REPO_ROOT, rewrite.path), 'utf8')) as {
					workspaces?: string[];
				};
				if (!Array.isArray(mainPkg.workspaces)) {
					continue;
				}

				const parsed = JSON.parse(rewrite.content) as { workspaces?: unknown };
				if (JSON.stringify(parsed.workspaces ?? null) !== JSON.stringify(mainPkg.workspaces)) {
					narrowed.push({
						flavor,
						detail:
							`${rewrite.path}: workspaces is ` +
							`${JSON.stringify(parsed.workspaces ?? null)} (main is ${JSON.stringify(mainPkg.workspaces)}) — ` +
							"keep main's globs verbatim; a glob matching nothing is valid",
					});
				}
			}
		}

		assert.deepEqual(
			narrowed,
			[],
			"the workspaces glob field is flavor-invariant — restore main's globs in the rewrite:\n" +
				narrowed.map((d) => `  - [${d.flavor}] ${d.detail}`).join('\n'),
		);
	});

	test('a deleted workspace package is pruned from every rewritten manifest that references it', async ({ assert }) => {
		const manifests = await loadAllManifests();

		if (manifests.length === 0) {
			assert.isTrue(true, 'no flavor manifests yet — package-removal seam is a no-op until #5/#8');
			return;
		}

		// A flavor may delete a workspace package wholesale (a `delete` entry
		// whose directory carries a `package.json` on main). The frozen
		// rewrites are snapshots of main, so they still list the dependency —
		// the engine removes it through the manifest's `dependencies` prune.
		// Simulate that prune per rewritten manifest and fail if a deleted
		// package survives in any dependency map: the flavor's `npm ci` would
		// then try to resolve a workspace package whose directory is gone.
		const depMaps = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'] as const;
		const violations: { flavor: string; detail: string }[] = [];

		for (const { flavor, manifest } of manifests) {
			const removedPackages = new Map<string, string[]>();
			for (const relPath of manifest.delete) {
				const pkgFile = join(REPO_ROOT, relPath, 'package.json');
				if (!existsSync(pkgFile)) {
					continue;
				}
				const name = (JSON.parse(readFileSync(pkgFile, 'utf8')) as { name?: string }).name;
				if (name) {
					removedPackages.set(name, [...(removedPackages.get(name) ?? []), relPath]);
				}
			}
			if (removedPackages.size === 0) {
				continue;
			}

			for (const rewrite of manifest.rewrites) {
				if (rewrite.path !== 'package.json' && !rewrite.path.endsWith('/package.json')) {
					continue;
				}

				const frozen = JSON.parse(rewrite.content) as Record<string, Record<string, string> | undefined>;
				const referenced = [...removedPackages.keys()].filter((name) =>
					depMaps.some((map) => frozen[map]?.[name] !== undefined),
				);
				if (referenced.length === 0) {
					continue;
				}

				// Apply the manifest's dependency prunes targeting this exact
				// file, mirroring the engine's behavior (default file is the
				// root manifest).
				const pruned: Record<string, Record<string, string>> = {};
				for (const map of depMaps) {
					pruned[map] = { ...(frozen[map] ?? {}) };
				}
				for (const entry of manifest.dependencies ?? []) {
					if ((entry.file ?? 'package.json') !== rewrite.path) {
						continue;
					}
					for (const name of entry.packages) {
						for (const map of depMaps) {
							delete pruned[map][name];
						}
					}
				}

				for (const name of referenced) {
					if (depMaps.some((map) => pruned[map][name] !== undefined)) {
						violations.push({
							flavor,
							detail:
								`${rewrite.path}: still references "${name}" after the dependency prune, ` +
								`but the flavor deletes ${removedPackages.get(name)?.join(', ')} — ` +
								"add the package to the manifest's `dependencies` entry for this file",
						});
					}
				}
			}
		}

		assert.deepEqual(
			violations,
			[],
			'a flavor that deletes a workspace package must prune its dependency from every rewritten manifest that references it:\n' +
				violations.map((v) => `  - [${v.flavor}] ${v.detail}`).join('\n'),
		);
	});
});
