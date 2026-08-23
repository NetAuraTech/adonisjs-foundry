import { test } from '@japa/runner';
import { PageRepository } from '#cms/domain/repositories/page/page_repository';
import { PageSitemapCollector } from '#cms/domain/services/page/page_sitemap_collector';
import { PageFactory, PageTranslationFactory } from '#cms/factories/page_factory';
import Page from '#cms/models/page/page';
import env from '#start/env';

/**
 * Integration tests for `PageSitemapCollector`.
 *
 * The contributor is exercised against a real database through the Lucid
 * factories, verifying the URL-building rules (homepage, default-locale
 * subpage, non-default-locale subpage) and that draft translations are
 * excluded. These tests replace the URL-rule cases previously covered by the
 * dissolved `GenerateSitemapAction` unit spec.
 */
test.group('PageSitemapCollector', (group) => {
	const collector = new PageSitemapCollector(new PageRepository());
	const baseUrl = env.get('APP_URL');

	// Clear any existing homepage before each test to avoid the
	// `pages_unique_homepage` partial unique constraint (same pattern as the
	// PageRepository integration spec).
	group.each.setup(async () => {
		await Page.query().where('is_homepage', true).update({ isHomepage: false });
	});

	test('collect() returns the contributor name "page"', ({ assert }) => {
		assert.equal(collector.name, 'page');
	});

	test('collect() emits / for a published homepage in the default locale', async ({ assert }) => {
		const homepage = await PageFactory.merge({ isHomepage: true, defaultLocale: 'en' }).create();
		await PageTranslationFactory.merge({
			pageId: homepage.id,
			locale: 'en',
			slug: 'home',
			status: 'published',
		}).create();

		const urls = await collector.collect();

		assert.include(urls, `${baseUrl}/`);
	});

	test('collect() emits /{slug} for a published subpage in the default locale', async ({ assert }) => {
		const page = await PageFactory.merge({ isHomepage: false, defaultLocale: 'en' }).create();
		await PageTranslationFactory.merge({
			pageId: page.id,
			locale: 'en',
			slug: 'default-locale-subpage',
			status: 'published',
		}).create();

		const urls = await collector.collect();

		assert.include(urls, `${baseUrl}/default-locale-subpage`);
	});

	test('collect() emits /{locale}/{slug} for a published subpage in a non-default locale', async ({ assert }) => {
		const page = await PageFactory.merge({ isHomepage: false, defaultLocale: 'en' }).create();
		await PageTranslationFactory.merge({
			pageId: page.id,
			locale: 'fr',
			slug: 'a-propos',
			status: 'published',
		}).create();

		const urls = await collector.collect();

		assert.include(urls, `${baseUrl}/fr/a-propos`);
	});

	test('collect() emits /{locale}/ for a published homepage in a non-default locale', async ({ assert }) => {
		const homepage = await PageFactory.merge({ isHomepage: true, defaultLocale: 'en' }).create();
		await PageTranslationFactory.merge({
			pageId: homepage.id,
			locale: 'fr',
			slug: 'accueil',
			status: 'published',
		}).create();

		const urls = await collector.collect();

		assert.include(urls, `${baseUrl}/fr/`);
	});

	test('collect() excludes draft translations', async ({ assert }) => {
		const page = await PageFactory.merge({ isHomepage: false, defaultLocale: 'en' }).create();
		await PageTranslationFactory.merge({
			pageId: page.id,
			locale: 'en',
			slug: 'draft-only-subpage',
			status: 'draft',
		}).create();

		const urls = await collector.collect();

		assert.isFalse(urls.some((url) => url.includes('/draft-only-subpage')));
	});

	test('collect() includes the published translation of a mixed-status page only', async ({ assert }) => {
		const page = await PageFactory.merge({ isHomepage: false, defaultLocale: 'en' }).create();
		await PageTranslationFactory.merge({
			pageId: page.id,
			locale: 'en',
			slug: 'mixed-published',
			status: 'published',
		}).create();
		await PageTranslationFactory.merge({
			pageId: page.id,
			locale: 'fr',
			slug: 'mixed-draft',
			status: 'draft',
		}).create();

		const urls = await collector.collect();

		assert.include(urls, `${baseUrl}/mixed-published`);
		assert.isFalse(urls.some((url) => url.includes('/fr/mixed-draft')));
	});
});
