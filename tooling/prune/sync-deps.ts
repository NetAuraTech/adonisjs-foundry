import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { FlavorManifest } from '#prune/types';

/**
 * Flavor manifest dependency sync.
 *
 * A flavor manifest freezes a full replacement `package.json` (root and
 * workspace) so the pruned flavor carries its own scripts and dependency set.
 * The frozen copy is a snapshot of `main`, so every dependency range and the
 * `version` field inside it go stale the moment `main` bumps them — and the
 * `manifest_drift` unit test fails on that staleness. This script closes that
 * gap mechanically: for every `package.json` rewrite in every flavor manifest
 * it rewrites the frozen ranges (and `version`) to match the live file `main`
 * carries at the same path.
 *
 * Standalone Node script (not an ace command). It is dependency-free — it only
 * reads the manifest and the live `package.json` files and rewrites the frozen
 * range tokens in the manifest source — so it runs without an `npm ci`. The
 * manifest files are imported natively (Node 24 type stripping erases the
 * type-only `#prune/types` import), so no TS loader is required. Run from the
 * repo root:
 *
 *   node tooling/prune/sync-deps.ts [--root <path>] [--dry-run]
 *
 * The rewrite is surgical: only the `"<name>": "<range>"` and
 * `"<version>": "<version>"` tokens inside the targeted rewrite's `content`
 * block change, so every comment, the frozen scripts, and the file's line
 * endings are preserved verbatim. A frozen dependency that `main` no longer
 * carries is never removed automatically (dropping a dependency is a curation
 * decision); it is reported as a manual-review item and left to the drift
 * test to surface.
 *
 * Exits non-zero only on an internal inconsistency (a rewrite block that could
 * not be located, or a frozen token that is no longer present in the source),
 * never on a plain range drift.
 */

/** Parsed CLI arguments. */
interface CliArgs {
	root: string;
	dryRun: boolean;
}

/** The subset of a `package.json` the drift seam constrains. */
interface PkgManifest {
	version?: string;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
}

/** One token replacement, scoped to a single rewrite's content block. */
interface TokenChange {
	search: string;
	replace: string;
}

/** A frozen dependency `main` no longer carries — needs a human decision. */
interface ManualReview {
	flavor: string;
	file: string;
	/** Dependency coordinate as `scope.name` (e.g. `dependencies.react`). */
	coordinate: string;
}

/** Print usage to stderr and exit with code 2 (usage error). */
function printUsageAndExit(): never {
	process.stderr.write(
		[
			'Usage: node tooling/prune/sync-deps.ts [--root <path>] [--dry-run]',
			'',
			'Options:',
			'  --root <path>   Repo root to sync. Defaults to the current working directory.',
			'  --dry-run       Report planned token changes without modifying any manifest.',
			'',
		].join('\n'),
	);
	process.exit(2);
}

/** Parse argv into a CliArgs object. */
function parseArgs(argv: string[]): CliArgs {
	let root = process.cwd();
	let dryRun = false;

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--root') {
			const next = argv[i + 1];
			if (!next) {
				process.stderr.write('error: --root requires a value\n');
				process.exit(2);
			}
			root = resolve(next);
			i++;
		} else if (arg === '--dry-run') {
			dryRun = true;
		} else if (arg === '--help' || arg === '-h') {
			printUsageAndExit();
		} else if (arg.startsWith('--')) {
			process.stderr.write(`error: unknown option ${arg}\n`);
			process.exit(2);
		}
	}

	return { root, dryRun };
}

/** Resolve the flavors directory under the repo root. */
function flavorsDir(root: string): string {
	return join(root, 'tooling', 'prune', 'flavors');
}

/** Load a flavor manifest by dynamic import of its `.ts` file. */
async function loadManifest(file: string, flavor: string): Promise<FlavorManifest> {
	const url = pathToFileURL(file).href;
	const mod = (await import(url)) as Record<string, unknown>;
	const exported = mod[`${flavor}Manifest`] ?? mod.default ?? mod.manifest;
	if (!exported || typeof exported !== 'object') {
		process.stderr.write(
			`error: manifest "${file}" did not export a FlavorManifest ` +
				`(expected export \`${flavor}Manifest\`, \`default\`, or \`manifest\`).\n`,
		);
		process.exit(1);
	}
	return exported as FlavorManifest;
}

/** Locate a rewrite's `content: [ … ].join('\n')` block in the manifest source. */
function locateContentBlock(source: string, rewritePath: string): { start: number; end: number } {
	const pathIdx = source.indexOf(`path: '${rewritePath}'`);
	if (pathIdx === -1) {
		process.stderr.write(`error: rewrite path '${rewritePath}' not found in manifest source\n`);
		process.exit(1);
	}

	const start = source.indexOf('content: [', pathIdx);
	if (start === -1) {
		process.stderr.write(`error: no content block follows path '${rewritePath}'\n`);
		process.exit(1);
	}

	const marker = "].join('\\n')";
	const markerIdx = source.indexOf(marker, start);
	if (markerIdx === -1) {
		process.stderr.write(`error: unterminated content block for path '${rewritePath}'\n`);
		process.exit(1);
	}

	return { start, end: markerIdx + marker.length };
}

/** Compute the token changes that bring one frozen rewrite in line with `main`. */
function computeChanges(frozen: PkgManifest, live: PkgManifest): { changes: TokenChange[]; stale: string[] } {
	const changes: TokenChange[] = [];
	const stale: string[] = [];

	if (frozen.version && live.version && frozen.version !== live.version) {
		changes.push({
			search: `"version": "${frozen.version}"`,
			replace: `"version": "${live.version}"`,
		});
	}

	for (const scope of ['dependencies', 'devDependencies'] as const) {
		const frozenDeps = frozen[scope] ?? {};
		const liveDeps = live[scope] ?? {};
		for (const [name, frozenRange] of Object.entries(frozenDeps)) {
			if (!(name in liveDeps)) {
				stale.push(`${scope}.${name}`);
				continue;
			}
			if (liveDeps[name] !== frozenRange) {
				changes.push({
					search: `"${name}": "${frozenRange}"`,
					replace: `"${name}": "${liveDeps[name]}"`,
				});
			}
		}
	}

	return { changes, stale };
}

/** Main entrypoint — sync every flavor manifest against the live package.json files. */
async function main(): Promise<void> {
	const { root, dryRun } = parseArgs(process.argv.slice(2));
	const dir = flavorsDir(root);

	if (!existsSync(dir)) {
		process.stdout.write(`no flavor manifests under ${dir} — nothing to sync.\n`);
		return;
	}

	const files = readdirSync(dir)
		.filter((f) => f.endsWith('.manifest.ts'))
		.sort();
	if (files.length === 0) {
		process.stdout.write('no flavor manifests yet — nothing to sync.\n');
		return;
	}

	let totalChanges = 0;
	const allReviews: ManualReview[] = [];

	for (const file of files) {
		const flavor = file.replace(/\.manifest\.ts$/, '');
		const manifestFile = join(dir, file);
		const manifest = await loadManifest(manifestFile, flavor);

		let source = readFileSync(manifestFile, 'utf8');
		const original = source;
		let fileChanges = 0;

		for (const rewrite of manifest.rewrites) {
			if (rewrite.path !== 'package.json' && !rewrite.path.endsWith('/package.json')) {
				continue;
			}

			const livePath = join(root, rewrite.path);
			if (!existsSync(livePath)) {
				process.stderr.write(`error: [${flavor}] live file ${rewrite.path} not found under ${root}\n`);
				process.exit(1);
			}

			const live = JSON.parse(readFileSync(livePath, 'utf8')) as PkgManifest;
			const frozen = JSON.parse(rewrite.content) as PkgManifest;
			const { changes, stale } = computeChanges(frozen, live);

			for (const coordinate of stale) {
				allReviews.push({ flavor, file: rewrite.path, coordinate });
			}
			if (changes.length === 0) {
				continue;
			}

			const block = locateContentBlock(source, rewrite.path);
			let blockText = source.slice(block.start, block.end);
			for (const change of changes) {
				if (!blockText.includes(change.search)) {
					process.stderr.write(
						`error: [${flavor}] frozen token ${change.search} not present in the ` +
							`content block of ${rewrite.path} — the manifest format changed, aborting.\n`,
					);
					process.exit(1);
				}
				blockText = blockText.split(change.search).join(change.replace);
			}
			source = source.slice(0, block.start) + blockText + source.slice(block.end);
			fileChanges += changes.length;
		}

		if (source !== original) {
			if (!dryRun) {
				writeFileSync(manifestFile, source, 'utf8');
			}
			totalChanges += fileChanges;
			process.stdout.write(`[${flavor}] ${dryRun ? 'would sync' : 'synced'} ${fileChanges} token(s) in ${file}\n`);
		}
	}

	if (totalChanges === 0 && allReviews.length === 0) {
		process.stdout.write('all flavor manifests already in sync with main — nothing to do.\n');
		return;
	}

	if (allReviews.length > 0) {
		process.stdout.write(
			[
				'',
				'manual review required — these frozen dependencies are no longer on main',
				'(the drift test will fail until a human decides to drop or re-add them):',
				...allReviews.map((r) => `  - [${r.flavor}] ${r.file} :: ${r.coordinate}`),
				'',
			].join('\n'),
		);
	}
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	process.stderr.write(`sync-deps failed: ${message}\n`);
	process.exit(1);
});
