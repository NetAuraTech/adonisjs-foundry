/*
|--------------------------------------------------------------------------
| Core API routes
|--------------------------------------------------------------------------
|
| Versioned REST API (access-token guard) for the dashboard figures and the
| maintenance configuration. Self-registers on import (see
| `app/core/routes.ts`), gated by the `adminApi` feature flag. Public URLs
| live under `/api/v1/admin/{dashboard,maintenance}`; route names carry the
| `api.v1.admin.core` prefix.
|
| Also hosts the OpenAPI surface, gated by the `apiDocs` feature flag:
| `GET /api/v1/openapi.json` (generated spec) and `GET /api/v1/docs`
| (interactive reference), both public and named `api.v1.core.openapi.*`.
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
 * The admin JSON surface is shared: the in-repo admin UI (session guard) and
 * external API clients (access-token guard) consume the same endpoints.
 * Guards that are disabled in `config/auth.ts` must never reach
 * `authenticateUsing`, hence the conditional list.
 */
const apiGuards = enabledAuthGuards.api ? (['web', 'api'] as const) : (['web'] as const);

if (features.adminApi) {
	router
		.group(() => {
			router
				.group(() => {
					// Dashboard
					router
						.get('/', [controllers.core.api.DashboardApi, 'index'])
						.prefix('dashboard')
						.as('core.dashboard.index')
						.use([middleware.permission({ permissions: [permissions.admin.access] })]);

					// Maintenance
					router
						.group(() => {
							router
								.get('/', [controllers.core.api.MaintenanceApi, 'index'])
								.as('core.maintenance.index')
								.use([middleware.permission({ permissions: [permissions.settings.maintenance] })]);
							router
								.put('/', [controllers.core.api.MaintenanceApi, 'update'])
								.as('core.maintenance.update')
								.use([middleware.permission({ permissions: [permissions.settings.maintenance] })]);
							router
								.put('/toggle', [controllers.core.api.MaintenanceApi, 'toggle'])
								.as('core.maintenance.toggle')
								.use([middleware.permission({ permissions: [permissions.settings.maintenance] })]);
						})
						.prefix('maintenance');
				})
				.prefix('admin')
				.as('admin')
				.use([...maintenanceMiddleware, middleware.auth({ guards: [...apiGuards] })]);
		})
		.prefix('api/v1')
		.as('api.v1');
}

// The OpenAPI surface is public (no auth guard): the spec documents the
// admin API but exposes no data, and the docs page must stay reachable for
// humans exploring the contract.
if (features.apiDocs) {
	router
		.group(() => {
			router.get('openapi.json', [controllers.core.api.Openapi, 'spec']).as('core.openapi.spec');
			router.get('docs', [controllers.core.api.Openapi, 'docs']).as('core.openapi.docs');
		})
		.prefix('api/v1')
		.as('api.v1');
}
