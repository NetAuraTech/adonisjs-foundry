import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { TemplateDashboardCollector } from '#cms/domain/services/template/template_dashboard_collector'
import { TemplateFactory } from '#cms/factories/template_factory'

/**
 * The test database is not truncated between tests, so count assertions are
 * expressed as deltas against a baseline snapshot taken before seeding.
 */
test.group('TemplateDashboardCollector', () => {
  test('collect() returns the template count matching seeded data', async ({ assert }) => {
    const collector = await app.container.make(TemplateDashboardCollector)
    const before = await collector.collect()

    await TemplateFactory.create()

    const after = await collector.collect()

    assert.equal(after.templates, before.templates + 1)
  })
})
