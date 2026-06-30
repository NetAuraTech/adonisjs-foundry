import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { ListPagesAction } from '#actions/page/list_pages_action'
import Page from '#models/page/page'
import PageTranslation from '#models/page/page_translation'

test.group('ListPagesAction', () => {
  test('execute() returns paginated pages with filters', async ({ assert }) => {
    const action = await app.container.make(ListPagesAction)

    const page = await Page.create({ defaultLocale: 'en', createdBy: null })
    await PageTranslation.create({
      pageId: page.id,
      locale: 'en',
      slug: `list-page-${page.id}`,
      title: 'List Test Page',
      content: { blocks: [] },
      status: 'published' as any,
    })

    const result = await action.execute({ pagination: { page: 1, perPage: 20 } })
    assert.isAbove(result.total, 0)

    const publishedResult = await action.execute({
      status: 'published',
      pagination: { page: 1, perPage: 20 },
    })
    assert.isAbove(publishedResult.total, 0)
  })
})
