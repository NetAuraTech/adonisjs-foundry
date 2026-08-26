/*
|--------------------------------------------------------------------------
| Admin routes
|--------------------------------------------------------------------------
|
| Dashboard, settings (maintenance), logs.
|
| The identity surface (users, roles, permissions) lives in
| `app/identity/routes.ts`, and the file surface (files, file folders) in
| `app/file/routes.ts`, both registered by import from `start/routes.ts`.
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
