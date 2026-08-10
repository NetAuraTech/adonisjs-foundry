import { test } from '@japa/runner'
import { existsSync, readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PruneEngine, REWRITE_ALLOWLIST } from '#prune/engine'
import type { FlavorManifest } from '#prune/types'

/**
 * Manifest drift seam.
 *
 * The fastest, cheapest CI check in the prune pipeline: every `delete` path in
 * every flavor manifest exists on `main`, and every `rewrite` path is in the
 * closed allowlist. Catches a renamed or deleted file before the engine ever
 * runs in a flavor job — so a stale manifest is reported at push time, not
 * when a flavor branch silently under-prunes.
 *
 * This suite discovers manifests dynamically from `tooling/prune/flavors/`, so
 * it stays correct as flavors are added (issues #5 and #8 will drop
 * `inertia.manifest.ts` and `api.manifest.ts` there — this test will then
 * validate them with no edits needed here).
 */

/** Absolute path to the repo root (cwd when Japa runs from the repo root). */
const REPO_ROOT = process.cwd()

/** Directory holding flavor manifest files. */
const FLAVORS_DIR = join(REPO_ROOT, 'tooling', 'prune', 'flavors')

/** Load every `*.manifest.ts` file from the flavors directory. */
async function loadAllManifests(): Promise<{ flavor: string; manifest: FlavorManifest }[]> {
  if (!existsSync(FLAVORS_DIR)) {
    return []
  }

  const entries = await readdir(FLAVORS_DIR)
  const files = entries.filter((f) => f.endsWith('.manifest.ts'))
  const manifests: { flavor: string; manifest: FlavorManifest }[] = []

  for (const file of files) {
    const url = pathToFileURL(join(FLAVORS_DIR, file)).href
    const mod = (await import(url)) as Record<string, unknown>
    const flavor = file.replace(/\.manifest\.ts$/, '')
    const exported = mod[`${flavor}Manifest`] ?? mod.default ?? mod.manifest
    if (exported && typeof exported === 'object') {
      manifests.push({ flavor, manifest: exported as FlavorManifest })
    }
  }

  return manifests
}

test.group('Manifest drift seam', () => {
  test('every delete path in every manifest exists on main', async ({ assert }) => {
    const manifests = await loadAllManifests()

    if (manifests.length === 0) {
      assert.isTrue(true, 'no flavor manifests yet — drift seam is a no-op until #5/#8')
      return
    }

    const missing: { flavor: string; path: string }[] = []
    for (const { flavor, manifest } of manifests) {
      for (const relPath of manifest.delete) {
        if (!existsSync(join(REPO_ROOT, relPath))) {
          missing.push({ flavor, path: relPath })
        }
      }
    }

    assert.deepEqual(
      missing,
      [],
      `stale delete paths found — update the manifest(s):\n` +
        missing.map((m) => `  - [${m.flavor}] ${m.path}`).join('\n')
    )
  })

  test('every rewrite path in every manifest is in the closed allowlist', async ({ assert }) => {
    const manifests = await loadAllManifests()
    const allowlist = new Set(REWRITE_ALLOWLIST)

    if (manifests.length === 0) {
      assert.isTrue(true, 'no flavor manifests yet — allowlist seam is a no-op until #5/#8')
      return
    }

    const disallowed: { flavor: string; path: string }[] = []
    for (const { flavor, manifest } of manifests) {
      for (const rewrite of manifest.rewrites) {
        if (!allowlist.has(rewrite.path)) {
          disallowed.push({ flavor, path: rewrite.path })
        }
      }
    }

    assert.deepEqual(
      disallowed,
      [],
      `non-allowlisted rewrites found — only config/composition files may be rewritten:\n` +
        disallowed.map((d) => `  - [${d.flavor}] ${d.path}`).join('\n')
    )
  })

  test('the engine validates every manifest against main without error', async ({ assert }) => {
    const manifests = await loadAllManifests()

    if (manifests.length === 0) {
      assert.isTrue(true, 'no flavor manifests yet — engine validation is a no-op until #5/#8')
      return
    }

    const engine = new PruneEngine()
    for (const { manifest } of manifests) {
      engine.validate(REPO_ROOT, manifest)
    }

    assert.isTrue(true, 'all manifests pass engine validation against main')
  })

  test('a package.json rewrite never drifts the version from main', async ({ assert }) => {
    const manifests = await loadAllManifests()
    const mainVersion = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'))
      .version as string

    if (manifests.length === 0) {
      assert.isTrue(true, 'no flavor manifests yet — version drift seam is a no-op until #5/#8')
      return
    }

    const drifted: { flavor: string; version: string }[] = []
    for (const { flavor, manifest } of manifests) {
      const rewrite = manifest.rewrites.find((r) => r.path === 'package.json')
      if (!rewrite) continue

      const parsed = JSON.parse(rewrite.content) as { version?: string }
      if (parsed.version !== mainVersion) {
        drifted.push({ flavor, version: parsed.version ?? '(missing)' })
      }
    }

    assert.deepEqual(
      drifted,
      [],
      'the package.json rewrite version must stay in sync with main — update the manifest when the project version bumps:\n' +
        drifted
          .map((d) => `  - [${d.flavor}] version ${d.version} (main is ${mainVersion})`)
          .join('\n')
    )
  })
})
