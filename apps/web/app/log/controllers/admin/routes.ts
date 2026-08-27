/*
|--------------------------------------------------------------------------
| Log admin routes
|--------------------------------------------------------------------------
|
| Inertia admin surface (session guard) for the application log viewer.
| Self-registers on import (see `app/log/routes.ts`), gated by the
| `admin` feature flag. Public URL lives under `/admin/logs`; route names
| carry the `admin.log` prefix.
|
*/

import router from '@adonisjs/core/services/router';
import features from '#config/features';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { permissions } from '#start/permissions';

/**
 * Feature routes are wrapped with the maintenance middleware (when enabled)
 * before their auth guard, mirroring the `start/routes.ts` wrapper.
 */
const maintenanceMiddleware = features.maintenance ? [middleware.maintenance()] : [];

if (features.admin) {
	router
		.group(() => {
			// Logs
			router
				.group(() => {
					router
						.get('/', [controllers.log.admin.Logs, 'render'])
						.use([middleware.permission({ permissions: [permissions.logs.view] })]);
				})
				.prefix('logs');
		})
		.prefix('admin')
		.as('admin.log')
		.use([...maintenanceMiddleware, middleware.auth({ guards: ['web'] })]);
}
