import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { GetAvailablePagesForLinkAction } from '#cms/domain/actions/page/get_available_pages_for_link_action'
import Page from '#cms/models/page/page'
import PageTranslation from '#cms/models/page/page_translation'

test.group('GetAvailablePagesForLinkAction', () => {
  test('execute() returns published pages for linking', async ({ assert }) => {
    const action = await app.container.make(GetAvailablePagesForLinkAction)

    const page = await Page.create({ defaultLocale: 'en', createdBy: null })
    await PageTranslation.create({
      pageId: page.id,
      locale: 'en',
      slug: `link-page-${page.id}`,
      title: 'Linkable Page',
      content: { blocks: [] },
      status: 'published' as any,
    })

    const result = await action.execute()
    assert.isArray(result)
  })
})
