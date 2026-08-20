import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import redis from '@adonisjs/redis/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import { MaintenanceService } from '#services/maintenance/maintenance_service'
import { createAdminUser } from '#tests/helpers/create_admin_user'
import { seedDashboard } from '#tests/helpers/seed_dashboard'

/**
 * HTTP seam for the dashboard composition: the full-flavor payload served
 * by GET /admin keeps exactly the four registered sections, with the same
 * figures and recent-activity content the pre-registry action produced.
 */
const ALL_VIEW_PERMISSIONS = ['users.view', 'pages.view', 'templates.view', 'files.view'] as const

/**
 * Extracts the Inertia page object from the server-rendered HTML — the
 * `data-page` attribute carries the props JSON with HTML-escaped quotes.
 */
function parseInertiaPage(html: string) {
  const match = html.match(/data-page="([^"]+)"/)
  if (!match) throw new Error('No Inertia data-page attribute in response')
  const json = match[1]
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
  return JSON.parse(json)
}

test.group('Admin dashboard endpoint', (group) => {
  group.each.setup(async () => {
    // testUtils.db().truncate() does NOT truncate eagerly: it runs the
    // migrations and returns a teardown callback performing db:truncate.
    // Invoke the teardown immediately so every test starts from an empty
    // database — other suites in a full run leave committed rows behind,
    // and the exact-figure assertions below must not see them.
    const truncate = await testUtils.db().truncate()
    await truncate()
    // Maintenance state lives in Redis and persists across runs: an
    // interrupted suite can leave maintenance ON and 503 every request.
    await redis.flushdb()
    const service = await app.container.make(MaintenanceService)
    await service.setConfig({ enabled: false })
  })

  test('GET /admin serves the complete, sectioned dashboard payload', async ({
    client,
    assert,
  }) => {
    const user = await createAdminUser({
      email: 'dashboard-functional@example.com',
      permissionSlugs: ALL_VIEW_PERMISSIONS,
    })
    const markers = await seedDashboard('functional')

    const res = await client.get('/admin').loginAs(user)

    res.assertStatus(200)
    const page = parseInertiaPage(res.text())
    assert.equal(page.component, 'core/admin/dashboard')

    // Shape: exactly the four registered sections — no more, no less.
    const stats = page.props.stats
    assert.deepEqual(Object.keys(stats).sort(), ['auth', 'file', 'page', 'template'])

    // Content: the same figures the pre-registry action produced.
    assert.equal(stats.auth.users, 2) // the admin and the marker user
    const usersByRole = [...stats.auth.usersByRole].sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    )
    assert.deepEqual(usersByRole, [
      { name: markers.role, count: 1 },
      // createAdminUser seeds the admin role with its i18n key as name.
      { name: 'roles.admin.value', count: 1 },
    ])

    assert.equal(stats.page.pages, 1)
    assert.deepEqual(stats.page.pageTranslations, {
      draft: 0,
      published: 1,
      archived: 0,
      total: 1,
    })
    assert.equal(stats.page.publishedLocales, 1)
    assert.lengthOf(stats.page.recentPublishedPages, 1)
    assert.equal(stats.page.recentPublishedPages[0].title, markers.pageTitle)
    assert.match(stats.page.recentPublishedPages[0].publishedAt, /^\d{4}-\d{2}-\d{2}T/)

    assert.deepEqual(stats.template, { templates: 1 })

    assert.equal(stats.file.files, 1)
    assert.equal(stats.file.fileFolders, 1)
    assert.lengthOf(stats.file.filesByFolder, 1)
    assert.equal(stats.file.filesByFolder[0].name, markers.folder)
    assert.equal(stats.file.filesByFolder[0].count, 1)
    assert.lengthOf(stats.file.recentFiles, 1)
    assert.equal(stats.file.recentFiles[0].originalName, markers.fileName)
    assert.match(stats.file.recentFiles[0].createdAt, /^\d{4}-\d{2}-\d{2}T/)
  })

  test('GET /admin redirects unauthenticated visitors to the login page', async ({ client }) => {
    const res = await client.get('/admin').redirects(0)
    res.assertStatus(302)
    res.assertHeader('location', '/login')
  })
})
