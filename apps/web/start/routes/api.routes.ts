/*
|--------------------------------------------------------------------------
| REST API routes (token-guarded)
|--------------------------------------------------------------------------
|
| Versioned REST API for non-browser clients (mobile apps, scripts). These
| routes authenticate exclusively through the `api` access-token guard —
| session cookies are never consulted. Registered only when the guard is
| enabled (see `enabledAuthGuards` in `config/auth.ts`).
|
*/

import router from '@adonisjs/core/services/router';
import { enabledAuthGuards } from '#config/auth';
import features from '#config/features';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';

/**
 * Whether the identity/token REST surface is exposed at all. The whole
 * `/api/v1` surface is gated by the `adminApi` feature flag and additionally
 * requires the `api` access-token guard (session cookies are never consulted).
 */
export function identityApiEnabled(featuresList: { adminApi: boolean }): boolean {
	return featuresList.adminApi && enabledAuthGuards.api;
}

/**
 * Profile and account API routes.
 *
 * Auth API routes (login, register, password reset, …) are self-registered
 * from the auth domain (`app/auth/controllers/api/routes.ts`) on import of
 * `#app/auth/routes`.
 */
export function registerApiRoutes(): void {
	if (!identityApiEnabled(features)) return;

	router
		.group(() => {
			router
				.group(() => {
					router.get('/', [controllers.profile.api.ProfileApi, 'show']);
					router.put('/', [controllers.profile.api.ProfileApi, 'update']);
				})
				.prefix('profile')
				.as('profile')
				.use([middleware.auth({ guards: ['api'] })]);

			router
				.group(() => {
					router.put('/', [controllers.account.api.AccountApi, 'update']);
					router.delete('/', [controllers.account.api.AccountApi, 'destroy']);
				})
				.prefix('account')
				.as('account')
				.use([middleware.auth({ guards: ['api'] })]);
		})
		.prefix('api/v1')
		.as('api.v1');
}
