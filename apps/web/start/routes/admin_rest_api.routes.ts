/*
|--------------------------------------------------------------------------
| Admin REST API v1 routes
|--------------------------------------------------------------------------
|
| Versioned admin REST surface under `/api/v1/admin/*`. Each resource is a
| thin controller reusing the existing domain actions, validators, and
| transformers — no business logic is duplicated with the Inertia admin.
|
| The identity resources (`/api/v1/admin/users`, `/roles`, `/permissions`)
| are registered by `app/identity/routes.ts`, the account theme resource
| (`/api/v1/admin/preferences/theme`) by `app/account/routes.ts`, the file
| resources (`/api/v1/admin/files`, `/folders`) by `app/file/routes.ts`,
| and the CMS resources (`/api/v1/admin/pages`, `/templates`, `/builder`)
| are registered separately from `start/routes/cms_rest_api.routes.ts`
| behind the `cms` feature flag, so flavors that prune those domains can
| delete the module (and never reference those controllers here).
|
| Registered only when the `adminApi` feature flag is on and the `api`
| access-token guard is enabled (see `config/auth.ts`).
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
 * Whether the admin JSON surface is exposed at all, driven by the `adminApi`
 * feature flag (the session-based admin UI and external API clients both
 * consume these endpoints, so the `api` guard is not required).
 */
export function adminRestApiEnabled(featuresList: { adminApi: boolean }): boolean {
	return featuresList.adminApi;
}

export function registerAdminRestApiRoutes(): void {
	if (!adminRestApiEnabled(features)) return;

	router
		.group(() => {
			router
				.group(() => {
					router
						.get('/', [controllers.core.api.DashboardApi, 'index'])
						.prefix('dashboard')
						.use([middleware.permission({ permissions: [permissions.admin.access] })]);

					router
						.group(() => {
							router
								.get('/', [controllers.log.api.LogsApi, 'index'])
								.use([middleware.permission({ permissions: [permissions.logs.view] })]);
						})
						.prefix('logs');

					router
						.group(() => {
							router
								.get('/', [controllers.maintenance.api.MaintenanceApi, 'index'])
								.use([middleware.permission({ permissions: [permissions.settings.maintenance] })]);
							router
								.put('/', [controllers.maintenance.api.MaintenanceApi, 'update'])
								.use([middleware.permission({ permissions: [permissions.settings.maintenance] })]);
							router
								.put('/toggle', [controllers.maintenance.api.MaintenanceApi, 'toggle'])
								.use([middleware.permission({ permissions: [permissions.settings.maintenance] })]);
						})
						.prefix('maintenance');
				})
				.prefix('admin')
				.as('admin')
				.use([middleware.auth({ guards: [...apiGuards] })]);
		})
		.prefix('api/v1')
		.as('api.v1');
}
