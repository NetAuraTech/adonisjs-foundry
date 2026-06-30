import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { ListRevisionsAction } from '#actions/page/list_revisions_action'
import Page from '#models/page/page'
import PageTranslation from '#models/page/page_translation'

test.group('ListRevisionsAction', () => {
  test('execute() returns revisions for a page', async ({ assert }) => {
    const action = await app.container.make(ListRevisionsAction)

    const page = await Page.create({ defaultLocale: 'en', createdBy: null })
    const translation = await PageTranslation.create({
      pageId: page.id,
      locale: 'en',
      slug: `revisions-page-${page.id}`,
      title: 'Revisions Page',
      content: { blocks: [] },
      status: 'draft' as any,
    })

    await (translation as any).saveRevision(1)

    const result = await action.execute({
      pageId: translation.id,
      pagination: { page: 1, perPage: 20 },
    })
    assert.isDefined(result)
  })
})
