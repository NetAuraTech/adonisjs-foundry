import { test } from '@japa/runner'
import { PageRepository } from '#repositories/page/page_repository'
import { PageFactory, PageTranslationFactory, PageRevisionFactory } from '#factories/page_factory'

/**
 * Integration tests for `PageRepository`.
 */
test.group('PageRepository', () => {
  const repo = new PageRepository()

  // ─── findBySlug() ─────────────────────────────────────────────────────────

  test('findBySlug() returns null when no published translation matches', async ({ assert }) => {
    const page = await PageFactory.create()
    await PageTranslationFactory.merge({
      pageId: page.id,
      slug: 'draft-page',
      status: 'draft',
    }).create()

    const result = await repo.findBySlug('draft-page')
    assert.isNull(result)
  })

  test('findBySlug() returns page when a published translation matches', async ({ assert }) => {
    const page = await PageFactory.create()
    await PageTranslationFactory.merge({
      pageId: page.id,
      slug: 'live-page',
      status: 'published',
    }).create()

    const result = await repo.findBySlug('live-page')
    assert.isNotNull(result)
    assert.equal(result!.id, page.id)
  })

  test('findBySlug() returns null for unknown slug', async ({ assert }) => {
    const result = await repo.findBySlug('no-such-page')
    assert.isNull(result)
  })

  // ─── list() ───────────────────────────────────────────────────────────────

  test('list() filters pages by translation status', async ({ assert }) => {
    const publishedPage = await PageFactory.create()
    await PageTranslationFactory.merge({ pageId: publishedPage.id, status: 'published' }).create()

    const draftPage = await PageFactory.create()
    await PageTranslationFactory.merge({ pageId: draftPage.id, status: 'draft' }).create()

    const result = await repo.list({ status: 'published' }, { page: 1, perPage: 20 })
    const ids = result.all().map((p: any) => p.id)

    assert.includeMembers(ids, [publishedPage.id])
    assert.notIncludeMembers(ids, [draftPage.id])
  })

  test('list() filters by locale', async ({ assert }) => {
    const enPage = await PageFactory.create()
    await PageTranslationFactory.merge({
      pageId: enPage.id,
      locale: 'en',
      slug: 'en-page',
    }).create()

    const frPage = await PageFactory.create()
    await PageTranslationFactory.merge({
      pageId: frPage.id,
      locale: 'fr',
      slug: 'fr-page',
    }).create()

    const result = await repo.list({ locale: 'fr' }, { page: 1, perPage: 20 })
    const ids = result.all().map((p: any) => p.id)

    assert.includeMembers(ids, [frPage.id])
    assert.notIncludeMembers(ids, [enPage.id])
  })

  test('list() filters by search on translation title', async ({ assert }) => {
    const page = await PageFactory.create()
    await PageTranslationFactory.merge({
      pageId: page.id,
      title: 'About us',
      slug: 'about',
    }).create()

    const otherPage = await PageFactory.create()
    await PageTranslationFactory.merge({
      pageId: otherPage.id,
      title: 'Contact',
      slug: 'contact',
    }).create()

    const result = await repo.list({ search: 'about' }, { page: 1, perPage: 20 })
    const ids = result.all().map((p: any) => p.id)

    assert.includeMembers(ids, [page.id])
    assert.notIncludeMembers(ids, [otherPage.id])
  })

  // ─── delete() ─────────────────────────────────────────────────────────────

  test('delete() cascades to translations and revisions', async ({ assert }) => {
    const page = await PageFactory.create()
    const translation = await PageTranslationFactory.merge({
      pageId: page.id,
      slug: 'to-delete',
    }).create()
    await PageRevisionFactory.merge({ pageTranslationId: translation.id }).create()

    await repo.delete(page.id)

    const found = await repo.findById(page.id)
    assert.isNull(found)

    const { default: PageTranslation } = await import('#models/page/page_translation')
    const tr = await PageTranslation.find(translation.id)
    assert.isNull(tr)
  })
})
