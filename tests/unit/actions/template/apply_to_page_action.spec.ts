import { test } from '@japa/runner'
import InvalidTemplateTypeException from '#exceptions/template/invalid_template_type_exception'
import MissingTranslationException from '#exceptions/page/missing_translation_exception'
import app from '@adonisjs/core/services/app'
import { ApplyToPageAction } from '#actions/template/apply_to_page_action'
import Template from '#models/template/template'
import Page from '#models/page/page'
import PageTranslation from '#models/page/page_translation'
import type { BlockType } from '#types/page'
import { PageContent } from '#types/page'

test.group('ApplyToPageAction', () => {
  test('execute() throws E_INVALID_TEMPLATE_TYPE for block templates', async ({ assert }) => {
    const action = await app.container.make(ApplyToPageAction)

    const template = await Template.create({
      name: `Block Template ${Date.now()}`,
      type: 'block',
      blockType: 'section',
      content: { blocks: [] },
      createdBy: null,
    })

    await assert.rejects(async () => {
      await action.execute({ templateId: template.id, pageId: 1, locale: 'en', userId: 1 })
    }, InvalidTemplateTypeException)
  })

  test('execute() throws E_MISSING_TRANSLATION when translation not found', async ({ assert }) => {
    const action = await app.container.make(ApplyToPageAction)

    const template = await Template.create({
      name: `Apply Template ${Date.now()}`,
      type: 'page',
      content: { blocks: [] },
      createdBy: null,
    })

    await assert.rejects(async () => {
      await action.execute({ templateId: template.id, pageId: 999999, locale: 'en', userId: 1 })
    }, MissingTranslationException)
  })

  test('execute() replaces translation content with template content', async ({ assert }) => {
    const action = await app.container.make(ApplyToPageAction)

    const page = await Page.create({ defaultLocale: 'en', createdBy: null })
    await PageTranslation.create({
      pageId: page.id,
      locale: 'en',
      slug: `apply-page-${page.id}`,
      title: 'Apply Page',
      content: { blocks: [] },
      status: 'draft' as any,
    })

    const templateContent: PageContent = {
      blocks: [
        {
          id: '1',
          type: 'title' as BlockType,
          props: { text: 'Template Title', level: 1, color: 'default', highlightColor: 'default' } as any,
        },
      ],
    }
    const template = await Template.create({
      name: `Apply Template 2 ${Date.now()}`,
      type: 'page',
      content: templateContent,
      createdBy: null,
    })

    await action.execute({ templateId: template.id, pageId: page.id, locale: 'en', userId: 1 })

    const translation = await PageTranslation.findBy('pageId', page.id)
    assert.deepEqual(translation!.content, templateContent)
  })
})
