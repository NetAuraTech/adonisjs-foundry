import { test } from '@japa/runner'
import { DashboardRegistry } from '#services/core/dashboard_registry'
import type { DashboardCollector } from '#types/dashboard'

test.group('DashboardRegistry', () => {
  test('entries() is empty on a fresh registry', ({ assert }) => {
    const registry = new DashboardRegistry()

    assert.deepEqual(registry.entries(), [])
  })

  test('entries() lists registered sections in registration order', ({ assert }) => {
    const registry = new DashboardRegistry()
    const collector: DashboardCollector<'auth'> = {
      collect: async () => ({ users: 0, usersByRole: [] }),
    }

    registry.register('auth', async () => collector)
    registry.register('template', async () => ({ collect: async () => ({ templates: 0 }) }))

    assert.deepEqual(
      registry.entries().map(([section]) => section),
      ['auth', 'template']
    )
  })

  test('register() does not invoke the factory', async ({ assert }) => {
    const registry = new DashboardRegistry()
    let invoked = false

    registry.register('template', async () => {
      invoked = true
      return { collect: async () => ({ templates: 0 }) }
    })

    assert.isFalse(invoked)
  })

  test('registering the same section twice replaces the previous factory', async ({ assert }) => {
    const registry = new DashboardRegistry()
    const replacement: DashboardCollector<'template'> = {
      collect: async () => ({ templates: 42 }),
    }

    registry.register('template', async () => ({ collect: async () => ({ templates: 0 }) }))
    registry.register('template', async () => replacement)

    const entries = registry.entries()
    assert.lengthOf(entries, 1)
    const collector = await entries[0][1]()
    assert.deepEqual(await collector.collect(), { templates: 42 })
  })

  test('entries() returns factories that resolve to the registered collector', async ({
    assert,
  }) => {
    const registry = new DashboardRegistry()
    const collector: DashboardCollector<'file'> = {
      collect: async () => ({ files: 1, fileFolders: 0, filesByFolder: [], recentFiles: [] }),
    }

    registry.register('file', async () => collector)

    const [, factory] = registry.entries()[0]
    assert.strictEqual(await factory(), collector)
  })
})
