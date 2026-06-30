import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { FindPageBySlugAction } from '#actions/page/find_page_by_slug_action'
import Page from '#models/page/page'
import PageTranslation from '#models/page/page_translation'

test.group('FindPageBySlugAction', () => {
  test('execute() returns page when slug exists', async ({ assert }) => {
    const action = await app.container.make(FindPageBySlugAction)

    const page = await Page.create({ defaultLocale: 'en', createdBy: null })
    await PageTranslation.create({
      pageId: page.id,
      locale: 'en',
      slug: `find-slug-${page.id}`,
      title: 'Find Slug Page',
      content: { blocks: [] },
      status: 'published' as any,
    })

    const result = await action.execute({ slug: `find-slug-${page.id}` })
    assert.isNotNull(result)
    assert.equal(result!.id, page.id)
  })

  test('execute() returns null when slug not found', async ({ assert }) => {
    const action = await app.container.make(FindPageBySlugAction)

    const result = await action.execute({ slug: 'nonexistent-slug-page' })
    assert.isNull(result)
  })
})
