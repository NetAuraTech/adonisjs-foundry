/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Route module index — each domain registers its own routes.
| Feature flags in config/features.ts gate each module at runtime.
|
*/

// Identity routes self-register on import (feature-gated inside the module).
import '#app/identity/routes';
import router from '@adonisjs/core/services/router';
import { enabledAuthGuards } from '#config/auth';
import features from '#config/features';
import { middleware } from '#start/kernel';
import { registerAdminRoutes } from '#start/routes/admin.routes';
import { registerAdminRestApiRoutes } from '#start/routes/admin_rest_api.routes';
import { registerApiRoutes } from '#start/routes/api.routes';
import { registerAuthRoutes } from '#start/routes/auth.routes';
import { registerCmsAdminRoutes } from '#start/routes/cms_admin.routes';
import { registerCmsPublicRoutes } from '#start/routes/cms_public.routes';
import { registerCmsRestApiRoutes } from '#start/routes/cms_rest_api.routes';
import { registerCorePublicRoutes } from '#start/routes/core_public.routes';
import { registerHealthRoutes } from '#start/routes/health.routes';
import { registerSettingsRoutes } from '#start/routes/settings.routes';

// Health routes are outside maintenance middleware (liveness/readiness probes)
registerHealthRoutes();

// Wrap all feature routes with maintenance middleware
// Health routes are registered separately above (outside this wrapper)

router
	.group(() => {
		// Core SEO endpoints (sitemap.xml, robots.txt) — flavor-independent.
		registerCorePublicRoutes();

		if (features.auth) registerAuthRoutes();
		if (features.settings) registerSettingsRoutes();
		if (features.admin) registerAdminRoutes();
		if (features.adminApi) registerAdminRestApiRoutes();
		if (features.adminApi && features.cms) registerCmsRestApiRoutes();
		if (features.cms) {
			registerCmsAdminRoutes();
			registerCmsPublicRoutes();
		}

		// Token-guarded REST API — only when the `api` guard is enabled.
		if (features.adminApi && enabledAuthGuards.api) {
			registerApiRoutes();
		}
	})
	.use(features.maintenance ? middleware.maintenance() : []);
