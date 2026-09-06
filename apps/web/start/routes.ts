/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Route module index — each domain registers its own routes.
| Feature flags in config/features.ts gate each module at runtime.
|
| The `api` flavor is headless: no Inertia routes, no public site. The
| whole backend is the versioned REST surface — the identity/token
| API (`/api/v1/auth`, ...) and the admin REST API (`/api/v1/admin`, ...)
| — plus the OAuth redirect/callback pair (social login issues an API
| token and redirects to `AUTH_API_CLIENT_URL`) and the health endpoints
| outside the maintenance wrapper.
*/

// Domain token API routes self-register on import (feature-gated inside the modules).
import '#transport/auth/controllers/api/routes';
import '#transport/account/controllers/api/routes';
import '#transport/core/controllers/api/routes';
import '#transport/file/controllers/api/routes';
import '#transport/identity/controllers/api/routes';
import '#transport/log/controllers/api/routes';
import router from '@adonisjs/core/services/router';
import features from '#config/features';
import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { registerCoreHealthRoutes } from '#transport/core/health.routes';

// Health routes are outside maintenance middleware (liveness/readiness probes)
registerCoreHealthRoutes();

// Wrap all feature routes with maintenance middleware
// Health routes are registered separately above (outside this wrapper)

router
	.group(() => {
		// OAuth redirect + callback — the browser round-trip completes here and
		// the callback issues an API token (spec #6 social API mode).
		router
			.group(() => {
				router.get('/:provider', [controllers.auth.api.SocialApi, 'redirect']).as('redirect');
				router.get('/:provider/callback', [controllers.auth.api.SocialApi, 'callback']).as('callback');
			})
			.prefix('oauth')
			.as('auth.social');

		// The admin REST surface (core dashboard + maintenance) self-registers
		// on import from `#transport/core/controllers/api/routes` and gates itself
		// on `adminApi` (and the `api` guard) inside its route module.
	})
	.use(features.maintenance ? middleware.maintenance() : []);
