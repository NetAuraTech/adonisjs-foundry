import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createAdminUser, CMS_PERMISSIONS } from '#tests/helpers/browser/create_admin_user'
import { login } from '#tests/helpers/browser/login'
import { waitForBuilderReady } from '#tests/helpers/browser/wait_for_builder_ready'
import { PageFactory } from '#cms/factories/page_factory'
import Template from '#cms/models/template/template'
import PageTranslation from '#cms/models/page/page_translation'
import PageRevision from '#cms/models/page/page_revision'
import type { PageContent } from '#cms/types/page'

const templateContent: PageContent = {
  blocks: [
    {
      id: 'tpl-block-1',
      type: 'paragraph',
      props: { text: 'TemplateApplyFlow marker text' },
    },
  ],
} as PageContent

/**
 * E2E: applying a Page Template from the page editor replaces the translation
 * content and records a prior revision (user stories 2, 3, 4).
 */
test.group('Template apply E2E', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('applying a page template replaces content and saves a revision', async ({
    visit,
    route,
    assert,
  }) => {
    const admin = await createAdminUser({
      email: 'template-apply@example.com',
      permissionSlugs: CMS_PERMISSIONS,
    })

    const page = await PageFactory.with('translations', 1, (translation) =>
      translation.merge({ locale: 'en', slug: 'template-apply-target', status: 'draft' })
    ).create()

    // Seed the page template that the UI picker will offer; it is applied via
    // the editor, so the returned model instance is not needed here.
    await Template.create({
      name: 'ApplyFlow Template',
      type: 'page',
      blockType: null,
      content: templateContent,
      createdBy: admin.id,
    })

    const translation = await PageTranslation.findByOrFail({ pageId: page.id, locale: 'en' })
    const revisionsBefore = await PageRevision.query().where('pageTranslationId', translation.id)

    await login(
      route('auth.session.render'),
      visit,
      'template-apply@example.com',
      'TestPassword123!'
    )

    // `commit` returns before page scripts run; waitForBuilderReady then waits
    // for the client app to mount (SSR + createRoot) before we interact.
    const editor = await visit(route('admin.pages_update.render', { id: page.id }), {
      waitUntil: 'commit',
    })
    await waitForBuilderReady(editor)
    // Select buttons by their `name` attribute, not their label — labels are
    // translated and vary with the project locale. The confirm dialog renders
    // inside the same Modal portal so the backdrop may intercept pointer
    // events — force-click the confirmation button.
    const applyButton = editor.locator('button[name="apply-template-open"]')
    await applyButton.waitFor({ state: 'visible', timeout: 20000 })
    await applyButton.click()
    await editor.getByRole('button', { name: 'ApplyFlow Template' }).click()
    const confirmBtn = editor.locator('button[name="apply-template-confirm"]')
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 })
    await confirmBtn.click({ force: true })

    // Wait for the apply POST to persist, then assert the DB outcome.
    await editor
      .waitForResponse((res) => res.url().includes('/apply') && res.request().method() === 'POST', {
        timeout: 15000,
      })
      .catch(() => {})

    await translation.refresh()
    const appliedBlocks = (translation.content as PageContent).blocks
    assert.lengthOf(appliedBlocks, 1)
    assert.equal(appliedBlocks[0].type, 'paragraph')

    const revisionsAfter = await PageRevision.query().where('pageTranslationId', translation.id)
    assert.lengthOf(revisionsAfter, revisionsBefore.length + 1)
  })
})
