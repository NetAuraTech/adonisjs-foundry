import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { GetDashboardStatsAction } from '#actions/core/get_dashboard_stats_action'
import { DashboardRegistry } from '#services/core/dashboard_registry'
import { LogService } from '#services/logging/log_service'
import type { DashboardCollector, DashboardCollectorPayload } from '#types/dashboard'
import type { DashboardTemplateSection } from '#cms/types/dashboard'

class FakeTemplateCollector implements DashboardCollector<'template'> {
  async collect(_payload: DashboardCollectorPayload): Promise<DashboardTemplateSection> {
    return { templates: 7 }
  }
}

test.group('GetDashboardStatsAction — CMS sections', () => {
  test('returns only the sections of registered CMS collectors', async ({ assert }) => {
    const registry = new DashboardRegistry()
    registry.register('template', async () => new FakeTemplateCollector())

    const action = new GetDashboardStatsAction(registry, new LogService())
    const stats = await action.execute()

    assert.deepEqual(stats, { template: { templates: 7 } })
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
})
