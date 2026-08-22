import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { GetPageDetailAction } from '#cms/domain/actions/page/get_page_detail_action';
import Page from '#cms/models/page/page';
import PageTranslation from '#cms/models/page/page_translation';

test.group('GetPageDetailAction', () => {
	test('execute() returns the page with translations preloaded', async ({ assert }) => {
		const action = await app.container.make(GetPageDetailAction);

		const page = await Page.create({ defaultLocale: 'en', createdBy: null });
		await PageTranslation.create({
			pageId: page.id,
			locale: 'en',
			slug: `detail-page-${page.id}`,
			title: 'Detail Test Page',
			content: { blocks: [] },
			status: 'draft' as any,
		});

		const result = await action.execute({ id: page.id });
		assert.equal(result.id, page.id);
	});

	test('execute() throws when page not found', async ({ assert }) => {
		const action = await app.container.make(GetPageDetailAction);

		await assert.rejects(async () => {
			await action.execute({ id: 999999 });
		});
	});
});
