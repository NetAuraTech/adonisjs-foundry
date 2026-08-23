import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { ToggleRevisionKeepAction } from '#cms/domain/actions/page/toggle_revision_keep_action';
import Page from '#cms/models/page/page';
import PageRevision from '#cms/models/page/page_revision';
import PageTranslation from '#cms/models/page/page_translation';
import { UserFactory } from '#database/factories/user_factory';

test.group('ToggleRevisionKeepAction', () => {
	test('execute() toggles the keep flag on a revision', async ({ assert }) => {
		const action = await app.container.make(ToggleRevisionKeepAction);
		const user = await UserFactory.create();

		const page = await Page.create({ defaultLocale: 'en', createdBy: null });
		const translation = await PageTranslation.create({
			pageId: page.id,
			locale: 'en',
			slug: `toggle-page-${page.id}`,
			title: 'Toggle Page',
			content: { blocks: [] },
			status: 'draft' as any,
		});

		await (translation as any).saveRevision(user.id);
		const revision = await PageRevision.query().where('page_translation_id', translation.id).first();
		assert.isNotNull(revision);

		const initialKeep = revision!.keep;
		const updated = await action.execute({ revisionId: revision!.id });
		assert.equal(updated.keep, !initialKeep);
	});
});
