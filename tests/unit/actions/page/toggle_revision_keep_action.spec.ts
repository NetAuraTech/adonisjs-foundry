import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { ToggleRevisionKeepAction } from '#actions/page/toggle_revision_keep_action'
import Page from '#models/page/page'
import PageTranslation from '#models/page/page_translation'
import PageRevision from '#models/page/page_revision'

test.group('ToggleRevisionKeepAction', () => {
  test('execute() toggles the keep flag on a revision', async ({ assert }) => {
    const action = await app.container.make(ToggleRevisionKeepAction)

    const page = await Page.create({ defaultLocale: 'en', createdBy: null })
    const translation = await PageTranslation.create({
      pageId: page.id,
      locale: 'en',
      slug: `toggle-page-${page.id}`,
      title: 'Toggle Page',
      content: { blocks: [] },
      status: 'draft' as any,
    })

    await (translation as any).saveRevision(1)
    const revision = await PageRevision.query().where('page_translation_id', translation.id).first()
    assert.isNotNull(revision)

    const initialKeep = revision!.keep
    const updated = await action.execute({ revisionId: revision!.id })
    assert.equal(updated.keep, !initialKeep)
  })
})
