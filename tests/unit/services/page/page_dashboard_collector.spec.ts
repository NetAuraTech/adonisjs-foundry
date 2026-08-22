import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';
import { PageDashboardCollector } from '#cms/domain/services/page/page_dashboard_collector';
import { PageFactory, PageTranslationFactory } from '#cms/factories/page_factory';

/**
 * The test database is not truncated between tests, so count assertions are
 * expressed as deltas against a baseline snapshot taken before seeding.
 */
test.group('PageDashboardCollector', () => {
	test('collect() returns the page count matching seeded data', async ({ assert }) => {
		const collector = await app.container.make(PageDashboardCollector);
		const before = await collector.collect({ recentLimit: 5 });

		await PageFactory.create();

		const after = await collector.collect({ recentLimit: 5 });

		assert.equal(after.pages, before.pages + 1);
	});

	test('collect() groups translation counts by status', async ({ assert }) => {
		const collector = await app.container.make(PageDashboardCollector);
		const before = await collector.collect({ recentLimit: 5 });

		const page = await PageFactory.create();
		await PageTranslationFactory.merge({
			pageId: page.id,
			status: 'published',
			publishedAt: DateTime.now(),
		}).create();
		await PageTranslationFactory.merge({ pageId: page.id, locale: 'fr', status: 'draft' }).create();
		await PageTranslationFactory.merge({
			pageId: page.id,
			locale: 'de',
			status: 'archived',
		}).create();

		const after = await collector.collect({ recentLimit: 5 });

		assert.equal(after.pageTranslations.published, before.pageTranslations.published + 1);
		assert.equal(after.pageTranslations.draft, before.pageTranslations.draft + 1);
		assert.equal(after.pageTranslations.archived, before.pageTranslations.archived + 1);
		assert.equal(after.pageTranslations.total, before.pageTranslations.total + 3);
	});

	test('collect() counts unique locales having at least one published translation', async ({ assert }) => {
		const collector = await app.container.make(PageDashboardCollector);
		const before = await collector.collect({ recentLimit: 5 });

		const page = await PageFactory.create();
		const otherPage = await PageFactory.create();
		// Two published translations in the same fresh locale: counts once.
		await PageTranslationFactory.merge({
			pageId: page.id,
			locale: 'xx',
			status: 'published',
			publishedAt: DateTime.now(),
		}).create();
		await PageTranslationFactory.merge({
			pageId: otherPage.id,
			locale: 'xx',
			status: 'published',
			publishedAt: DateTime.now(),
		}).create();
		// A draft in another fresh locale: never counts.
		await PageTranslationFactory.merge({
			pageId: page.id,
			locale: 'xy',
			status: 'draft',
		}).create();

		const after = await collector.collect({ recentLimit: 5 });

		assert.equal(after.publishedLocales, before.publishedLocales + 1);
	});

	test('collect() returns recently published translations ordered by recency and bounded by the limit', async ({
		assert,
	}) => {
		const collector = await app.container.make(PageDashboardCollector);
		const page = await PageFactory.create();

		// Explicit future timestamps keep ordering deterministic regardless of
		// rows created by other tests.
		const older = DateTime.now().plus({ days: 1 });
		const newer = DateTime.now().plus({ days: 2 });

		await PageTranslationFactory.merge({
			pageId: page.id,
			slug: `dash-older-${page.id}`,
			title: 'Dashboard Older Published',
			status: 'published',
			publishedAt: older,
		}).create();
		await PageTranslationFactory.merge({
			pageId: page.id,
			locale: 'fr',
			slug: `dash-newer-${page.id}`,
			title: 'Dashboard Newer Published',
			status: 'published',
			publishedAt: newer,
		}).create();
		// A draft with a future publishedAt must never appear in the recent list.
		await PageTranslationFactory.merge({
			pageId: page.id,
			locale: 'de',
			slug: `dash-draft-${page.id}`,
			title: 'Dashboard Draft Hidden',
			status: 'draft',
			publishedAt: DateTime.now().plus({ days: 3 }),
		}).create();

		const section = await collector.collect({ recentLimit: 5 });

		assert.equal(section.recentPublishedPages[0].title, 'Dashboard Newer Published');
		assert.equal(section.recentPublishedPages[0].pageId, page.id);
		assert.equal(section.recentPublishedPages[0].locale, 'fr');
		assert.isTrue(DateTime.isDateTime(section.recentPublishedPages[0].publishedAt));
		assert.equal(section.recentPublishedPages[1].title, 'Dashboard Older Published');
		assert.notInclude(
			section.recentPublishedPages.map((entry) => entry.title),
			'Dashboard Draft Hidden',
		);

		const bounded = await collector.collect({ recentLimit: 1 });
		assert.lengthOf(bounded.recentPublishedPages, 1);
	});

	test('collect() sorts published translations without a publication date last', async ({ assert }) => {
		const collector = await app.container.make(PageDashboardCollector);
		const page = await PageFactory.create();

		// Legacy rows published before `publishedAt` was stamped have a NULL date.
		await PageTranslationFactory.merge({
			pageId: page.id,
			slug: `dash-legacy-${page.id}`,
			title: 'Dashboard Legacy Undated',
			status: 'published',
			publishedAt: null,
		}).create();
		// A future timestamp keeps the dated row ahead of rows from other tests.
		await PageTranslationFactory.merge({
			pageId: page.id,
			locale: 'fr',
			slug: `dash-dated-${page.id}`,
			title: 'Dashboard Dated Published',
			status: 'published',
			publishedAt: DateTime.now().plus({ days: 3 }),
		}).create();

		// Wide window: other tests also seed published rows competing for the list.
		const section = await collector.collect({ recentLimit: 10 });
		const titles = section.recentPublishedPages.map((entry) => entry.title);

		assert.notEqual(titles.indexOf('Dashboard Dated Published'), -1);
		assert.notEqual(titles.indexOf('Dashboard Legacy Undated'), -1);
		assert.isBelow(titles.indexOf('Dashboard Dated Published'), titles.indexOf('Dashboard Legacy Undated'));
	});
});
