/*
|--------------------------------------------------------------------------
| Log API routes
|--------------------------------------------------------------------------
|
| Versioned REST API (access-token guard) for the application log viewer.
| Self-registers on import (see `app/log/routes.ts`), gated by the
| `adminApi` feature flag. Public URL lives under `/api/v1/admin/logs`;
| route names carry the `api.v1.admin.log` prefix.
|
*/

import router from '@adonisjs/core/services/router';
import { enabledAuthGuards } from '#config/auth';
import features from '#config/features';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { permissions } from '#start/permissions';

/**
 * The admin JSON surface is shared: the in-repo admin UI (session guard) and
 * external API clients (access-token guard) consume the same endpoints.
 * Guards that are disabled in `config/auth.ts` must never reach
 * `authenticateUsing`, hence the conditional list.
 */
const apiGuards = enabledAuthGuards.api ? (['web', 'api'] as const) : (['web'] as const);

/**
 * The surface self-registers on import, outside the `start/routes.ts`
 * maintenance wrapper — it wraps itself (when enabled) to keep parity.
 */
const maintenanceMiddleware = features.maintenance ? [middleware.maintenance()] : [];

if (features.adminApi) {
	router
		.group(() => {
			router
				.group(() => {
					// Logs
					router
						.group(() => {
							router
								.get('/', [controllers.log.api.LogsApi, 'index'])
								.as('log.logs.index')
								.use([middleware.permission({ permissions: [permissions.logs.view] })]);
						})
						.prefix('logs');
				})
				.prefix('admin')
				.as('admin')
				.use([...maintenanceMiddleware, middleware.auth({ guards: [...apiGuards] })]);
		})
		.prefix('api/v1')
		.as('api.v1');
}
