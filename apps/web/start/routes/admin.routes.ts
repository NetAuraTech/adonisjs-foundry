/*
|--------------------------------------------------------------------------
| Admin routes
|--------------------------------------------------------------------------
|
| Dashboard, files, file folders, settings (maintenance), logs.
|
| The identity surface (users, roles, permissions) lives in
| `app/identity/routes.ts`, registered by import from `start/routes.ts`.
|
*/

import router from '@adonisjs/core/services/router';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { permissions } from '#start/permissions';

export function registerAdminRoutes(): void {
	router
		.group(() => {
			router
				.get('/', [controllers.core.admin.Dashboard, 'render'])
				.use([middleware.permission({ permissions: [permissions.admin.access] })]);

			router.group(() => {
				// Files
				router
					.group(() => {
						router
							.get('/', [controllers.file.admin.Files, 'render'])
							.use([middleware.permission({ permissions: [permissions.files.view] })]);
						router
							.post('/upload', [controllers.file.admin.Files, 'upload'])
							.use([middleware.permission({ permissions: [permissions.files.create] })]);
						router
							.post('/:id/move', [controllers.file.admin.Files, 'move'])
							.use([middleware.permission({ permissions: [permissions.files.update] })]);
						router
							.delete('/:id', [controllers.file.admin.Files, 'destroy'])
							.use([middleware.permission({ permissions: [permissions.files.delete] })]);
						router
							.post('/:id/alts', [controllers.file.admin.Files, 'upsertAlt'])
							.use([middleware.permission({ permissions: [permissions.files.update] })]);
						router
							.delete('/:id/alts', [controllers.file.admin.Files, 'deleteAlt'])
							.use([middleware.permission({ permissions: [permissions.files.update] })]);
					})
					.prefix('files');

				// File folders
				router
					.group(() => {
						router
							.get('/', [controllers.file.admin.FileFolders, 'render'])
							.use([middleware.permission({ permissions: [permissions.folders.view] })]);
						router
							.post('/', [controllers.file.admin.FileFolders, 'execute'])
							.use([middleware.permission({ permissions: [permissions.folders.create] })]);
						router
							.put('/:id', [controllers.file.admin.FileFolders, 'update'])
							.use([middleware.permission({ permissions: [permissions.folders.update] })]);
						router
							.delete('/:id', [controllers.file.admin.FileFolders, 'destroy'])
							.use([middleware.permission({ permissions: [permissions.folders.delete] })]);
					})
					.prefix('files/folders');

				// Settings - Maintenance
				router
					.group(() => {
						router
							.group(() => {
								router
									.get('/maintenance', [controllers.maintenance.admin.Maintenance, 'render'])
									.as('maintenance.render');
								router
									.post('/maintenance', [controllers.maintenance.admin.Maintenance, 'update'])
									.as('maintenance.update');
								router
									.post('/maintenance/toggle', [controllers.maintenance.admin.Maintenance, 'toggle'])
									.as('maintenance.toggle');
							})
							.prefix('settings')
							.as('settings')
							.use([middleware.permission({ permissions: [permissions.settings.maintenance] })]);
					})
					.use([middleware.auth({ guards: ['web'] })]);

				// Logs
				router
					.group(() => {
						router
							.get('/', [controllers.log.admin.Logs, 'render'])
							.as('logs.render')
							.use([middleware.permission({ permissions: [permissions.logs.view] })]);
					})
					.prefix('logs')
					.use([middleware.auth({ guards: ['web'] })]);
			});
		})
		.prefix('admin')
		.as('admin')
		.use([middleware.auth({ guards: ['web'] })]);
}
