import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import { createAdminUser, CMS_PERMISSIONS } from '#tests/helpers/browser/create_admin_user'
import { login } from '#tests/helpers/browser/login'
import { waitForBuilderReady } from '#tests/helpers/browser/wait_for_builder_ready'
import { PageFactory } from '#database/factories/page_factory'
import Template from '#models/template/template'
import PageTranslation from '#models/page/page_translation'
import type { PageContent } from '#types/page'

const markerText = 'BlockInsertFlow unique card body'

// A single-root "card": a section wrapping a paragraph.
const cardTemplateContent: PageContent = {
  blocks: [
    {
      id: 'tpl-card-section',
      type: 'section',
      props: {},
      children: [
        {
          id: 'tpl-card-paragraph',
          type: 'paragraph',
          props: { text: markerText },
        },
      ],
    },
  ],
} as PageContent

/**
 * E2E: inserting a Block Template into a page deep-clones it with fresh ids
 * and, once saved, renders on the public page (user stories 6, 7, 12).
 */
test.group('Block template insert E2E', (group) => {
  group.each.setup(async () => await testUtils.db().truncate())

  test('inserting a block template clones with fresh ids and renders publicly', async ({
    visit,
    route,
    assert,
  }) => {
    const admin = await createAdminUser({
      email: 'block-insert@example.com',
      permissionSlugs: CMS_PERMISSIONS,
    })

    const page = await PageFactory.with('translations', 1, (translation) =>
      translation.merge({
        locale: 'en',
        slug: 'block-insert-target',
        status: 'published',
        publishedAt: DateTime.now(),
      })
    ).create()

    await Template.create({
      name: 'CardFlow Template',
      type: 'block',
      blockType: 'section',
      content: cardTemplateContent,
      createdBy: admin.id,
    })

    const translation = await PageTranslation.findByOrFail({ pageId: page.id, locale: 'en' })

    await login(route('auth.session.render'), visit, 'block-insert@example.com', 'TestPassword123!')

    // `commit` returns before page scripts run, so the mount listener is
    // registered before the preview iframe can navigate.
    const editor = await visit(route('admin.pages_update.render', { id: page.id }), {
      waitUntil: 'commit',
    })
    await waitForBuilderReady(editor)
    const insertButton = editor.getByTitle('Insert template')
    await insertButton.waitFor({ state: 'visible', timeout: 20000 })

    // Open the block-template picker and pick the seeded card template.
    await insertButton.click()
    await editor.getByRole('button', { name: 'CardFlow Template' }).click()

    // Persist the builder state.
    await editor.getByRole('button', { name: 'Save', exact: true }).click()
    await editor
      .waitForResponse((res) => res.url().includes('/edit') && res.request().method() === 'POST', {
        timeout: 15000,
      })
      .catch(() => {})

    // The stored content holds one root block whose ids were regenerated (they
    // no longer match the template source ids).
    await translation.refresh()
    const blocks = (translation.content as PageContent).blocks
    assert.lengthOf(blocks, 1)
    assert.equal(blocks[0].type, 'section')
    assert.notEqual(blocks[0].id, 'tpl-card-section')
    assert.equal(blocks[0].children?.[0]?.type, 'paragraph')
    assert.notEqual(blocks[0].children?.[0]?.id, 'tpl-card-paragraph')

    // The saved block renders on the public page.
    const publicPage = await visit(`/en/block-insert-target`, {
      waitUntil: 'domcontentloaded',
    })
    await publicPage.waitForSelector(`text=${markerText}`, { timeout: 15000 })
  })
})
