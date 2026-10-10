/*
|--------------------------------------------------------------------------
| Cms API routes
|--------------------------------------------------------------------------
|
| Versioned REST API (access-token guard) for the CMS resources
| (`/api/v1/admin/pages`, `/api/v1/admin/templates`,
| `/api/v1/admin/builder`). Self-registers on import (see
| `app/cms/routes.ts`), gated by the `adminApi` and `cms` feature flags.
| Public URLs are unchanged from the previous `start/routes` placement;
| route names carry the `api.v1.admin.cms` prefix.
|
*/

import router from '@adonisjs/core/services/router';
import vine from '@vinejs/vine';
import { enabledAuthGuards } from '#config/auth';
import features from '#config/features';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { apiClientThrottle } from '#start/limiter';
import { permissions } from '#start/permissions';
import { builderOperationValidator, builderPresenceValidator } from '#transport/cms/validators/builder';
import {
	listPageValidator,
	showPageValidator,
	searchPagesValidator,
	createPageValidator,
	updatePageValidator,
	publishPageValidator,
	createTranslationValidator,
} from '#transport/cms/validators/page';
import {
	listTemplateValidator,
	showTemplateValidator,
	createBlockTemplateValidator,
	createFromPageValidator,
	updateTemplateValidator,
} from '#transport/cms/validators/template';
import { maintenanceMiddleware } from '#transport/core/maintenance';
import { registerApiDoc, type JsonSchema } from '#transport/core/openapi/api_docs_registry';
import {
	dateTime,
	errorSchema,
	validationErrorSchema,
	dataEnvelope,
	paginatedEnvelope,
} from '#transport/core/openapi/schemas';

/**
 * Same shared guard list as the admin REST surface: the in-repo admin UI
 * (session guard) and external API clients (access-token guard) consume the
 * same endpoints. Guards that are disabled in `config/auth.ts` never reach
 * `authenticateUsing`.
 */
const apiGuards = enabledAuthGuards.api ? (['web', 'api'] as const) : (['web'] as const);

const pageTranslationSchema: JsonSchema = {
	type: 'object',
	properties: {
		id: { type: 'number' },
		pageId: { type: 'number' },
		locale: { type: 'string' },
		slug: { type: 'string' },
		title: { type: 'string' },
		status: { type: 'string', enum: ['draft', 'published', 'archived'] },
		metaTitle: { type: 'string', nullable: true },
		metaDescription: { type: 'string', nullable: true },
		content: { type: 'object' },
		resolved_content: { type: 'object', nullable: true },
		updatedAt: dateTime,
	},
};

const pageSchema: JsonSchema = {
	type: 'object',
	properties: {
		id: { type: 'number' },
		defaultLocale: { type: 'string' },
		isHomepage: { type: 'boolean' },
		createdAt: dateTime,
		updatedAt: dateTime,
		translations: { type: 'array', items: pageTranslationSchema },
	},
};

const pageRevisionSchema: JsonSchema = {
	type: 'object',
	properties: {
		id: { type: 'number' },
		keep: { type: 'boolean' },
		createdAt: dateTime,
		created_by: {
			type: 'object',
			properties: {
				id: { type: 'number' },
				username: { type: 'string' },
			},
			nullable: true,
		},
	},
};

const pageSearchResultSchema: JsonSchema = {
	type: 'object',
	properties: {
		page: pageSchema,
		matchedLocales: { type: 'array', items: { type: 'string' } },
	},
};

const templateSchema: JsonSchema = {
	type: 'object',
	properties: {
		id: { type: 'number' },
		name: { type: 'string' },
		description: { type: 'string', nullable: true },
		type: { type: 'string', enum: ['page', 'block'] },
		blockType: { type: 'string', nullable: true },
		createdAt: dateTime,
		content: { type: 'object' },
		thumbnail: {
			type: 'object',
			properties: {
				id: { type: 'number' },
				url: { type: 'string' },
			},
			nullable: true,
		},
	},
};

const templateEnvelope = (singular: boolean): JsonSchema => ({
	type: 'object',
	properties: singular ? { template: templateSchema } : { templates: { type: 'array', items: templateSchema } },
});

const pagePreviewTokenValidator = vine.create({
	pageId: vine.number().positive(),
	locale: vine.string().trim().maxLength(10).optional(),
});

const templatePreviewTokenValidator = vine.create({
	id: vine.number().positive(),
	locale: vine.string().trim().maxLength(10).optional(),
});

const revisionsPathValidator = vine.create({
	id: vine.number().positive(),
	translationId: vine.number().positive(),
});

const revisionTargetPathValidator = vine.create({
	id: vine.number().positive(),
	translationId: vine.number().positive(),
	revisionId: vine.number().positive(),
});

const saveDraftBodyValidator = vine.create({
	content: vine.any(),
});

if (features.adminApi && features.cms) {
	registerApiDoc('api.v1.admin.cms.pages.index', {
		summary: 'List pages',
		description: 'Paginated page listing, filterable by status, locale and search term.',
		tags: ['Pages'],
		request: [{ validator: listPageValidator, in: 'query' }],
		paginated: true,
		responses: {
			'200': { description: 'The paginated page list.', schema: paginatedEnvelope(pageSchema) },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.pages.store', {
		summary: 'Create a page',
		tags: ['Pages'],
		request: [{ validator: createPageValidator, in: 'body' }],
		responses: {
			'201': { description: 'The created page.', schema: dataEnvelope(pageSchema) },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.pages.search', {
		summary: 'Search pages (full-text)',
		tags: ['Pages'],
		request: [{ validator: searchPagesValidator, in: 'query' }],
		responses: {
			'200': {
				description: 'The search results (empty when the search engine is unavailable).',
				schema: dataEnvelope({
					type: 'object',
					properties: {
						available: { type: 'boolean' },
						results: { type: 'array', items: pageSearchResultSchema },
					},
				}),
			},
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.pages.show', {
		summary: 'Show a page',
		tags: ['Pages'],
		request: [{ validator: showPageValidator, in: 'path' }],
		responses: {
			'200': { description: 'The page with its translations.', schema: dataEnvelope(pageSchema) },
			'404': { description: 'The page does not exist.', schema: errorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.pages.update', {
		summary: 'Update a page translation',
		tags: ['Pages'],
		request: [
			{ validator: showPageValidator, in: 'path' },
			{ validator: updatePageValidator, in: 'body' },
		],
		responses: {
			'200': { description: 'The updated page.', schema: dataEnvelope(pageSchema) },
			'404': { description: 'The page does not exist.', schema: errorSchema },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.pages.destroy', {
		summary: 'Delete a page',
		tags: ['Pages'],
		request: [{ validator: showPageValidator, in: 'path' }],
		responses: {
			'204': { description: 'The page was deleted.' },
			'404': { description: 'The page does not exist.', schema: errorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.pages.publish', {
		summary: 'Publish a page translation',
		tags: ['Pages'],
		request: [
			{ validator: showPageValidator, in: 'path' },
			{ validator: publishPageValidator, in: 'body' },
		],
		responses: {
			'200': { description: 'The published page.', schema: dataEnvelope(pageSchema) },
			'404': { description: 'The page does not exist.', schema: errorSchema },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.pages.unpublish', {
		summary: 'Unpublish a page translation',
		tags: ['Pages'],
		request: [
			{ validator: showPageValidator, in: 'path' },
			{ validator: publishPageValidator, in: 'body' },
		],
		responses: {
			'200': { description: 'The unpublished page.', schema: dataEnvelope(pageSchema) },
			'404': { description: 'The page does not exist.', schema: errorSchema },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.pages.set_homepage', {
		summary: 'Set a page as the homepage',
		tags: ['Pages'],
		request: [{ validator: showPageValidator, in: 'path' }],
		responses: {
			'200': { description: 'The updated page.', schema: dataEnvelope(pageSchema) },
			'404': { description: 'The page does not exist.', schema: errorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.page_translations.store', {
		summary: 'Create a page translation',
		tags: ['Pages'],
		request: [
			{ validator: showPageValidator, in: 'path' },
			{ validator: createTranslationValidator, in: 'body' },
		],
		responses: {
			'201': { description: 'The page with its new translation.', schema: dataEnvelope(pageSchema) },
			'404': { description: 'The page does not exist.', schema: errorSchema },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.page_revisions.index', {
		summary: "List a page translation's revisions",
		tags: ['Pages'],
		request: [{ validator: revisionsPathValidator, in: 'path' }],
		paginated: true,
		responses: {
			'200': {
				description: 'The paginated revision list.',
				schema: paginatedEnvelope(pageRevisionSchema),
			},
			'404': { description: 'The page does not exist.', schema: errorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.page_revisions.restore', {
		summary: 'Restore a page revision',
		tags: ['Pages'],
		request: [{ validator: revisionTargetPathValidator, in: 'path' }],
		responses: {
			'200': {
				description: 'The restore confirmation.',
				schema: dataEnvelope({
					type: 'object',
					properties: { restored: { type: 'boolean' } },
				}),
			},
			'404': { description: 'The page or revision does not exist.', schema: errorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.page_revisions.toggle', {
		summary: "Toggle a page revision's keep flag",
		tags: ['Pages'],
		request: [{ validator: revisionTargetPathValidator, in: 'path' }],
		responses: {
			'200': {
				description: 'The pinned revision.',
				schema: dataEnvelope({
					type: 'object',
					properties: { pinned: pageRevisionSchema },
				}),
			},
			'404': { description: 'The page or revision does not exist.', schema: errorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.pages_preview.token', {
		summary: 'Issue a page preview token',
		description: 'Short-lived HMAC token for the page preview iframe.',
		tags: ['Pages'],
		request: [{ validator: pagePreviewTokenValidator, in: 'query' }],
		responses: {
			'200': {
				description: 'The preview token.',
				schema: {
					type: 'object',
					properties: { token: { type: 'string' } },
				},
			},
			'400': { description: 'The `pageId` query parameter is missing or invalid.', schema: errorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.templates.index', {
		summary: 'List templates',
		description: 'Filterable by type, block type and search term (legacy `{ templates }` envelope).',
		tags: ['Templates'],
		request: [{ validator: listTemplateValidator, in: 'query' }],
		responses: {
			'200': { description: 'The template list.', schema: templateEnvelope(false) },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.templates.store', {
		summary: 'Create a block template',
		tags: ['Templates'],
		request: [{ validator: createBlockTemplateValidator, in: 'body' }],
		responses: {
			'201': { description: 'The created template.', schema: templateEnvelope(true) },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.templates.update', {
		summary: 'Update a template',
		tags: ['Templates'],
		request: [
			{ validator: showTemplateValidator, in: 'path' },
			{ validator: updateTemplateValidator, in: 'body' },
		],
		responses: {
			'200': { description: 'The updated template.', schema: templateEnvelope(true) },
			'404': { description: 'The template does not exist.', schema: errorSchema },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.templates.destroy', {
		summary: 'Delete a template',
		tags: ['Templates'],
		request: [{ validator: showTemplateValidator, in: 'path' }],
		responses: {
			'204': { description: 'The template was deleted.' },
			'404': { description: 'The template does not exist.', schema: errorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.templates.create_from_page', {
		summary: 'Create a template from a page',
		tags: ['Templates'],
		request: [{ validator: createFromPageValidator, in: 'body' }],
		responses: {
			'201': { description: 'The created template.', schema: templateEnvelope(true) },
			'404': { description: 'The page does not exist.', schema: errorSchema },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.templates_preview.token', {
		summary: 'Issue a template preview token',
		description: 'Short-lived HMAC token for the template preview (thumbnail capture).',
		tags: ['Templates'],
		request: [{ validator: templatePreviewTokenValidator, in: 'query' }],
		responses: {
			'200': {
				description: 'The preview token.',
				schema: {
					type: 'object',
					properties: { token: { type: 'string' } },
				},
			},
			'400': { description: 'The `id` query parameter is missing or invalid.', schema: errorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.builder_operations.execute', {
		summary: 'Execute a builder operation',
		description:
			'Validates the operation envelope and the op-specific payload, then broadcasts it over the translation channel. The response shape depends on the operation (operation id, lock, or release confirmation).',
		tags: ['Builder'],
		request: [{ validator: builderOperationValidator, in: 'body' }],
		responses: {
			'200': { description: 'The operation result.', schema: { type: 'object' } },
			'400': { description: 'The operation payload is invalid for its type.', schema: errorSchema },
			'409': { description: 'The field is locked by another editor.', schema: errorSchema },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.builder_operations.presence', {
		summary: 'Show the builder presence of a translation',
		description: 'Active sessions, field locks, and the stored draft of the translation.',
		tags: ['Builder'],
		request: [{ validator: builderPresenceValidator, in: 'path' }],
		responses: {
			'200': {
				description: 'The presence snapshot.',
				schema: {
					type: 'object',
					properties: {
						sessions: { type: 'array', items: { type: 'object' } },
						draft: { type: 'object', nullable: true },
						locks: { type: 'array', items: { type: 'object' } },
					},
				},
			},
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
	registerApiDoc('api.v1.admin.cms.builder_operations.save_draft', {
		summary: 'Save a builder draft',
		tags: ['Builder'],
		request: [
			{ validator: vine.create({ translationId: vine.number().positive() }), in: 'path' },
			{ validator: saveDraftBodyValidator, in: 'body' },
		],
		responses: {
			'200': {
				description: 'The save confirmation.',
				schema: {
					type: 'object',
					properties: { saved: { type: 'boolean' } },
				},
			},
			'400': { description: 'The `content` body field is missing.', schema: errorSchema },
		},
	});

	router
		.group(() => {
			router
				.group(() => {
					// Pages
					router
						.group(() => {
							router
								.get('/', [controllers.cms.api.PagesApi, 'index'])
								.as('cms.pages.index')
								.use([middleware.permission({ permissions: [permissions.pages.view] })]);
							router
								.post('/', [controllers.cms.api.PagesCreateApi, 'store'])
								.as('cms.pages.store')
								.use([middleware.permission({ permissions: [permissions.pages.create] })]);
							router
								.get('/search', [controllers.cms.api.PagesApi, 'search'])
								.as('cms.pages.search')
								.use([middleware.permission({ permissions: [permissions.pages.view] })]);
							router
								.get('/:id', [controllers.cms.api.PagesShowApi, 'show'])
								.as('cms.pages.show')
								.use([middleware.permission({ permissions: [permissions.pages.view] })]);
							router
								.put('/:id', [controllers.cms.api.PagesUpdateApi, 'update'])
								.as('cms.pages.update')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.delete('/:id', [controllers.cms.api.PagesDeleteApi, 'destroy'])
								.as('cms.pages.destroy')
								.use([middleware.permission({ permissions: [permissions.pages.delete] })]);
							router
								.put('/:id/publish', [controllers.cms.api.PagesUpdateApi, 'publish'])
								.as('cms.pages.publish')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.put('/:id/unpublish', [controllers.cms.api.PagesUpdateApi, 'unpublish'])
								.as('cms.pages.unpublish')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.put('/:id/homepage', [controllers.cms.api.PagesApi, 'setHomepage'])
								.as('cms.pages.set_homepage')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.post('/:id/translations', [controllers.cms.api.PageTranslationsApi, 'store'])
								.as('cms.page_translations.store')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.group(() => {
									router
										.get('/', [controllers.cms.api.PageRevisionsApi, 'index'])
										.as('cms.page_revisions.index')
										.use([middleware.permission({ permissions: [permissions.pages.view] })]);
									router
										.post('/:revisionId/restore', [controllers.cms.api.PageRevisionsApi, 'restore'])
										.as('cms.page_revisions.restore')
										.use([middleware.permission({ permissions: [permissions.pages.update] })]);
									router
										.put('/:revisionId/pin', [controllers.cms.api.PageRevisionsApi, 'toggle'])
										.as('cms.page_revisions.toggle')
										.use([middleware.permission({ permissions: [permissions.pages.update] })]);
								})
								.prefix('/:id/translations/:translationId/revisions');

							router
								.get('/preview/token', [controllers.cms.api.PagesPreviewToken, 'token'])
								.as('cms.pages_preview.token')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
						})
						.prefix('pages');

					// Templates
					router
						.group(() => {
							router
								.get('/', [controllers.cms.api.Templates, 'index'])
								.as('cms.templates.index')
								.use([middleware.permission({ permissions: [permissions.templates.view] })]);
							router
								.post('/', [controllers.cms.api.Templates, 'store'])
								.as('cms.templates.store')
								.use([middleware.permission({ permissions: [permissions.templates.create] })]);
							router
								.put('/:id', [controllers.cms.api.Templates, 'update'])
								.as('cms.templates.update')
								.use([middleware.permission({ permissions: [permissions.templates.update] })]);
							router
								.delete('/:id', [controllers.cms.api.Templates, 'destroy'])
								.as('cms.templates.destroy')
								.use([middleware.permission({ permissions: [permissions.templates.delete] })]);
							router
								.post('/from-page', [controllers.cms.api.Templates, 'createFromPage'])
								.as('cms.templates.create_from_page')
								.use([middleware.permission({ permissions: [permissions.templates.create] })]);
							router
								.get('/preview/token', [controllers.cms.api.TemplatesPreviewToken, 'token'])
								.as('cms.templates_preview.token')
								.use([middleware.permission({ permissions: [permissions.templates.view] })]);
						})
						.prefix('templates');

					// Builder
					router
						.group(() => {
							router
								.post('/operations', [controllers.cms.api.BuilderOperations, 'execute'])
								.as('cms.builder_operations.execute')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.get('/presence/:translationId', [controllers.cms.api.BuilderOperations, 'presence'])
								.as('cms.builder_operations.presence')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.post('/draft/:translationId', [controllers.cms.api.BuilderOperations, 'saveDraft'])
								.as('cms.builder_operations.save_draft')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
						})
						.prefix('builder');
				})
				.prefix('admin')
				.as('admin')
				.use([...maintenanceMiddleware, middleware.auth({ guards: [...apiGuards] }), apiClientThrottle()]);
		})
		.prefix('api/v1')
		.as('api.v1');
}
