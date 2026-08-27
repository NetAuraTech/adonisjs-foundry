import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { ApplyToPageAction } from '#cms/actions/template/apply_to_page_action';
import MissingTranslationException from '#cms/exceptions/page/missing_translation_exception';
import InvalidTemplateTypeException from '#cms/exceptions/template/invalid_template_type_exception';
import Page from '#cms/models/page/page';
import PageTranslation from '#cms/models/page/page_translation';
import Template from '#cms/models/template/template';
import { type PageContent } from '#cms/types/page';
import { UserFactory } from '#factories/identity/user_factory';
import type { BlockType } from '#cms/types/page';

test.group('ApplyToPageAction', () => {
	test('execute() throws E_INVALID_TEMPLATE_TYPE for block templates', async ({ assert }) => {
		const action = await app.container.make(ApplyToPageAction);
		const user = await UserFactory.create();

		const template = await Template.create({
			name: `Block Template ${Date.now()}`,
			type: 'block',
			blockType: 'section',
			content: { blocks: [] },
			createdBy: null,
		});

		await assert.rejects(async () => {
			await action.execute({ templateId: template.id, pageId: 1, locale: 'en', userId: user.id });
		}, InvalidTemplateTypeException);
	});

	test('execute() throws E_MISSING_TRANSLATION when translation not found', async ({ assert }) => {
		const action = await app.container.make(ApplyToPageAction);
		const user = await UserFactory.create();

		const template = await Template.create({
			name: `Apply Template ${Date.now()}`,
			type: 'page',
			content: { blocks: [] },
			createdBy: null,
		});

		await assert.rejects(async () => {
			await action.execute({
				templateId: template.id,
				pageId: 999999,
				locale: 'en',
				userId: user.id,
			});
		}, MissingTranslationException);
	});

	test('execute() replaces translation content with template content', async ({ assert }) => {
		const action = await app.container.make(ApplyToPageAction);
		const user = await UserFactory.create();

		const page = await Page.create({ defaultLocale: 'en', createdBy: null });
		await PageTranslation.create({
			pageId: page.id,
			locale: 'en',
			slug: `apply-page-${page.id}`,
			title: 'Apply Page',
			content: { blocks: [] },
			status: 'draft' as any,
		});

		const templateContent: PageContent = {
			blocks: [
				{
					id: '1',
					type: 'title' as BlockType,
					props: {
						text: 'Template Title',
						level: 1,
						color: 'default',
						highlightColor: 'default',
					} as any,
				},
			],
		};
		const template = await Template.create({
			name: `Apply Template 2 ${Date.now()}`,
			type: 'page',
			content: templateContent,
			createdBy: null,
		});

		await action.execute({
			templateId: template.id,
			pageId: page.id,
			locale: 'en',
			userId: user.id,
		});

		const translation = await PageTranslation.findBy('pageId', page.id);
		assert.deepEqual(translation!.content, templateContent);
	});
});
