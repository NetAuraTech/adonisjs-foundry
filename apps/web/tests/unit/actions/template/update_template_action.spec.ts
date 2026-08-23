import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { UpdateTemplateAction } from '#cms/domain/actions/template/update_template_action';
import Template from '#cms/models/template/template';
import { FileFactory } from '#factories/file_factory';

test.group('UpdateTemplateAction', () => {
	test('execute() updates template fields', async ({ assert }) => {
		const action = await app.container.make(UpdateTemplateAction);

		const template = await Template.create({
			name: `Old Name ${Date.now()}`,
			type: 'page',
			content: { blocks: [] },
			createdBy: null,
		});

		const updated = await action.execute({ id: template.id, name: 'New Name' });
		assert.equal(updated.name, 'New Name');
	});

	test('execute() stores a thumbnail via thumbnailId and it resolves', async ({ assert }) => {
		const action = await app.container.make(UpdateTemplateAction);

		const file = await FileFactory.create();
		const template = await Template.create({
			name: `Thumbnail Template ${Date.now()}`,
			type: 'page',
			content: { blocks: [] },
			createdBy: null,
		});

		const updated = await action.execute({ id: template.id, thumbnailId: file.id });
		assert.equal(updated.thumbnailId, file.id);

		// The stored thumbnail resolves through the relationship.
		await updated.load('thumbnail');
		assert.equal(updated.thumbnail.id, file.id);
	});

	test('execute() clears the thumbnail when thumbnailId is null', async ({ assert }) => {
		const action = await app.container.make(UpdateTemplateAction);

		const file = await FileFactory.create();
		const template = await Template.create({
			name: `Thumbnail Clear ${Date.now()}`,
			type: 'page',
			content: { blocks: [] },
			thumbnailId: file.id,
			createdBy: null,
		});

		const updated = await action.execute({ id: template.id, thumbnailId: null });
		assert.isNull(updated.thumbnailId);
	});
});
