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
import { enabledAuthGuards } from '#config/auth';
import features from '#config/features';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { permissions } from '#start/permissions';
import { maintenanceMiddleware } from '#transport/core/maintenance';

/**
 * Same shared guard list as the admin REST surface: the in-repo admin UI
 * (session guard) and external API clients (access-token guard) consume the
 * same endpoints. Guards that are disabled in `config/auth.ts` never reach
 * `authenticateUsing`.
 */
const apiGuards = enabledAuthGuards.api ? (['web', 'api'] as const) : (['web'] as const);

if (features.adminApi && features.cms) {
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
				.use([...maintenanceMiddleware, middleware.auth({ guards: [...apiGuards] })]);
		})
		.prefix('api/v1')
		.as('api.v1');
}
