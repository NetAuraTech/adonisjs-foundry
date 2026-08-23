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
 * the file main carries at the same path (version and dependency ranges).
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
});
