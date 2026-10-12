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
| route names carry the `api.v1.admin.cms` prefix. Each route registers
| its OpenAPI docs at its declaration (`registerApiDoc`), keyed by the
| route itself: the route name is derived from the route, never
| hand-assembled. Pages and templates docs live on their REST resources
| (`pagesEndpointsDocs`, `templatesEndpointsDocs`); the builder and
| preview-token surfaces have no resource and carry their docs here.
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
import { pagesEndpointsDocs } from '#transport/cms/rest/pages_resource';
import { templatesEndpointsDocs } from '#transport/cms/rest/templates_resource';
import { builderOperationValidator, builderPresenceValidator } from '#transport/cms/validators/builder';
import { maintenanceMiddleware } from '#transport/core/maintenance';
import { registerApiDoc, type ApiOperationDoc } from '#transport/core/openapi/api_docs_registry';
import { errorSchema, validationErrorSchema } from '#transport/core/openapi/schemas';

/**
 * Same shared guard list as the admin REST surface: the in-repo admin UI
 * (session guard) and external API clients (access-token guard) consume the
 * same endpoints. Guards that are disabled in `config/auth.ts` never reach
 * `authenticateUsing`.
 */
const apiGuards = enabledAuthGuards.api ? (['web', 'api'] as const) : (['web'] as const);

const pagePreviewTokenValidator = vine.create({
	pageId: vine.number().positive(),
	locale: vine.string().trim().maxLength(10).optional(),
});

const templatePreviewTokenValidator = vine.create({
	id: vine.number().positive(),
	locale: vine.string().trim().maxLength(10).optional(),
});

const saveDraftPathValidator = vine.create({
	translationId: vine.number().positive(),
});

const saveDraftBodyValidator = vine.create({
	content: vine.any(),
});

const pagesPreviewTokenDoc: ApiOperationDoc = {
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
};

const templatesPreviewTokenDoc: ApiOperationDoc = {
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
};

const builderExecuteDoc: ApiOperationDoc = {
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
};

const builderPresenceDoc: ApiOperationDoc = {
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
};

const builderSaveDraftDoc: ApiOperationDoc = {
	summary: 'Save a builder draft',
	tags: ['Builder'],
	request: [
		{ validator: saveDraftPathValidator, in: 'path' },
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
};

if (features.adminApi && features.cms) {
	router
		.group(() => {
			router
				.group(() => {
					// Pages
					router
						.group(() => {
							registerApiDoc(router.get('/', [controllers.cms.api.PagesApi, 'index']), pagesEndpointsDocs.index)
								.as('cms.pages.index')
								.use([middleware.permission({ permissions: [permissions.pages.view] })]);
							registerApiDoc(router.post('/', [controllers.cms.api.PagesCreateApi, 'store']), pagesEndpointsDocs.store)
								.as('cms.pages.store')
								.use([middleware.permission({ permissions: [permissions.pages.create] })]);
							registerApiDoc(router.get('/search', [controllers.cms.api.PagesApi, 'search']), pagesEndpointsDocs.search)
								.as('cms.pages.search')
								.use([middleware.permission({ permissions: [permissions.pages.view] })]);
							registerApiDoc(router.get('/:id', [controllers.cms.api.PagesShowApi, 'show']), pagesEndpointsDocs.show)
								.as('cms.pages.show')
								.use([middleware.permission({ permissions: [permissions.pages.view] })]);
							registerApiDoc(
								router.put('/:id', [controllers.cms.api.PagesUpdateApi, 'update']),
								pagesEndpointsDocs.update,
							)
								.as('cms.pages.update')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							registerApiDoc(
								router.delete('/:id', [controllers.cms.api.PagesDeleteApi, 'destroy']),
								pagesEndpointsDocs.destroy,
							)
								.as('cms.pages.destroy')
								.use([middleware.permission({ permissions: [permissions.pages.delete] })]);
							registerApiDoc(
								router.put('/:id/publish', [controllers.cms.api.PagesUpdateApi, 'publish']),
								pagesEndpointsDocs.publish,
							)
								.as('cms.pages.publish')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							registerApiDoc(
								router.put('/:id/unpublish', [controllers.cms.api.PagesUpdateApi, 'unpublish']),
								pagesEndpointsDocs.unpublish,
							)
								.as('cms.pages.unpublish')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							registerApiDoc(
								router.put('/:id/homepage', [controllers.cms.api.PagesApi, 'setHomepage']),
								pagesEndpointsDocs.setHomepage,
							)
								.as('cms.pages.set_homepage')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							registerApiDoc(
								router.post('/:id/translations', [controllers.cms.api.PageTranslationsApi, 'store']),
								pagesEndpointsDocs.storeTranslation,
							)
								.as('cms.page_translations.store')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.group(() => {
									registerApiDoc(
										router.get('/', [controllers.cms.api.PageRevisionsApi, 'index']),
										pagesEndpointsDocs.listRevisions,
									)
										.as('cms.page_revisions.index')
										.use([middleware.permission({ permissions: [permissions.pages.view] })]);
									registerApiDoc(
										router.post('/:revisionId/restore', [controllers.cms.api.PageRevisionsApi, 'restore']),
										pagesEndpointsDocs.restoreRevision,
									)
										.as('cms.page_revisions.restore')
										.use([middleware.permission({ permissions: [permissions.pages.update] })]);
									registerApiDoc(
										router.put('/:revisionId/pin', [controllers.cms.api.PageRevisionsApi, 'toggle']),
										pagesEndpointsDocs.toggleRevision,
									)
										.as('cms.page_revisions.toggle')
										.use([middleware.permission({ permissions: [permissions.pages.update] })]);
								})
								.prefix('/:id/translations/:translationId/revisions');

							registerApiDoc(
								router.get('/preview/token', [controllers.cms.api.PagesPreviewToken, 'token']),
								pagesPreviewTokenDoc,
							)
								.as('cms.pages_preview.token')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
						})
						.prefix('pages');

					// Templates
					router
						.group(() => {
							registerApiDoc(router.get('/', [controllers.cms.api.Templates, 'index']), templatesEndpointsDocs.index)
								.as('cms.templates.index')
								.use([middleware.permission({ permissions: [permissions.templates.view] })]);
							registerApiDoc(router.post('/', [controllers.cms.api.Templates, 'store']), templatesEndpointsDocs.store)
								.as('cms.templates.store')
								.use([middleware.permission({ permissions: [permissions.templates.create] })]);
							registerApiDoc(
								router.put('/:id', [controllers.cms.api.Templates, 'update']),
								templatesEndpointsDocs.update,
							)
								.as('cms.templates.update')
								.use([middleware.permission({ permissions: [permissions.templates.update] })]);
							registerApiDoc(
								router.delete('/:id', [controllers.cms.api.Templates, 'destroy']),
								templatesEndpointsDocs.destroy,
							)
								.as('cms.templates.destroy')
								.use([middleware.permission({ permissions: [permissions.templates.delete] })]);
							registerApiDoc(
								router.post('/from-page', [controllers.cms.api.Templates, 'createFromPage']),
								templatesEndpointsDocs.createFromPage,
							)
								.as('cms.templates.create_from_page')
								.use([middleware.permission({ permissions: [permissions.templates.create] })]);
							registerApiDoc(
								router.get('/preview/token', [controllers.cms.api.TemplatesPreviewToken, 'token']),
								templatesPreviewTokenDoc,
							)
								.as('cms.templates_preview.token')
								.use([middleware.permission({ permissions: [permissions.templates.view] })]);
						})
						.prefix('templates');

					// Builder
					router
						.group(() => {
							registerApiDoc(
								router.post('/operations', [controllers.cms.api.BuilderOperations, 'execute']),
								builderExecuteDoc,
							)
								.as('cms.builder_operations.execute')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							registerApiDoc(
								router.get('/presence/:translationId', [controllers.cms.api.BuilderOperations, 'presence']),
								builderPresenceDoc,
							)
								.as('cms.builder_operations.presence')
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							registerApiDoc(
								router.post('/draft/:translationId', [controllers.cms.api.BuilderOperations, 'saveDraft']),
								builderSaveDraftDoc,
							)
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
