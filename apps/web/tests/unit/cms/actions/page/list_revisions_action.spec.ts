import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { ListRevisionsAction } from '#cms/actions/page/list_revisions_action';
import Page from '#cms/models/page/page';
import PageTranslation from '#cms/models/page/page_translation';
import { UserFactory } from '#factories/identity/user_factory';

test.group('ListRevisionsAction', () => {
	test('execute() returns revisions for a page', async ({ assert }) => {
		const action = await app.container.make(ListRevisionsAction);
		const user = await UserFactory.create();

		const page = await Page.create({ defaultLocale: 'en', createdBy: null });
		const translation = await PageTranslation.create({
			pageId: page.id,
			locale: 'en',
			slug: `revisions-page-${page.id}`,
			title: 'Revisions Page',
			content: { blocks: [] },
			status: 'draft' as any,
		});

		await (translation as any).saveRevision(user.id);

		const result = await action.execute({
			pageId: translation.id,
			pagination: { page: 1, perPage: 20 },
		});
		assert.isDefined(result);
	});
});
