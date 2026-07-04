import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { SetHomepageAction } from '#actions/page/set_homepage_action'
import Page from '#models/page/page'

test.group('SetHomepageAction', () => {
  test('execute() sets a page as homepage', async ({ assert }) => {
    const action = await app.container.make(SetHomepageAction)

    const page = await Page.create({ defaultLocale: 'en', createdBy: null, isHomepage: false })

    await action.execute({ pageId: page.id, userId: 1 })

    await page.refresh()
    assert.isTrue(page.isHomepage)
  })
})
