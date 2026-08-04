import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import app from '@adonisjs/core/services/app'
import redis from '@adonisjs/redis/services/main'
import env from '#start/env'
import { createAdminUser, CMS_PERMISSIONS } from '#tests/helpers/browser/create_admin_user'
import { login } from '#tests/helpers/browser/login'
import { visitPage } from '#tests/helpers/browser/visit_page'
import Template from '#models/template/template'
import { PreviewTokenHelper } from '#helpers/core/preview_token'
import { MaintenanceService } from '#services/maintenance/maintenance_service'
import type { PageContent } from '#types/page'

const previewContent: PageContent = {
  blocks: [{ id: 'b1', type: 'paragraph', props: { text: 'Preview pipeline marker' } }],
} as PageContent

/**
 * Browser E2E tests for the token-protected Template preview route used for
 * thumbnail capture. Asserts it is gated by a valid HMAC token and that a
 * valid request resolves the template content through the page pipeline
 * without error.
 */
test.group('Template preview route', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
    // Maintenance mode is stored in Redis and persists across runs; reset it
    // so it does not interfere with these requests.
    await redis.flushdb()
    const maintenance = await app.container.make(MaintenanceService)
    await maintenance.setConfig({ enabled: false })
  })

  test('rejects the render without a valid token', async ({ visit, route, assert }) => {
    const admin = await createAdminUser({
      email: 'tpl-preview-deny@example.com',
      permissionSlugs: CMS_PERMISSIONS,
    })
    const template = await Template.create({
      name: 'Preview Deny',
      type: 'block',
      blockType: 'section',
      content: previewContent,
      createdBy: admin.id,
    })

    const page = await login(
      route('auth.session.render'),
      visit,
      'tpl-preview-deny@example.com',
      'TestPassword123!'
    )

    // Set up response listener before navigating
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/admin/templates/preview/'), {
        timeout: 10000,
      }),
      page.goto(`/admin/templates/preview/${template.id}?locale=en&token=bad-token`),
    ])

    assert.equal(response.status(), 401)
  })

  test('renders the template through the pipeline with a valid token', async ({
    visit,
    route,
    assert,
  }) => {
    const admin = await createAdminUser({
      email: 'tpl-preview-allow@example.com',
      permissionSlugs: CMS_PERMISSIONS,
    })
    const template = await Template.create({
      name: 'Preview Allow',
      type: 'block',
      blockType: 'section',
      content: previewContent,
      createdBy: admin.id,
    })

    const helper = new PreviewTokenHelper(env.get('APP_KEY').release())
    const token = helper.generate(template.id, admin.id, 'en')

    await login(
      route('auth.session.render'),
      visit,
      'tpl-preview-allow@example.com',
      'TestPassword123!'
    )

    const page = await visitPage(
      `/admin/templates/preview/${template.id}?locale=en&token=${token}`,
      visit
    )

    // The preview page should render the template content
    await page.locator('[data-template-preview]').waitFor({ timeout: 10000 })
    const content = await page.locator('[data-template-preview]').textContent()
    assert.isTrue(content?.includes('Preview pipeline marker'))
  })

  test('requires authentication', async ({ visit, assert }) => {
    const admin = await createAdminUser({
      email: 'tpl-preview-anon@example.com',
      permissionSlugs: CMS_PERMISSIONS,
    })
    const template = await Template.create({
      name: 'Preview Anon',
      type: 'block',
      blockType: 'section',
      content: previewContent,
      createdBy: admin.id,
    })

    const helper = new PreviewTokenHelper(env.get('APP_KEY').release())
    const token = helper.generate(template.id, admin.id, 'en')

    // Do not login — the auth middleware should redirect to the login page
    const page = await visit(`/admin/templates/preview/${template.id}?locale=en&token=${token}`)

    // Should be redirected to the login page
    await page.waitForURL(/\/login/, { timeout: 10000 })
    assert.isTrue(page.url().includes('/login'))
  })
})
