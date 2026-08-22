import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { DeletePageAction } from '#cms/domain/actions/page/delete_page_action';
import Page from '#cms/models/page/page';
import RowNotFoundException from '#exceptions/core/row_not_found_exception';

test.group('DeletePageAction', () => {
	test('execute() deletes the page and translations', async ({ assert }) => {
		const action = await app.container.make(DeletePageAction);

		const page = await Page.create({ defaultLocale: 'en', createdBy: null });

		await action.execute({ id: page.id });

		const found = await Page.find(page.id);
		assert.isNull(found);
	});

	test('execute() throws RowNotFoundException when page does not exist', async ({ assert }) => {
		const action = await app.container.make(DeletePageAction);

		await assert.rejects(async () => {
			await action.execute({ id: 999999 });
		}, RowNotFoundException);
	});
});
