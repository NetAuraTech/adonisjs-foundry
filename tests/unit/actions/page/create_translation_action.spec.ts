import { test } from '@japa/runner'
import SlugExistsException from '#exceptions/core/slug_exists_exception'
import app from '@adonisjs/core/services/app'
import { CreateTranslationAction } from '#cms/domain/actions/page/create_translation_action'
import Page from '#cms/models/page/page'
import PageTranslation from '#cms/models/page/page_translation'
import type { BlockType, PageContent } from '#cms/types/page'

test.group('CreateTranslationAction', () => {
  test('execute() creates a new translation for existing page', async ({ assert }) => {
    const action = await app.container.make(CreateTranslationAction)

    const page = await Page.create({ defaultLocale: 'en', createdBy: null })

    const translation = await action.execute({
      pageId: page.id,
      locale: 'fr',
      slug: `fr-trans-${page.id}`,
      title: 'French Translation',
    })

    assert.equal(translation.pageId, page.id)
    assert.equal(translation.locale, 'fr')
    assert.deepEqual(translation.content, { blocks: [] })
  })

  test('execute() throws E_SLUG_EXISTS when slug is taken', async ({ assert }) => {
    const action = await app.container.make(CreateTranslationAction)

    const page1 = await Page.create({ defaultLocale: 'en', createdBy: null })
    await PageTranslation.create({
      pageId: page1.id,
      locale: 'en',
      slug: `taken-trans-slug-${page1.id}`,
      title: 'Taken Trans',
      content: { blocks: [] },
      status: 'draft' as any,
    })

    const page2 = await Page.create({ defaultLocale: 'en', createdBy: null })

    await assert.rejects(async () => {
      await action.execute({
        pageId: page2.id,
        locale: 'fr',
        slug: `taken-trans-slug-${page1.id}`,
        title: 'New Trans',
      })
    }, SlugExistsException)
  })

  test('execute() deep-copies content from seed locale', async ({ assert }) => {
    const action = await app.container.make(CreateTranslationAction)

    const page = await Page.create({ defaultLocale: 'en', createdBy: null })
    const sourceContent: PageContent = {
      blocks: [{ id: '1', type: 'title' as BlockType, props: { text: 'Hello' } as any }],
    }
    await PageTranslation.create({
      pageId: page.id,
      locale: 'en',
      slug: `seed-page-${page.id}`,
      title: 'Seed',
      content: sourceContent,
      status: 'draft' as any,
    })

    const translation = await action.execute({
      pageId: page.id,
      locale: 'fr',
      slug: `fr-seed-${page.id}`,
      title: 'French Seed',
      seedFromLocale: 'en',
    })

    assert.deepEqual(translation.content, sourceContent)
    assert.notStrictEqual(translation.content, sourceContent)
  })
})
