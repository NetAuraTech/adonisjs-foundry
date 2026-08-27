/*
|--------------------------------------------------------------------------
| Cms admin routes
|--------------------------------------------------------------------------
|
| Pages CRUD, revisions, preview, and templates management for the Inertia
| admin surface (session guard). Self-registers on import (see
| `app/cms/routes.ts`), gated by the `cms` feature flag. Public URLs live
| under `/admin/pages` and `/admin/templates`; route names carry the
| `admin.cms` prefix.
|
*/

import router from '@adonisjs/core/services/router';
import features from '#config/features';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { permissions } from '#start/permissions';

/**
 * Feature routes are wrapped with the maintenance middleware (when enabled)
 * before their auth guard, mirroring the previous `start/routes.ts` wrapper.
 */
const maintenanceMiddleware = features.maintenance ? [middleware.maintenance()] : [];

if (features.cms) {
	router
		.group(() => {
			// Pages
			router
				.group(() => {
					router
						.get('/', [controllers.cms.admin.Pages, 'render'])
						.use([middleware.permission({ permissions: [permissions.pages.view] })]);

					router
						.group(() => {
							router.get('/', [controllers.cms.admin.PagesCreate, 'render']);
							router.post('/', [controllers.cms.admin.PagesCreate, 'execute']);
						})
						.prefix('create')
						.use([middleware.permission({ permissions: [permissions.pages.create] })]);

					router
						.group(() => {
							router
								.get('/', [controllers.cms.admin.PagesShow, 'render'])
								.use([middleware.permission({ permissions: [permissions.pages.view] })]);
							router
								.get('/edit', [controllers.cms.admin.PagesUpdate, 'render'])
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.post('/edit', [controllers.cms.admin.PagesUpdate, 'execute'])
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.post('/publish', [controllers.cms.admin.PagesUpdate, 'publish'])
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.post('/unpublish', [controllers.cms.admin.PagesUpdate, 'unpublish'])
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.post('/homepage', [controllers.cms.admin.Pages, 'setHomepage'])
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.delete('/', [controllers.cms.admin.Pages, 'destroy'])
								.use([middleware.permission({ permissions: [permissions.pages.delete] })]);
							router
								.post('/translations', [controllers.cms.admin.PageTranslations, 'execute'])
								.use([middleware.permission({ permissions: [permissions.pages.update] })]);
							router
								.group(() => {
									router
										.get('/', [controllers.cms.admin.PageRevisions, 'index'])
										.use([middleware.permission({ permissions: [permissions.pages.view] })]);
									router
										.post('/:revisionId/restore', [controllers.cms.admin.PageRevisions, 'restore'])
										.use([middleware.permission({ permissions: [permissions.pages.update] })]);
									router
										.post('/:revisionId/keep', [controllers.cms.admin.PageRevisions, 'toggleKeep'])
										.use([middleware.permission({ permissions: [permissions.pages.update] })]);
								})
								.prefix('translations/:translationId/revisions');
						})
						.prefix(':id');

					router
						.get('/preview/:pageId', [controllers.cms.admin.PagesPreview, 'render'])
						.use([middleware.permission({ permissions: [permissions.pages.view] })]);
				})
				.prefix('pages');

			// Templates
			router
				.group(() => {
					router
						.get('/', [controllers.cms.admin.Templates, 'render'])
						.use([middleware.permission({ permissions: [permissions.templates.view] })]);
					router
						.post('/', [controllers.cms.admin.Templates, 'execute'])
						.use([middleware.permission({ permissions: [permissions.templates.create] })]);
					router
						.post('/:id/apply', [controllers.cms.admin.Templates, 'applyToPage'])
						.use([middleware.permission({ permissions: [permissions.templates.update] })]);
					router
						.post('/:id', [controllers.cms.admin.Templates, 'update'])
						.use([middleware.permission({ permissions: [permissions.templates.update] })]);
					router
						.delete('/:id', [controllers.cms.admin.Templates, 'destroy'])
						.use([middleware.permission({ permissions: [permissions.templates.delete] })]);
					router
						.get('/preview/:id', [controllers.cms.admin.TemplatesPreview, 'render'])
						.use([middleware.permission({ permissions: [permissions.templates.view] })]);
					router
						.get('/:id/edit', [controllers.cms.admin.Templates, 'edit'])
						.use([middleware.permission({ permissions: [permissions.templates.view] })]);
				})
				.prefix('templates');
		})
		.prefix('admin')
		.as('admin.cms')
		.use([...maintenanceMiddleware, middleware.auth({ guards: ['web'] })]);
}
