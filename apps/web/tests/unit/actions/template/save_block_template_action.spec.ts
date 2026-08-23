import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { SaveBlockTemplateAction } from '#cms/domain/actions/template/save_block_template_action';
import InvalidTemplateTypeException from '#cms/exceptions/template/invalid_template_type_exception';
import Template from '#cms/models/template/template';
import { UserFactory } from '#database/factories/user_factory';
import type { PageContent } from '#cms/types/page';

function cardContent(): PageContent {
	return {
		blocks: [
			{
				id: 'block-1',
				type: 'section',
				props: {},
				children: [
					{ id: 'block-2', type: 'title', props: { text: 'Title' } },
					{ id: 'block-3', type: 'paragraph', props: { text: 'Body' } },
				],
			},
		],
	} as PageContent;
}

test.group('SaveBlockTemplateAction', () => {
	test('execute() creates a new block template when no overwriteId', async ({ assert }) => {
		const action = await app.container.make(SaveBlockTemplateAction);
		const user = await UserFactory.create();

		const template = await action.execute({
			name: `Card Template ${Date.now()}`,
			description: 'Reusable card',
			blockType: 'section',
			content: cardContent(),
			userId: user.id,
		});

		assert.isNotNull(template.id);
		assert.equal(template.type, 'block');
		assert.equal(template.blockType, 'section');
	});

	test('execute() overwrites an existing block template when overwriteId is set', async ({ assert }) => {
		const action = await app.container.make(SaveBlockTemplateAction);
		const user = await UserFactory.create();

		const existing = await Template.create({
			name: `Old Card ${Date.now()}`,
			type: 'block',
			blockType: 'section',
			content: { blocks: [] },
			createdBy: user.id,
		});

		const updated = await action.execute({
			name: 'Renamed Card',
			description: null,
			blockType: 'section',
			content: cardContent(),
			overwriteId: existing.id,
			userId: user.id,
		});

		assert.equal(updated.id, existing.id);
		assert.equal(updated.name, 'Renamed Card');
		assert.lengthOf(updated.content.blocks, 1);
	});

	test('execute() throws E_INVALID_TEMPLATE_TYPE when overwriting a page template', async ({ assert }) => {
		const action = await app.container.make(SaveBlockTemplateAction);
		const user = await UserFactory.create();

		const pageTemplate = await Template.create({
			name: `Page Template ${Date.now()}`,
			type: 'page',
			content: { blocks: [] },
			createdBy: user.id,
		});

		await assert.rejects(async () => {
			await action.execute({
				name: 'Should Fail',
				blockType: 'section',
				content: cardContent(),
				overwriteId: pageTemplate.id,
				userId: user.id,
			});
		}, InvalidTemplateTypeException);
	});
});
