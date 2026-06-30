import { test } from '@japa/runner'
import RowNotFoundException from '#exceptions/core/row_not_found_exception'
import app from '@adonisjs/core/services/app'
import { RestoreRevisionAction } from '#actions/page/restore_revision_action'
import Page from '#models/page/page'
import PageTranslation from '#models/page/page_translation'
import PageRevision from '#models/page/page_revision'

test.group('RestoreRevisionAction', () => {
  test('execute() restores translation to previous revision content', async ({ assert }) => {
    const action = await app.container.make(RestoreRevisionAction)

    const page = await Page.create({ defaultLocale: 'en', createdBy: null })
    const translation = await PageTranslation.create({
      pageId: page.id,
      locale: 'en',
      slug: `restore-page-${page.id}`,
      title: 'Restore Page',
      content: { blocks: [] },
      status: 'draft' as any,
    })

    await (translation as any).saveRevision(1)
    const revision = await PageRevision.query().where('pageTranslationId', translation.id).first()
    assert.isNotNull(revision)

    await action.execute({ translationId: translation.id, revisionId: revision!.id, userId: 1 })
  })

  test('execute() throws E_ROW_NOT_FOUND when translation does not exist', async ({ assert }) => {
    const action = await app.container.make(RestoreRevisionAction)

    await assert.rejects(async () => {
      await action.execute({ translationId: 999999, revisionId: 1, userId: 1 })
    }, RowNotFoundException)
  })
})
