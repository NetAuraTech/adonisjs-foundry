import { test } from '@japa/runner'
import SlugExistsException from '#exceptions/core/slug_exists_exception'
import app from '@adonisjs/core/services/app'
import { CreatePageAction } from '#actions/page/create_page_action'
import Page from '#models/page/page'
import PageTranslation from '#models/page/page_translation'

test.group('CreatePageAction', () => {
  test('execute() creates a new page with initial translation', async ({ assert }) => {
    const action = await app.container.make(CreatePageAction)

    const page = await action.execute({
      defaultLocale: 'en',
      translation: {
        locale: 'en',
        slug: `create-page-${Date.now()}`,
        title: 'Created Page',
        content: { blocks: [] },
      },
      userId: 1,
    })

    assert.isNotNull(page.id)
    assert.equal(page.defaultLocale, 'en')
  })

  test('execute() throws E_SLUG_EXISTS when slug is taken', async ({ assert }) => {
    const action = await app.container.make(CreatePageAction)

    const page1 = await Page.create({ defaultLocale: 'en', createdBy: null })
    await PageTranslation.create({
      pageId: page1.id,
      locale: 'en',
      slug: `duplicate-slug-${page1.id}`,
      title: 'Dup Slug',
      content: { blocks: [] },
      status: 'draft' as any,
    })

    await assert.rejects(async () => {
      await action.execute({
        defaultLocale: 'en',
        translation: {
          locale: 'en',
          slug: `duplicate-slug-${page1.id}`,
          title: 'Dup Page 2',
          content: { blocks: [] },
        },
        userId: 1,
      })
    }, SlugExistsException)
  })
})
