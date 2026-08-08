import { test } from '@japa/runner'
import env from '#start/env'
import { PageFactory, PageTranslationFactory } from '#cms/factories/page_factory'
import Page from '#cms/models/page/page'

/**
 * Functional tests for the core SEO endpoints `/sitemap.xml` and `/robots.txt`.
 *
 * These run through the full HTTP stack (routes → controllers → services) to
 * verify content types, bodies, and that published page URLs surface in the
 * sitemap. Maintenance-mode status is covered by the maintenance middleware
 * spec; this file focuses on the happy-path bodies.
 */
test.group('SEO endpoints', (group) => {
  // Clear any existing homepage before each test (pages_unique_homepage).
  group.each.setup(async () => {
    await Page.query().where('is_homepage', true).update({ isHomepage: false })
  })

  // ─── /robots.txt ──────────────────────────────────────────────────────────

  test('GET /robots.txt returns the robots body with a text/plain content type', async ({
    client,
    assert,
  }) => {
    const res = await client.get('/robots.txt')

    res.assertStatus(200)
    assert.include(res.header('content-type'), 'text/plain')
    assert.include(res.text(), 'User-agent: *')
    assert.include(res.text(), 'Allow: /')
    assert.include(res.text(), `Sitemap: ${env.get('APP_URL')}/sitemap.xml`)
  })

  // ─── /sitemap.xml ─────────────────────────────────────────────────────────

  test('GET /sitemap.xml returns an XML document with the sitemap content type', async ({
    client,
    assert,
  }) => {
    const res = await client.get('/sitemap.xml')

    res.assertStatus(200)
    assert.include(res.header('content-type'), 'application/xml')
    assert.include(res.text(), '<?xml version="1.0" encoding="UTF-8"?>')
    assert.include(res.text(), '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    assert.include(res.text(), '</urlset>')
  })

  test('GET /sitemap.xml includes the URL of a published page', async ({ client, assert }) => {
    const page = await PageFactory.merge({ isHomepage: false, defaultLocale: 'en' }).create()
    await PageTranslationFactory.merge({
      pageId: page.id,
      locale: 'en',
      slug: 'functional-sitemap-published',
      status: 'published',
    }).create()

    const res = await client.get('/sitemap.xml')

    res.assertStatus(200)
    assert.include(res.text(), `<loc>${env.get('APP_URL')}/functional-sitemap-published</loc>`)
  })

  test('GET /sitemap.xml excludes draft page URLs', async ({ client, assert }) => {
    const page = await PageFactory.merge({ isHomepage: false, defaultLocale: 'en' }).create()
    await PageTranslationFactory.merge({
      pageId: page.id,
      locale: 'en',
      slug: 'functional-sitemap-draft',
      status: 'draft',
    }).create()

    const res = await client.get('/sitemap.xml')

    res.assertStatus(200)
    assert.notInclude(res.text(), 'functional-sitemap-draft')
  })
})
