import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { CreatePageAction } from '#cms/domain/actions/page/create_page_action';
import Page from '#cms/models/page/page';
import PageTranslation from '#cms/models/page/page_translation';
import { UserFactory } from '#database/factories/user_factory';
import SlugExistsException from '#exceptions/core/slug_exists_exception';

test.group('CreatePageAction', () => {
	test('execute() creates a new page with initial translation', async ({ assert }) => {
		const action = await app.container.make(CreatePageAction);
		const user = await UserFactory.create();

		const page = await action.execute({
			defaultLocale: 'en',
			translation: {
				locale: 'en',
				slug: `create-page-${Date.now()}`,
				title: 'Created Page',
				content: { blocks: [] },
			},
			userId: user.id,
		});

		assert.isNotNull(page.id);
		assert.equal(page.defaultLocale, 'en');
	});

	test('execute() throws E_SLUG_EXISTS when slug is taken', async ({ assert }) => {
		const action = await app.container.make(CreatePageAction);
		const user = await UserFactory.create();

		const page1 = await Page.create({ defaultLocale: 'en', createdBy: null });
		await PageTranslation.create({
			pageId: page1.id,
			locale: 'en',
			slug: `duplicate-slug-${page1.id}`,
			title: 'Dup Slug',
			content: { blocks: [] },
			status: 'draft' as any,
		});

		await assert.rejects(async () => {
			await action.execute({
				defaultLocale: 'en',
				translation: {
					locale: 'en',
					slug: `duplicate-slug-${page1.id}`,
					title: 'Dup Page 2',
					content: { blocks: [] },
				},
				userId: user.id,
			});
		}, SlugExistsException);
	});
});
