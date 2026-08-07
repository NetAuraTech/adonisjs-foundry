import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { GenerateSitemapAction } from '#cms/domain/actions/page/generate_sitemap_action'

test.group('GenerateSitemapAction', () => {
  test('buildSitemapXml() returns empty urlset for no pages', async ({ assert }) => {
    const action = await app.container.make(GenerateSitemapAction)

    const xml = action.buildSitemapXml([], 'http://localhost:3000')

    assert.include(xml, '<?xml version="1.0" encoding="UTF-8"?>')
    assert.include(xml, '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    assert.include(xml, '</urlset>')
    assert.notInclude(xml, '<url>')
  })

  test('buildSitemapXml() generates correct URL for a subpage in default locale', async ({
    assert,
  }) => {
    const action = await app.container.make(GenerateSitemapAction)

    const pages = [
      {
        isHomepage: false,
        defaultLocale: 'en',
        translations: [{ locale: 'en', slug: 'about' }],
      },
    ] as any[]

    const xml = action.buildSitemapXml(pages, 'http://localhost:3000')

    assert.include(xml, '<loc>http://localhost:3000/about</loc>')
  })

  test('buildSitemapXml() generates correct URL for a subpage in non-default locale', async ({
    assert,
  }) => {
    const action = await app.container.make(GenerateSitemapAction)

    const pages = [
      {
        isHomepage: false,
        defaultLocale: 'en',
        translations: [{ locale: 'fr', slug: 'a-propos' }],
      },
    ] as any[]

    const xml = action.buildSitemapXml(pages, 'http://localhost:3000')

    assert.include(xml, '<loc>http://localhost:3000/fr/a-propos</loc>')
  })

  test('buildSitemapXml() generates root URL for homepage in default locale', async ({
    assert,
  }) => {
    const action = await app.container.make(GenerateSitemapAction)

    const pages = [
      {
        isHomepage: true,
        defaultLocale: 'en',
        translations: [{ locale: 'en', slug: 'home' }],
      },
    ] as any[]

    const xml = action.buildSitemapXml(pages, 'http://localhost:3000')

    assert.include(xml, '<loc>http://localhost:3000/</loc>')
  })

  test('buildSitemapXml() generates locale-prefixed URL for homepage in non-default locale', async ({
    assert,
  }) => {
    const action = await app.container.make(GenerateSitemapAction)

    const pages = [
      {
        isHomepage: true,
        defaultLocale: 'en',
        translations: [{ locale: 'fr', slug: 'accueil' }],
      },
    ] as any[]

    const xml = action.buildSitemapXml(pages, 'http://localhost:3000')

    assert.include(xml, '<loc>http://localhost:3000/fr/</loc>')
  })

  test('buildSitemapXml() handles multiple pages with mixed translations', async ({ assert }) => {
    const action = await app.container.make(GenerateSitemapAction)

    const pages = [
      {
        isHomepage: true,
        defaultLocale: 'en',
        translations: [
          { locale: 'en', slug: 'home' },
          { locale: 'fr', slug: 'accueil' },
        ],
      },
      {
        isHomepage: false,
        defaultLocale: 'en',
        translations: [
          { locale: 'en', slug: 'about' },
          { locale: 'fr', slug: 'a-propos' },
        ],
      },
    ] as any[]

    const xml = action.buildSitemapXml(pages, 'http://localhost:3000')

    assert.include(xml, '<loc>http://localhost:3000/</loc>')
    assert.include(xml, '<loc>http://localhost:3000/fr/</loc>')
    assert.include(xml, '<loc>http://localhost:3000/about</loc>')
    assert.include(xml, '<loc>http://localhost:3000/fr/a-propos</loc>')
  })

  test('buildUrl() returns correct URL for a subpage in default locale', async ({ assert }) => {
    const action = await app.container.make(GenerateSitemapAction)

    const url = action.buildUrl(
      { locale: 'en', slug: 'contact' },
      { isHomepage: false, defaultLocale: 'en', translations: [] },
      'http://example.com'
    )

    assert.equal(url, 'http://example.com/contact')
  })

  test('execute() returns sitemap XML string', async ({ assert }) => {
    const action = await app.container.make(GenerateSitemapAction)

    const result = await action.execute()

    assert.isString(result)
    assert.include(result, '<?xml')
    assert.include(result, 'urlset')
  })
})
