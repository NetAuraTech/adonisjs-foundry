import { test } from '@japa/runner';
import Page from '#cms/models/page/page';
import PageRevision from '#cms/models/page/page_revision';
import PageTranslation from '#cms/models/page/page_translation';
import Template from '#cms/models/template/template';
import User from '#identity/models/user';
import { lucidMeta, pinDrift, pinEnvelope, serializePayload } from '#tests/helpers/openapi_drift';
import {
	pageSchema,
	pageRevisionSchema,
	pageSearchResultSchema,
	pageTranslationSchema,
} from '#transport/cms/rest/pages_resource';
import { templateEnvelope, templateSchema } from '#transport/cms/rest/templates_resource';
import PageRevisionTransformer from '#transport/cms/transformers/page_revision_transformer';
import PageSearchResultTransformer from '#transport/cms/transformers/page_search_result_transformer';
import PageTransformer from '#transport/cms/transformers/page_transformer';
import PageTranslationTransformer from '#transport/cms/transformers/page_translation_transformer';
import TemplateTransformer from '#transport/cms/transformers/template_transformer';
import { dataEnvelope, paginatedEnvelope } from '#transport/core/openapi/schemas';

const now = new Date('2026-01-15T10:00:00.000Z');

function makeTranslation(locale: string): PageTranslation {
	const translation = new PageTranslation();
	Object.assign(translation, {
		id: 1,
		pageId: 1,
		locale,
		slug: `home-${locale}`,
		title: `Home ${locale}`,
		status: 'published',
		metaTitle: null,
		metaDescription: null,
		content: { root: { type: 'paragraph', text: `Content ${locale}` } },
		resolved_content: { root: { type: 'paragraph', text: `Content ${locale}` } },
		updatedAt: now,
	});
	return translation;
}

function makePage(): Page {
	const page = new Page();
	Object.assign(page, {
		id: 1,
		defaultLocale: 'en',
		isHomepage: true,
		createdAt: now,
		updatedAt: now,
	});
	page.$setRelated('translations', [makeTranslation('en'), makeTranslation('fr')]);
	return page;
}

function makeRevision(): PageRevision {
	const revision = new PageRevision();
	Object.assign(revision, {
		id: 1,
		keep: true,
		pageTranslationId: 1,
		content: { root: { type: 'paragraph', text: 'Draft content' } },
		createdAt: now,
	});
	const author = new User();
	Object.assign(author, { id: 7, username: 'alice' });
	revision.$setRelated('author', author);
	return revision;
}

function makeTemplate(): Template {
	const template = new Template();
	Object.assign(template, {
		id: 1,
		name: 'Hero section',
		description: null,
		type: 'block',
		blockType: 'section',
		createdAt: now,
		content: { root: { type: 'section' } },
	});
	return template;
}

test.group('OpenAPI drift — CMS schemas', () => {
	test('page payload (with translations) is pinned to pageSchema', async () => {
		const payload = await serializePayload(await new PageTransformer(makePage()).toObject());

		pinDrift(pageSchema, payload, 'page');
	});

	test('page show and list envelopes conform to the documented envelopes', async () => {
		const payload = await serializePayload(await new PageTransformer(makePage()).toObject());

		pinEnvelope(dataEnvelope(pageSchema), { data: payload }, 'page show envelope');
		pinEnvelope(paginatedEnvelope(pageSchema), { data: [payload], metadata: lucidMeta() }, 'page list envelope');
	});

	test('page translation payload is pinned to pageTranslationSchema', async () => {
		const payload = await serializePayload(new PageTranslationTransformer(makeTranslation('en')).toObject());

		pinDrift(pageTranslationSchema, payload, 'page translation');
	});

	test('page revision payload is pinned to pageRevisionSchema', async () => {
		const payload = await serializePayload(new PageRevisionTransformer(makeRevision()).toObject());

		pinDrift(pageRevisionSchema, payload, 'page revision');
	});

	test('page search result payload is pinned to pageSearchResultSchema', async () => {
		const payload = await serializePayload(
			await new PageSearchResultTransformer({ page: makePage(), matchedLocales: ['en', 'fr'] }).toObject(),
		);

		pinDrift(pageSearchResultSchema, payload, 'page search result');
	});

	test('template payload is pinned to templateSchema', async () => {
		const payload = await serializePayload(await new TemplateTransformer(makeTemplate()).toObject());

		pinDrift(templateSchema, payload, 'template');
	});

	test('template envelopes conform to the documented named wraps', async () => {
		const payload = await serializePayload(await new TemplateTransformer(makeTemplate()).toObject());

		pinEnvelope(templateEnvelope(true), { template: payload }, 'template show envelope');
		pinEnvelope(templateEnvelope(false), { templates: [payload] }, 'template list envelope');
	});

	test('a dropped documented field is rejected', async ({ assert }) => {
		const payload = await serializePayload(await new PageTransformer(makePage()).toObject());
		delete payload.translations;

		assert.throws(() => pinDrift(pageSchema, payload, 'page'), /missing from payload: \[translations\]/);
	});
});
