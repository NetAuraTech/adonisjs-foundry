import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { login } from '#tests/helpers/browser/login'
import { visitPage } from '#tests/helpers/browser/visit_page'
import { createAdminUser } from '#tests/helpers/browser/create_admin_user'
import { seedDashboard } from '#tests/helpers/browser/seed_dashboard'

const ALL_VIEW_PERMISSIONS = ['users.view', 'pages.view', 'templates.view', 'files.view'] as const

test.group('Admin Dashboard E2E', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('renders every registered dashboard section', async ({ visit, assert }) => {
    const user = await createAdminUser({
      email: 'dashboard-full@example.com',
      permissionSlugs: ALL_VIEW_PERMISSIONS,
    })
    const markers = await seedDashboard('full')
    await login('/login', visit, user.email, 'TestPassword123!')

    const page = await visitPage('/admin', visit)
    const content = await page.locator('body').innerText()

    // Auth section: role chip seeded by the marker role. Chips are scoped by
    // name, so their counts stay exact even if other specs' rows survive
    // truncation — unlike headline counts, asserted by presence only.
    assert.include(content, `1 ${markers.role}`)
    // Page section: translations breakdown, published locales, template line.
    assert.include(content, 'Page translations')
    assert.match(content, /Published locales: \d+/)
    assert.match(content, /Templates: \d+/)
    // File section: folder count and per-folder chip.
    assert.match(content, /Folders: \d+/)
    assert.include(content, `1 ${markers.folder}`)
    // Recent activity lists.
    assert.include(content, 'Recently published')
    assert.include(content, markers.pageTitle)
    assert.include(content, 'Recent uploads')
    assert.include(content, markers.fileName)
  })

  test('hides the cards the admin has no permission for', async ({ visit, assert }) => {
    const user = await createAdminUser({
      email: 'dashboard-pages-only@example.com',
      permissionSlugs: ['pages.view'],
    })
    const markers = await seedDashboard('pages-only')

    await login('/login', visit, user.email, 'TestPassword123!')
    const page = await visitPage('/admin', visit)
    const content = await page.locator('body').innerText()

    assert.include(content, 'Page translations')
    assert.include(content, markers.pageTitle)
    // Auth and file cards are hidden, and the template line (templates.view)
    // inside the pages card as well.
    assert.notInclude(content, markers.role)
    assert.notInclude(content, 'Folders:')
    assert.notInclude(content, markers.fileName)
    assert.notInclude(content, 'Templates:')
  })
})
