import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { GetDashboardStatsAction } from '#actions/core/get_dashboard_stats_action'
import { DashboardRegistry } from '#services/core/dashboard_registry'
import { LogService } from '#services/logging/log_service'
import type {
  DashboardAuthSection,
  DashboardCollector,
  DashboardCollectorPayload,
} from '#types/dashboard'
import type { DashboardPageSection, DashboardTemplateSection } from '#cms/types/dashboard'

class FakeTemplateCollector implements DashboardCollector<'template'> {
  async collect(): Promise<DashboardTemplateSection> {
    return { templates: 7 }
  }
}

test.group('GetDashboardStatsAction', () => {
  test('returns an empty payload when no collector is registered', async ({ assert }) => {
    const action = new GetDashboardStatsAction(new DashboardRegistry(), new LogService())

    assert.deepEqual(await action.execute(), {})
  })

  test('returns only the sections of registered collectors', async ({ assert }) => {
    const registry = new DashboardRegistry()
    registry.register('template', async () => new FakeTemplateCollector())

    const action = new GetDashboardStatsAction(registry, new LogService())
    const stats = await action.execute()

    assert.deepEqual(stats, { template: { templates: 7 } })
  })

  test('runs registered collectors in parallel', async ({ assert }) => {
    const events: string[] = []
    let releaseAuth!: () => void
    const authGate = new Promise<void>((resolve) => {
      releaseAuth = resolve
    })

    /**
     * Waits until the page collector has started before resolving — with
     * sequential execution the gate would never open and the test would time
     * out instead of passing.
     */
    class GatedAuthCollector implements DashboardCollector<'auth'> {
      async collect(): Promise<DashboardAuthSection> {
        events.push('auth:start')
        await authGate
        events.push('auth:end')
        return { users: 1, usersByRole: [] }
      }
    }

    class ReleasingPageCollector implements DashboardCollector<'page'> {
      async collect(): Promise<DashboardPageSection> {
        events.push('page:start')
        releaseAuth()
        return {
          pages: 2,
          pageTranslations: { draft: 0, published: 0, archived: 0, total: 0 },
          publishedLocales: 0,
          recentPublishedPages: [],
        }
      }
    }

    const registry = new DashboardRegistry()
    registry.register('auth', async () => new GatedAuthCollector())
    registry.register('page', async () => new ReleasingPageCollector())

    const action = new GetDashboardStatsAction(registry, new LogService())
    const stats = await action.execute()

    assert.deepEqual(events, ['auth:start', 'page:start', 'auth:end'])
    assert.deepEqual(Object.keys(stats), ['auth', 'page'])
  })

  test('rejects when a collector fails', async ({ assert }) => {
    class FailingCollector implements DashboardCollector<'auth'> {
      async collect(): Promise<DashboardAuthSection> {
        throw new Error('collector exploded')
      }
    }

    const registry = new DashboardRegistry()
    registry.register('auth', async () => new FailingCollector())
    registry.register('template', async () => new FakeTemplateCollector())

    const action = new GetDashboardStatsAction(registry, new LogService())

    await assert.rejects(() => action.execute(), 'collector exploded')
  })

  test('aggregates every section registered by the composition module', async ({ assert }) => {
    const action = await app.container.make(GetDashboardStatsAction)

    const stats = await action.execute()

    assert.deepEqual(Object.keys(stats).sort(), ['auth', 'file', 'page', 'template'])
    assert.isNumber(stats.auth?.users)
    assert.isArray(stats.auth?.usersByRole)
    assert.isNumber(stats.page?.pages)
    assert.isNumber(stats.page?.pageTranslations.total)
    assert.isNumber(stats.template?.templates)
    assert.isNumber(stats.file?.files)
    assert.isArray(stats.file?.recentFiles)
  })

  test('forwards the recent-activity limit to collectors, defaulting to 5', async ({ assert }) => {
    const receivedLimits: number[] = []

    class ProbingPageCollector implements DashboardCollector<'page'> {
      async collect(payload: DashboardCollectorPayload): Promise<DashboardPageSection> {
        receivedLimits.push(payload.recentLimit)
        return {
          pages: 0,
          pageTranslations: { draft: 0, published: 0, archived: 0, total: 0 },
          publishedLocales: 0,
          recentPublishedPages: [],
        }
      }
    }

    const registry = new DashboardRegistry()
    registry.register('page', async () => new ProbingPageCollector())

    const action = new GetDashboardStatsAction(registry, new LogService())
    await action.execute({ recentLimit: 12 })
    await action.execute()

    assert.deepEqual(receivedLimits, [12, 5])
  })
})
