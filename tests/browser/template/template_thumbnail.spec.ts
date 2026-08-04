import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createAdminUser, CMS_PERMISSIONS } from '#tests/helpers/browser/create_admin_user'
import { login } from '#tests/helpers/browser/login'
import { visitPage } from '#tests/helpers/browser/visit_page'
import { FileFactory } from '#factories/file_factory'
import Template from '#models/template/template'
import type { PageContent } from '#types/page'

const blockContent: PageContent = {
  blocks: [{ id: 'b1', type: 'section', props: {}, children: [] }],
} as PageContent

/**
 * Browser E2E test for Template thumbnail serialization. The templates index
 * page displays thumbnails via the transformer, which exposes the preloaded
 * thumbnail as `{ id, url }`. Asserts the thumbnail image is rendered with
 * the correct URL, and the placeholder is shown when no thumbnail is set.
 */
test.group('Template thumbnail display', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('displays a thumbnail image when one is set', async ({ visit, route, assert }) => {
    const admin = await createAdminUser({
      email: 'tpl-thumb@example.com',
      permissionSlugs: CMS_PERMISSIONS,
    })

    const file = await FileFactory.create()
    const template = await Template.create({
      name: 'Thumbnail Template',
      type: 'page',
      blockType: null,
      description: null,
      content: blockContent,
      thumbnailId: file.id,
      createdBy: admin.id,
    })

    await login(route('auth.session.render'), visit, 'tpl-thumb@example.com', 'TestPassword123!')

    const page = await visitPage(route('admin.templates.render'), visit)

    // The thumbnail image should be visible with the correct URL
    const thumbnailImg = page.locator(`img[alt="${template.name}"]`)
    await thumbnailImg.waitFor({ timeout: 10000 })

    const src = await thumbnailImg.getAttribute('src')
    assert.isString(src)
    assert.include(src!, file.filename)
  })

  test('displays a placeholder when no thumbnail is set', async ({ visit, route, assert }) => {
    const admin = await createAdminUser({
      email: 'tpl-no-thumb@example.com',
      permissionSlugs: CMS_PERMISSIONS,
    })

    await Template.create({
      name: 'No Thumbnail Template',
      type: 'page',
      blockType: null,
      description: null,
      content: blockContent,
      thumbnailId: null,
      createdBy: admin.id,
    })

    await login(route('auth.session.render'), visit, 'tpl-no-thumb@example.com', 'TestPassword123!')

    const page = await visitPage(route('admin.templates.render'), visit)

    // The placeholder should be visible (no img for this template)
    await page.getByText('No Thumbnail Template').waitFor({ timeout: 10000 })

    // No img tag with this template's name as alt should exist
    const thumbnailImg = page.locator('img[alt="No Thumbnail Template"]')
    assert.equal(await thumbnailImg.count(), 0)
  })
})
