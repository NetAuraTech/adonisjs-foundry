/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Route module index — each domain registers its own routes.
| Feature flags in config/features.ts gate each module at runtime.
|
*/

// Auth, identity, account, file, log and core routes self-register on import (feature-gated inside the modules).
import '#app/account/routes';
import '#app/auth/routes';
import '#app/core/routes';
import '#app/file/routes';
import '#app/identity/routes';
import '#app/log/routes';
import router from '@adonisjs/core/services/router';
import { registerCoreHealthRoutes } from '#app/core/health.routes';
import features from '#config/features';
import { middleware } from '#start/kernel';
import { registerCmsAdminRoutes } from '#start/routes/cms_admin.routes';
import { registerCmsPublicRoutes } from '#start/routes/cms_public.routes';
import { registerCmsRestApiRoutes } from '#start/routes/cms_rest_api.routes';

// Health routes are outside maintenance middleware (liveness/readiness probes)
registerCoreHealthRoutes();

// Wrap all feature routes with maintenance middleware
// Health routes are registered separately above (outside this wrapper)

router
	.group(() => {
		if (features.adminApi && features.cms) registerCmsRestApiRoutes();
		if (features.cms) {
			registerCmsAdminRoutes();
			registerCmsPublicRoutes();
		}
	})
	.use(features.maintenance ? middleware.maintenance() : []);
