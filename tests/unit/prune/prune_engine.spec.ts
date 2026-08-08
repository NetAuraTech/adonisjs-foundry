import { test } from '@japa/runner'
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  PruneEngine,
  StaleManifestError,
  DisallowedRewriteError,
  REWRITE_ALLOWLIST,
} from '#prune/engine'
import type { FlavorManifest } from '#prune/types'

/**
 * Builds a synthetic fixture tree mimicking the repo's composition layout:
 * config/, start/, app/cms/, app/http/controllers/page/, package.json, and
 * a few allowlisted files with content. Tests prune against this tree so
 * the engine stays structure-agnostic and never depends on the real repo.
 */
async function buildFixtureTree(root: string): Promise<void> {
  await mkdir(join(root, 'app/cms/domain/services/page'), { recursive: true })
  await mkdir(join(root, 'app/http/controllers/page/admin'), { recursive: true })
  await mkdir(join(root, 'start/routes'), { recursive: true })
  await mkdir(join(root, 'config'), { recursive: true })

  await writeFile(join(root, 'app/cms/domain/services/page/page_service.ts'), 'export {}', 'utf8')
  await writeFile(
    join(root, 'app/http/controllers/page/admin/pages_controller.ts'),
    'export {}',
    'utf8'
  )
  await writeFile(join(root, 'start/routes/cms_admin.routes.ts'), 'export {}', 'utf8')

  await writeFile(
    join(root, 'start/routes.ts'),
    [
      'import features from "#config/features"',
      'if (features.cms) registerCmsAdminRoutes()',
      'registerAdminRoutes()',
      '',
    ].join('\n'),
    'utf8'
  )

  await writeFile(
    join(root, 'config/features.ts'),
    'export default { auth: true, cms: true, admin: true } as const',
    'utf8'
  )

  await writeFile(
    join(root, 'config/database.ts'),
    "export default { migrations: { paths: ['database/migrations', 'database/migrations/cms'] } }",
    'utf8'
  )

  await writeFile(
    join(root, 'package.json'),
    JSON.stringify(
      {
        name: 'fixture',
        dependencies: { '@adonisjs/transmit': '^1.0.0', '@adonisjs/core': '^7.0.0' },
        devDependencies: { '@adonisjs/inertia': '^1.0.0' },
      },
      null,
      2
    ) + '\n',
    'utf8'
  )
}

/** Fresh temp dir with a fixture tree built in it. */
async function freshFixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'prune-test-'))
  await buildFixtureTree(root)
  return root
}

/** Minimal manifest exercising delete + rewrite + deps prune. */
function sampleManifest(): FlavorManifest {
  return {
    flavor: 'inertia',
    delete: ['app/cms', 'app/http/controllers/page', 'start/routes/cms_admin.routes.ts'],
    rewrites: [
      {
        path: 'start/routes.ts',
        content: 'import features from "#config/features"\nregisterAdminRoutes()\n',
      },
      {
        path: 'config/features.ts',
        content: 'export default { auth: true, cms: false, admin: true } as const\n',
      },
      {
        path: 'config/database.ts',
        content: "export default { migrations: { paths: ['database/migrations'] } }\n",
      },
    ],
    dependencies: { packages: ['@adonisjs/transmit'] },
  }
}

test.group('PruneEngine', (group) => {
  let root: string

  group.each.setup(async () => {
    root = await freshFixture()
    return () => rm(root, { recursive: true, force: true })
  })

  test('deletes listed directories and files', async ({ assert }) => {
    const engine = new PruneEngine()
    const result = await engine.apply(root, sampleManifest())

    assert.isTrue(result.deletedPaths.includes('app/cms'))
    assert.isTrue(result.deletedPaths.includes('app/http/controllers/page'))
    assert.isTrue(result.deletedPaths.includes('start/routes/cms_admin.routes.ts'))
    assert.isFalse(result.deletedPaths.includes('start/routes.ts'))
  })

  test('rewrites allowlisted files with the manifest content', async ({ assert }) => {
    const engine = new PruneEngine()
    await engine.apply(root, sampleManifest())

    const routes = await readFile(join(root, 'start/routes.ts'), 'utf8')
    assert.equal(routes, 'import features from "#config/features"\nregisterAdminRoutes()\n')

    const features = await readFile(join(root, 'config/features.ts'), 'utf8')
    assert.equal(features, 'export default { auth: true, cms: false, admin: true } as const\n')

    const db = await readFile(join(root, 'config/database.ts'), 'utf8')
    assert.equal(db, "export default { migrations: { paths: ['database/migrations'] } }\n")
  })

  test('prunes listed packages from every dependency map of package.json', async ({ assert }) => {
    const engine = new PruneEngine()
    const result = await engine.apply(root, sampleManifest())

    assert.includeMembers(result.prunedPackages, ['@adonisjs/transmit'])

    const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')) as Record<
      string,
      Record<string, string>
    >
    assert.isNotTrue('@adonisjs/transmit' in (pkg.dependencies ?? {}))
    assert.isTrue('@adonisjs/core' in (pkg.dependencies ?? {}))
    assert.isTrue('@adonisjs/inertia' in (pkg.devDependencies ?? {}))
  })

  test('only reports a package as pruned when it was actually present', async ({ assert }) => {
    const engine = new PruneEngine()
    const result = await engine.apply(root, {
      ...sampleManifest(),
      dependencies: { packages: ['@adonisjs/transmit', 'non-existent-pkg'] },
    })

    assert.includeMembers(result.prunedPackages, ['@adonisjs/transmit'])
    assert.isNotTrue(result.prunedPackages.includes('non-existent-pkg'))
  })

  test('does not touch package.json when no dependencies are declared', async ({ assert }) => {
    const engine = new PruneEngine()
    const manifest = sampleManifest()
    delete manifest.dependencies
    const before = await readFile(join(root, 'package.json'), 'utf8')

    await engine.apply(root, manifest)

    const after = await readFile(join(root, 'package.json'), 'utf8')
    assert.equal(after, before)
  })

  test('fails loudly when a delete path does not exist (stale manifest)', async ({ assert }) => {
    const engine = new PruneEngine()
    const manifest = sampleManifest()
    manifest.delete.push('app/nonexistent/domain')

    await assert.rejects(() => engine.apply(root, manifest), StaleManifestError)

    assert.isTrue(
      await fileExists(join(root, 'app/cms')),
      'a stale manifest must not delete anything — the tree stays intact'
    )
  })

  test('collects every missing path into one stale-manifest error', async ({ assert }) => {
    const engine = new PruneEngine()
    const manifest = sampleManifest()
    manifest.delete.push('app/nonexistent/a', 'app/nonexistent/b')

    try {
      await engine.apply(root, manifest)
      assert.fail('should have thrown')
    } catch (error) {
      assert.instanceOf(error, StaleManifestError)
      const stale = error as StaleManifestError
      assert.includeMembers(stale.missingPaths, ['app/nonexistent/a', 'app/nonexistent/b'])
    }
  })

  test('rejects a rewrite targeting a non-allowlisted file', async ({ assert }) => {
    const engine = new PruneEngine()
    const manifest = sampleManifest()
    manifest.rewrites.push({
      path: 'app/types/dashboard.ts' as never,
      content: '// tampered business code',
    })

    await assert.rejects(() => engine.apply(root, manifest), DisallowedRewriteError)

    const untouched = await readFile(
      join(root, 'app/cms/domain/services/page/page_service.ts'),
      'utf8'
    )
    assert.equal(untouched, 'export {}', 'a disallowed rewrite must not mutate the tree')
  })

  test('dry-run reports planned actions without touching the tree', async ({ assert }) => {
    const engine = new PruneEngine()
    const routesBefore = await readFile(join(root, 'start/routes.ts'), 'utf8')

    const plan = engine.dryRun(root, sampleManifest())

    assert.includeMembers(plan.deletedPaths, ['app/cms', 'app/http/controllers/page'])
    assert.includeMembers(plan.rewrittenFiles, ['start/routes.ts', 'config/features.ts'])
    assert.includeMembers(plan.prunedPackages, ['@adonisjs/transmit'])

    const routesAfter = await readFile(join(root, 'start/routes.ts'), 'utf8')
    assert.equal(routesAfter, routesBefore, 'dry-run must not modify files')
  })

  test('dry-run fails on a stale manifest just like apply', async ({ assert }) => {
    const engine = new PruneEngine()
    const manifest = sampleManifest()
    manifest.delete.push('app/nonexistent')

    await assert.rejects(() => engine.dryRun(root, manifest), StaleManifestError)
  })
})

test.group('PruneEngine end-to-end on a fixture tree', (group) => {
  let root: string

  group.each.setup(async () => {
    root = await mkdtemp(join(tmpdir(), 'prune-e2e-'))
    await buildFixtureTree(root)
    return () => rm(root, { recursive: true, force: true })
  })

  test('apply produces a coherent pruned tree', async ({ assert }) => {
    const engine = new PruneEngine()
    const result = await engine.apply(root, sampleManifest())

    assert.isAbove(result.deletedPaths.length, 0)
    assert.isAbove(result.rewrittenFiles.length, 0)
    assert.includeMembers(result.prunedPackages, ['@adonisjs/transmit'])

    const routes = await readFile(join(root, 'start/routes.ts'), 'utf8')
    assert.notInclude(routes, 'cms')
    assert.include(routes, 'registerAdminRoutes')
  })
})

test.group('REWRITE_ALLOWLIST', () => {
  test('contains the post-extraction composition set', ({ assert }) => {
    assert.includeMembers(
      [...REWRITE_ALLOWLIST],
      [
        'adonisrc.ts',
        'config/features.ts',
        'config/database.ts',
        'config/shield.ts',
        'start/routes.ts',
        'start/events.ts',
        'start/nav.ts',
        'start/dashboard.ts',
        'start/container.ts',
        'start/transmit.ts',
        'start/sitemap.ts',
      ]
    )
  })
})

import { existsSync } from 'node:fs'
async function fileExists(path: string): Promise<boolean> {
  return existsSync(path)
}
