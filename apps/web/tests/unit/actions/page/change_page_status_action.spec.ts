import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { ChangePageStatusAction } from '#cms/domain/actions/page/change_page_status_action';
import MissingTranslationException from '#cms/exceptions/page/missing_translation_exception';
import Page from '#cms/models/page/page';
import PageTranslation from '#cms/models/page/page_translation';

test.group('ChangePageStatusAction', () => {
	test('execute() changes the page status', async ({ assert }) => {
		const action = await app.container.make(ChangePageStatusAction);

		const page = await Page.create({ defaultLocale: 'en', createdBy: null });
		await PageTranslation.create({
			pageId: page.id,
			locale: 'en',
			slug: `status-page-${page.id}`,
			title: 'Status Page',
			content: { blocks: [] },
			status: 'draft' as any,
		});

		const updated = await action.execute({ pageId: page.id, locale: 'en', status: 'published' });
		assert.equal(updated.status, 'published');
	});

	test('execute() stamps publishedAt when publishing', async ({ assert }) => {
		const action = await app.container.make(ChangePageStatusAction);

		const page = await Page.create({ defaultLocale: 'en', createdBy: null });
		await PageTranslation.create({
			pageId: page.id,
			locale: 'en',
			slug: `stamp-page-${page.id}`,
			title: 'Stamp Page',
			content: { blocks: [] },
			status: 'draft' as any,
		});

		const published = await action.execute({ pageId: page.id, locale: 'en', status: 'published' });
		assert.isNotNull(published.publishedAt);

		// Unpublishing keeps the last publication date as historical information.
		const archived = await action.execute({ pageId: page.id, locale: 'en', status: 'archived' });
		assert.isNotNull(archived.publishedAt);
	});

	test('execute() throws E_MISSING_TRANSLATION when translation does not exist', async ({ assert }) => {
		const action = await app.container.make(ChangePageStatusAction);

		await assert.rejects(async () => {
			await action.execute({ pageId: 999999, locale: 'en', status: 'published' });
		}, MissingTranslationException);
	});
});
