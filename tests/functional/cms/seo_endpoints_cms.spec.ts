import { test } from '@japa/runner';
import { PageFactory, PageTranslationFactory } from '#cms/factories/page_factory';
import Page from '#cms/models/page/page';
import env from '#start/env';

/**
 * CMS functional tests for the SEO endpoints — verify that published page
 * URLs surface in the sitemap and draft URLs do not. Separated from the core
 * SEO tests so the `inertia` flavor can prune them with the CMS module.
 */
test.group('SEO endpoints (CMS pages)', (group) => {
	group.each.setup(async () => {
		await Page.query().where('is_homepage', true).update({ isHomepage: false });
	});

	test('GET /sitemap.xml includes the URL of a published page', async ({ client, assert }) => {
		const page = await PageFactory.merge({ isHomepage: false, defaultLocale: 'en' }).create();
		await PageTranslationFactory.merge({
			pageId: page.id,
			locale: 'en',
			slug: 'functional-sitemap-published',
			status: 'published',
		}).create();

		const res = await client.get('/sitemap.xml');

		res.assertStatus(200);
		assert.include(res.text(), `<loc>${env.get('APP_URL')}/functional-sitemap-published</loc>`);
	});

	test('GET /sitemap.xml excludes draft page URLs', async ({ client, assert }) => {
		const page = await PageFactory.merge({ isHomepage: false, defaultLocale: 'en' }).create();
		await PageTranslationFactory.merge({
			pageId: page.id,
			locale: 'en',
			slug: 'functional-sitemap-draft',
			status: 'draft',
		}).create();

		const res = await client.get('/sitemap.xml');

		res.assertStatus(200);
		assert.notInclude(res.text(), 'functional-sitemap-draft');
	});
});
