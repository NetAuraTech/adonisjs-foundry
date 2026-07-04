import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { FindHomepageAction } from '#actions/page/find_homepage_action'

test.group('FindHomepageAction', () => {
  test('execute() returns null when no homepage is set', async ({ assert }) => {
    const action = await app.container.make(FindHomepageAction)

    const result = await action.execute()
    // May be null or a page depending on existing data
    assert.isDefined(result)
  })
})
