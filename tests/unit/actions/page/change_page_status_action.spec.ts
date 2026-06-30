import { test } from '@japa/runner'
import MissingTranslationException from '#exceptions/page/missing_translation_exception'
import app from '@adonisjs/core/services/app'
import { ChangePageStatusAction } from '#actions/page/change_page_status_action'
import Page from '#models/page/page'
import PageTranslation from '#models/page/page_translation'

test.group('ChangePageStatusAction', () => {
  test('execute() changes the page status', async ({ assert }) => {
    const action = await app.container.make(ChangePageStatusAction)

    const page = await Page.create({ defaultLocale: 'en', createdBy: null })
    await PageTranslation.create({
      pageId: page.id,
      locale: 'en',
      slug: `status-page-${page.id}`,
      title: 'Status Page',
      content: { blocks: [] },
      status: 'draft' as any,
    })

    const updated = await action.execute({ pageId: page.id, locale: 'en', status: 'published' })
    assert.equal(updated.status, 'published')
  })

  test('execute() throws E_MISSING_TRANSLATION when translation does not exist', async ({
    assert,
  }) => {
    const action = await app.container.make(ChangePageStatusAction)

    await assert.rejects(async () => {
      await action.execute({ pageId: 999999, locale: 'en', status: 'published' })
    }, MissingTranslationException)
  })
})
