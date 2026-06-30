import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { GenerateSitemapAction } from '#actions/page/generate_sitemap_action'

test.group('GenerateSitemapAction', () => {
  test('execute() returns sitemap XML string', async ({ assert }) => {
    const action = await app.container.make(GenerateSitemapAction)

    const result = await action.execute()
    assert.isString(result)
    assert.include(result, '<?xml')
    assert.include(result, 'urlset')
  })
})
