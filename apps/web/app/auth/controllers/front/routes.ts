/*
|--------------------------------------------------------------------------
| Auth front routes
|--------------------------------------------------------------------------
|
| Guest authentication (login, register, forgot/reset password,
| accept-invitation), logout, OAuth, email verification. Self-registers on
| import (see `app/auth/routes.ts`), gated by the `auth` feature flag.
| Public URLs live under `/login`, `/register`, `/forgot-password`,
| `/reset-password`, `/accept-invitation`, `/logout`, `/verify` and `/oauth`;
| route names carry the `auth` prefix.
|
*/

import router from '@adonisjs/core/services/router';
import features from '#config/features';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { throttle } from '#start/limiter';

/**
 * Feature routes are wrapped with the maintenance middleware (when enabled)
 * before their auth guard, mirroring the `start/routes.ts` wrapper.
 */
const maintenanceMiddleware = features.maintenance ? [middleware.maintenance()] : [];

if (features.auth) {
	router
		.group(() => {
			router
				.group(() => {
					router
						.group(() => {
							router.get('/', [controllers.auth.front.Session, 'render']);
							router.post('/', [controllers.auth.front.Session, 'execute']).use([throttle(5, 900)]);
						})
						.prefix('login');

					router
						.group(() => {
							router.get('/', [controllers.auth.front.Register, 'render']);
							router.post('/', [controllers.auth.front.Register, 'execute']).use([throttle(3, 3600)]);
						})
						.prefix('register');

					router
						.group(() => {
							router.get('/', [controllers.auth.front.ForgotPassword, 'render']);
							router.post('/', [controllers.auth.front.ForgotPassword, 'execute']).use([throttle(3, 3600)]);
						})
						.prefix('forgot-password');

					router
						.group(() => {
							router.get('/:token', [controllers.auth.front.ResetPassword, 'render']);
							router.post('/', [controllers.auth.front.ResetPassword, 'execute']).use([throttle(3, 900)]);
						})
						.prefix('reset-password');

					router
						.group(() => {
							router.get('/:token', [controllers.auth.front.AcceptInvitation, 'render']);
							router.post('/', [controllers.auth.front.AcceptInvitation, 'execute']).use([throttle(3, 900)]);
						})
						.prefix('accept-invitation');
				})
				.use([middleware.guest()]);

			router.group(() => {
				router
					.group(() => {
						router.post('/', [controllers.auth.front.Session, 'destroy']);
					})
					.prefix('logout');
			});

			router.get('/verify/:token', [controllers.auth.front.EmailVerification, 'execute']).use([middleware.guest()]);

			router
				.group(() => {
					router
						.group(() => {
							router.get('/', [controllers.auth.front.Social, 'render']);
							router.post('/', [controllers.auth.front.Social, 'execute']);
						})
						.prefix('define-password');

					router.get('/:provider', [controllers.auth.front.Social, 'redirect']);
					router.get('/:provider/callback', [controllers.auth.front.Social, 'callback']);

					router.post('/:provider/unlink', [controllers.auth.front.Social, 'unlink']);
				})
				.prefix('oauth');
		})
		.as('auth')
		.use(maintenanceMiddleware);
}
