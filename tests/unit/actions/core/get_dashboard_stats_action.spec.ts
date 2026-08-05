import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import { GetDashboardStatsAction } from '#actions/core/get_dashboard_stats_action'
import { UserFactory, RoleFactory } from '#factories/user_factory'
import { FileFactory } from '#factories/file_factory'
import { FileFolderFactory } from '#factories/file_folder_factory'
import { TemplateFactory } from '#factories/template_factory'
import { PageFactory, PageTranslationFactory } from '#factories/page_factory'

/**
 * The test database is not truncated between tests, so count assertions are
 * expressed as deltas against a baseline snapshot taken before seeding.
 */
test.group('GetDashboardStatsAction', () => {
  test('execute() returns headline counts matching seeded data', async ({ assert }) => {
    const action = await app.container.make(GetDashboardStatsAction)
    const before = await action.execute()

    await UserFactory.createMany(2)
    const page = await PageFactory.create()
    await PageTranslationFactory.merge({
      pageId: page.id,
      status: 'published',
      publishedAt: DateTime.now(),
    }).create()
    await PageTranslationFactory.merge({ pageId: page.id, locale: 'fr', status: 'draft' }).create()
    await FileFactory.createMany(2)
    await TemplateFactory.create()

    const after = await action.execute()

    assert.equal(after.counts.users, before.counts.users + 2)
    assert.equal(after.counts.pages, before.counts.pages + 1)
    assert.equal(after.counts.files, before.counts.files + 2)
    assert.equal(after.counts.templates, before.counts.templates + 1)
    assert.equal(after.counts.pageTranslations.total, before.counts.pageTranslations.total + 2)
  })

  test('execute() groups translation counts by status', async ({ assert }) => {
    const action = await app.container.make(GetDashboardStatsAction)
    const before = await action.execute()

    const page = await PageFactory.create()
    await PageTranslationFactory.merge({
      pageId: page.id,
      status: 'published',
      publishedAt: DateTime.now(),
    }).create()
    await PageTranslationFactory.merge({ pageId: page.id, locale: 'fr', status: 'draft' }).create()
    await PageTranslationFactory.merge({
      pageId: page.id,
      locale: 'de',
      status: 'archived',
    }).create()

    const after = await action.execute()

    assert.equal(
      after.counts.pageTranslations.published,
      before.counts.pageTranslations.published + 1
    )
    assert.equal(after.counts.pageTranslations.draft, before.counts.pageTranslations.draft + 1)
    assert.equal(
      after.counts.pageTranslations.archived,
      before.counts.pageTranslations.archived + 1
    )
    assert.equal(after.counts.pageTranslations.total, before.counts.pageTranslations.total + 3)
  })

  test('execute() counts unique locales having at least one published translation', async ({
    assert,
  }) => {
    const action = await app.container.make(GetDashboardStatsAction)
    const before = await action.execute()

    const page = await PageFactory.create()
    const otherPage = await PageFactory.create()
    // Two published translations in the same fresh locale: counts once.
    await PageTranslationFactory.merge({
      pageId: page.id,
      locale: 'xx',
      status: 'published',
      publishedAt: DateTime.now(),
    }).create()
    await PageTranslationFactory.merge({
      pageId: otherPage.id,
      locale: 'xx',
      status: 'published',
      publishedAt: DateTime.now(),
    }).create()
    // A draft in another fresh locale: never counts.
    await PageTranslationFactory.merge({
      pageId: page.id,
      locale: 'xy',
      status: 'draft',
    }).create()

    const after = await action.execute()

    assert.equal(after.counts.publishedLocales, before.counts.publishedLocales + 1)
  })

  test('execute() returns recent lists ordered by recency and bounded by the limit', async ({
    assert,
  }) => {
    const action = await app.container.make(GetDashboardStatsAction)
    const page = await PageFactory.create()

    // Explicit future timestamps keep ordering deterministic regardless of
    // rows created by other tests.
    const older = DateTime.now().plus({ days: 1 })
    const newer = DateTime.now().plus({ days: 2 })

    await PageTranslationFactory.merge({
      pageId: page.id,
      slug: `dash-older-${page.id}`,
      title: 'Dashboard Older Published',
      status: 'published',
      publishedAt: older,
    }).create()
    await PageTranslationFactory.merge({
      pageId: page.id,
      locale: 'fr',
      slug: `dash-newer-${page.id}`,
      title: 'Dashboard Newer Published',
      status: 'published',
      publishedAt: newer,
    }).create()
    // A draft with a future publishedAt must never appear in the recent list.
    await PageTranslationFactory.merge({
      pageId: page.id,
      locale: 'de',
      slug: `dash-draft-${page.id}`,
      title: 'Dashboard Draft Hidden',
      status: 'draft',
      publishedAt: DateTime.now().plus({ days: 3 }),
    }).create()

    const olderFile = await FileFactory.merge({ createdAt: older }).create()
    const newerFile = await FileFactory.merge({ createdAt: newer }).create()

    const stats = await action.execute()

    assert.equal(stats.recentPublishedPages[0].title, 'Dashboard Newer Published')
    assert.equal(stats.recentPublishedPages[1].title, 'Dashboard Older Published')
    assert.notInclude(
      stats.recentPublishedPages.map((entry) => entry.title),
      'Dashboard Draft Hidden'
    )

    assert.equal(stats.recentFiles[0].id, newerFile.id)
    assert.equal(stats.recentFiles[1].id, olderFile.id)

    const bounded = await action.execute({ recentLimit: 1 })
    assert.lengthOf(bounded.recentPublishedPages, 1)
    assert.lengthOf(bounded.recentFiles, 1)
  })

  test('execute() sorts published translations without a publication date last', async ({
    assert,
  }) => {
    const action = await app.container.make(GetDashboardStatsAction)
    const page = await PageFactory.create()

    // Legacy rows published before `publishedAt` was stamped have a NULL date.
    await PageTranslationFactory.merge({
      pageId: page.id,
      slug: `dash-legacy-${page.id}`,
      title: 'Dashboard Legacy Undated',
      status: 'published',
      publishedAt: null,
    }).create()
    // A future timestamp keeps the dated row ahead of rows from other tests.
    await PageTranslationFactory.merge({
      pageId: page.id,
      locale: 'fr',
      slug: `dash-dated-${page.id}`,
      title: 'Dashboard Dated Published',
      status: 'published',
      publishedAt: DateTime.now().plus({ days: 3 }),
    }).create()

    // Wide window: other tests also seed published rows competing for the list.
    const stats = await action.execute({ recentLimit: 10 })
    const titles = stats.recentPublishedPages.map((entry) => entry.title)

    assert.notEqual(titles.indexOf('Dashboard Dated Published'), -1)
    assert.notEqual(titles.indexOf('Dashboard Legacy Undated'), -1)
    assert.isBelow(
      titles.indexOf('Dashboard Dated Published'),
      titles.indexOf('Dashboard Legacy Undated')
    )
  })

  test('execute() breaks down user counts by role, most populous first', async ({ assert }) => {
    const action = await app.container.make(GetDashboardStatsAction)
    const before = await action.execute()
    const beforeNoRole = before.usersByRole.find((entry) => entry.name === null)?.count ?? 0

    const adminRole = await RoleFactory.merge({ name: 'dash-admin' }).create()
    const editorRole = await RoleFactory.merge({ name: 'dash-editor' }).create()
    await UserFactory.merge({ roleId: adminRole.id }).createMany(2)
    await UserFactory.merge({ roleId: editorRole.id }).createMany(3)
    await UserFactory.merge({ roleId: null }).create()

    const stats = await action.execute()

    const admin = stats.usersByRole.find((entry) => entry.name === 'dash-admin')
    const editor = stats.usersByRole.find((entry) => entry.name === 'dash-editor')
    const noRole = stats.usersByRole.find((entry) => entry.name === null)

    assert.equal(admin?.count, 2)
    assert.equal(editor?.count, 3)
    assert.equal(noRole?.count, beforeNoRole + 1)
    // Most populous first: editor (3) sorts ahead of admin (2).
    const editorIndex = stats.usersByRole.findIndex((entry) => entry.name === 'dash-editor')
    const adminIndex = stats.usersByRole.findIndex((entry) => entry.name === 'dash-admin')
    assert.isBelow(editorIndex, adminIndex)
  })

  test('execute() counts folders and breaks down files per folder', async ({ assert }) => {
    const action = await app.container.make(GetDashboardStatsAction)
    const before = await action.execute()

    const images = await FileFolderFactory.merge({ name: 'dash-images' }).create()
    const docs = await FileFolderFactory.merge({ name: 'dash-docs' }).create()
    await FileFolderFactory.merge({ name: 'dash-empty' }).create()
    await FileFactory.merge({ folderId: images.id }).createMany(2)
    await FileFactory.merge({ folderId: docs.id }).create()

    const stats = await action.execute()

    assert.equal(stats.counts.fileFolders, before.counts.fileFolders + 3)
    const imagesEntry = stats.filesByFolder.find((entry) => entry.name === 'dash-images')
    const docsEntry = stats.filesByFolder.find((entry) => entry.name === 'dash-docs')
    const emptyEntry = stats.filesByFolder.find((entry) => entry.name === 'dash-empty')
    assert.deepEqual(imagesEntry?.count, 2)
    assert.deepEqual(docsEntry?.count, 1)
    assert.deepEqual(emptyEntry?.count, 0)
  })
})
