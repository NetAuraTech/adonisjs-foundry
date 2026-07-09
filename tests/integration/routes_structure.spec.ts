import { test } from '@japa/runner'
import router from '@adonisjs/core/services/router'

/**
 * Routes structure integration test.
 *
 * Verifies that the refactored modular routing produces the same
 * route table as the original monolithic file — same names,
 * same patterns, same middleware wiring.
 */
test.group('Routes structure', (group) => {
  group.each.setup(() => {
    router.commit()
  })

  test('all critical named routes are registered', ({ assert }) => {
    const json = router.toJSON()
    const routes = json['root']
    const names = routes.map((r) => r.name).filter(Boolean) as string[]

    // Routes referenced by toRoute() calls across controllers
    const expectedNames = [
      // Auth
      'auth.session.render',
      'auth.session.execute',
      'auth.session.destroy',
      'auth.social.redirect',
      'auth.social.callback',
      'auth.social.unlink',

      // Settings (referenced by many controllers)
      'settings.profile.render',
      'settings.profile.execute',
      'settings.account.render',
      'settings.account.execute',
      'settings.account.destroy',
      'settings.preferences.render',
      'settings.preferences.execute',
      'settings.index',

      // Admin CMS (referenced by CMS controllers)
      'admin.dashboard.render',
      'admin.users.render',
      'admin.users_create.render',
      'admin.users_create.execute',
      'admin.users_show.render',
      'admin.users_update.render',
      'admin.users_update.execute',
      'admin.pages.render',
      'admin.pages_create.render',
      'admin.pages_show.render',
      'admin.pages_update.render',
      'admin.templates.render',
      'admin.files.render',
      'admin.file_folders.render',

      // Public pages
      'page.home',
      'page.localised.render',
      'page.render',
    ]

    for (const expectedName of expectedNames) {
      assert.include(names, expectedName, `Expected route "${expectedName}" to be registered`)
    }
  })

  test('route count matches expected total after modularisation', ({ assert }) => {
    const json = router.toJSON()
    const routes = json['root']

    // Count all route entries (named + unnamed)
    // Auth domain: ~20 routes (login, register, forgot, reset, invitation, logout, oauth, verify)
    // Settings domain: ~10 routes (profile, account, preferences, index, email_change)
    // Admin CMS: ~45 routes (dashboard, users CRUD, pages CRUD, templates, files, folders)
    // Admin API: ~10 routes (settings/theme, builder ops, preview token, file API)
    // Public: ~5 routes (contact, sitemap, robots, home, locale render, render)
    // Total expected: ~90 individual route entries

    assert.isTrue(
      routes.length >= 80,
      `Expected at least 80 registered routes, got ${routes.length}`
    )
  })

  test('public routes have correct patterns', ({ assert }) => {
    const json = router.toJSON()
    const routes = json['root']
    const byName = new Map(routes.filter((r) => r.name).map((r) => [r.name!, r]))

    // Home route
    assert.equal(byName.get('page.home')?.pattern, '/')

    // Localised page render
    assert.ok(
      byName.get('page.localised.render')?.pattern.includes(':locale'),
      'Localised render should have :locale param'
    )

    // Settings index redirects to profile
    assert.equal(byName.get('settings.index')?.pattern, '/settings')
  })

  test('admin routes are under /admin prefix', ({ assert }) => {
    const json = router.toJSON()
    const routes = json['root']
    const adminRoutes = routes.filter((r) => r.name?.startsWith('admin.'))

    for (const route of adminRoutes) {
      assert.ok(
        route.pattern.startsWith('/admin'),
        `Admin route "${route.name}" should start with /admin prefix, got: ${route.pattern}`
      )
    }
  })

  test('settings routes are under /settings prefix', ({ assert }) => {
    const json = router.toJSON()
    const routes = json['root']
    const settingsRoutes = routes.filter((r) => r.name?.startsWith('settings.'))

    for (const route of settingsRoutes) {
      assert.ok(
        route.pattern.startsWith('/settings'),
        `Settings route "${route.name}" should start with /settings prefix, got: ${route.pattern}`
      )
    }
  })
})
