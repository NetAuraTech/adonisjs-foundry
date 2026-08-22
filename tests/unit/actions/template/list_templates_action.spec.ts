import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { ListTemplatesAction } from '#cms/domain/actions/template/list_templates_action';
import Template from '#cms/models/template/template';

test.group('ListTemplatesAction', () => {
	test('execute() returns templates with optional filters', async ({ assert }) => {
		const action = await app.container.make(ListTemplatesAction);

		await Template.create({
			name: `Template A ${Date.now()}`,
			type: 'page',
			content: { blocks: [] },
			createdBy: null,
		});

		let result = await action.execute();
		assert.isAbove(result.length, 0);

		result = await action.execute({ type: 'page' });
		assert.isAbove(result.length, 0);
	});
});
