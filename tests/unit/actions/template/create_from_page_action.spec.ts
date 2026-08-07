import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { CreateFromPageAction } from '#cms/domain/actions/template/create_from_page_action'
import Page from '#cms/models/page/page'
import PageTranslation from '#cms/models/page/page_translation'
import { type PageContent } from '#cms/types/page'
import { UserFactory } from '#database/factories/user_factory'

test.group('CreateFromPageAction', () => {
  test('execute() creates template with page translation content', async ({ assert }) => {
    const action = await app.container.make(CreateFromPageAction)
    const user = await UserFactory.create()

    const pageContent: PageContent = {
      blocks: [{ id: '1', type: 'separator', props: { spacing: 'none', color: 'primary' } }],
    }
    const page = await Page.create({ defaultLocale: 'en', createdBy: null })
    await PageTranslation.create({
      pageId: page.id,
      locale: 'en',
      slug: `from-page-${page.id}`,
      title: 'From Page',
      content: pageContent,
      status: 'draft' as any,
    })

    const templateName = `Template From Page ${page.id}`
    const template = await action.execute({
      name: templateName,
      pageId: page.id,
      locale: 'en',
      userId: user.id,
    })

    assert.equal(template.name, templateName)
    assert.equal(template.type, 'page')
    assert.deepEqual(template.content, pageContent)
  })

  test('execute() throws E_ROW_NOT_FOUND when translation not found', async ({ assert }) => {
    const action = await app.container.make(CreateFromPageAction)
    const user = await UserFactory.create()

    let threw = false
    try {
      await action.execute({ name: 'Test', pageId: 999999, locale: 'en', userId: user.id })
    } catch (err: any) {
      threw = true
      assert.equal(err.code, 'E_ROW_NOT_FOUND')
    }
    assert.isTrue(threw)
  })
})
