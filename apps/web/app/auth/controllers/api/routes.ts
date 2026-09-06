/*
|--------------------------------------------------------------------------
| Auth API routes
|--------------------------------------------------------------------------
|
| Versioned token API (`/api/v1/auth/*`) for non-browser clients. Self-
| registers on import (see `app/auth/routes.ts`), gated by the `adminApi`
| feature flag and the `api` access-token guard (session cookies are never
| consulted). Route names carry the `api.v1.auth` prefix.
|
*/

import router from '@adonisjs/core/services/router';
import { enabledAuthGuards } from '#config/auth';
import features from '#config/features';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { apiClientThrottle, throttle } from '#start/limiter';
import { maintenanceMiddleware } from '#transport/core/maintenance';

if (features.adminApi && enabledAuthGuards.api) {
	router
		.group(() => {
			router
				.group(() => {
					// Same credential-stuffing budget as the session login.
					router.post('login', [controllers.auth.api.Login, 'execute']).use([throttle(5, 900)]);

					router.post('register', [controllers.auth.api.Register, 'store']).use([throttle(3, 3600)]);
					router.post('forgot-password', [controllers.auth.api.ForgotPassword, 'store']).use([throttle(3, 3600)]);
					router.post('reset-password', [controllers.auth.api.ResetPassword, 'store']);
					router.post('verify-email/:token', [controllers.auth.api.EmailVerification, 'store']);
					router.post('accept-invitation', [controllers.auth.api.AcceptInvitation, 'store']);

					router
						.group(() => {
							router.post('logout', [controllers.auth.api.Logout, 'destroy']);
							router.get('me', [controllers.auth.api.Me, 'show']);
						})
						.use([middleware.auth({ guards: ['api'] }), apiClientThrottle()]);
				})
				.prefix('auth')
				.as('auth')
				.use(maintenanceMiddleware);
		})
		.prefix('api/v1')
		.as('api.v1');
}
