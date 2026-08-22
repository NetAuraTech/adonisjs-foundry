import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { RestoreRevisionAction } from '#cms/domain/actions/page/restore_revision_action';
import Page from '#cms/models/page/page';
import PageRevision from '#cms/models/page/page_revision';
import PageTranslation from '#cms/models/page/page_translation';
import { UserFactory } from '#database/factories/user_factory';
import RowNotFoundException from '#exceptions/core/row_not_found_exception';

test.group('RestoreRevisionAction', () => {
	test('execute() restores translation to previous revision content', async ({ assert }) => {
		const action = await app.container.make(RestoreRevisionAction);
		const user = await UserFactory.create();

		const page = await Page.create({ defaultLocale: 'en', createdBy: null });
		const translation = await PageTranslation.create({
			pageId: page.id,
			locale: 'en',
			slug: `restore-page-${page.id}`,
			title: 'Restore Page',
			content: { blocks: [] },
			status: 'draft' as any,
		});

		await (translation as any).saveRevision(user.id);
		const revision = await PageRevision.query().where('pageTranslationId', translation.id).first();
		assert.isNotNull(revision);

		await action.execute({
			translationId: translation.id,
			revisionId: revision!.id,
			userId: user.id,
		});
	});

	test('execute() throws E_ROW_NOT_FOUND when translation does not exist', async ({ assert }) => {
		const action = await app.container.make(RestoreRevisionAction);
		const user = await UserFactory.create();

		await assert.rejects(async () => {
			await action.execute({ translationId: 999999, revisionId: 1, userId: user.id });
		}, RowNotFoundException);
	});
});
