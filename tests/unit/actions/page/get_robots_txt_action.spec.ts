import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { GetRobotsTxtAction } from '#actions/page/get_robots_txt_action'

test.group('GetRobotsTxtAction', () => {
  test('execute() returns robots.txt string', async ({ assert }) => {
    const action = await app.container.make(GetRobotsTxtAction)

    const result = await action.execute()
    assert.isString(result)
    assert.include(result, 'User-agent')
  })
})
