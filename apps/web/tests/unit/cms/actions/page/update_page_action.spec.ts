import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { UpdatePageAction } from '#cms/actions/page/update_page_action';
import MissingTranslationException from '#cms/exceptions/page/missing_translation_exception';
import Page from '#cms/models/page/page';
import PageTranslation from '#cms/models/page/page_translation';
import SlugExistsException from '#core/exceptions/slug_exists_exception';
import { UserFactory } from '#factories/identity/user_factory';

test.group('UpdatePageAction', () => {
	test('execute() updates page translation fields', async ({ assert }) => {
		const action = await app.container.make(UpdatePageAction);
		const user = await UserFactory.create();

		const page = await Page.create({ defaultLocale: 'en', createdBy: null });
		await PageTranslation.create({
			pageId: page.id,
			locale: 'en',
			slug: `update-page-${page.id}`,
			title: 'Old Title',
			content: { blocks: [] },
			status: 'draft' as any,
		});

		const updated = await action.execute({
			pageId: page.id,
			locale: 'en',
			title: 'New Title',
			userId: user.id,
		});

		assert.equal(updated.title, 'New Title');
	});

	test('execute() throws E_MISSING_TRANSLATION when translation does not exist', async ({ assert }) => {
		const action = await app.container.make(UpdatePageAction);
		const user = await UserFactory.create();

		await assert.rejects(async () => {
			await action.execute({ pageId: 999999, locale: 'en', title: 'New Title', userId: user.id });
		}, MissingTranslationException);
	});

	test('execute() throws E_SLUG_EXISTS when new slug is taken', async ({ assert }) => {
		const action = await app.container.make(UpdatePageAction);
		const user = await UserFactory.create();

		const page1 = await Page.create({ defaultLocale: 'en', createdBy: null });
		const page2 = await Page.create({ defaultLocale: 'en', createdBy: null });

		await PageTranslation.create({
			pageId: page1.id,
			locale: 'en',
			slug: `taken-slug-${page1.id}`,
			title: 'Taken',
			content: { blocks: [] },
			status: 'draft' as any,
		});
		await PageTranslation.create({
			pageId: page2.id,
			locale: 'en',
			slug: `other-slug-${page2.id}`,
			title: 'Other',
			content: { blocks: [] },
			status: 'draft' as any,
		});

		await assert.rejects(async () => {
			await action.execute({
				pageId: page2.id,
				locale: 'en',
				slug: `taken-slug-${page1.id}`,
				userId: user.id,
			});
		}, SlugExistsException);
	});
});
