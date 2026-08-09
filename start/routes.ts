/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Route module index — each domain registers its own routes.
| Feature flags in config/features.ts gate each module at runtime.
|
*/

import features from '#config/features'
import router from '@adonisjs/core/services/router'
import { enabledAuthGuards } from '#config/auth'
import { registerAuthRoutes } from '#start/routes/auth.routes'
import { registerSettingsRoutes } from '#start/routes/settings.routes'
import { registerAdminRoutes } from '#start/routes/admin.routes'
import { registerAdminApiRoutes } from '#start/routes/admin_api.routes'
import { registerCmsAdminRoutes } from '#start/routes/cms_admin.routes'
import { registerCmsApiRoutes } from '#start/routes/cms_api.routes'
import { registerCmsPublicRoutes } from '#start/routes/cms_public.routes'
import { registerCorePublicRoutes } from '#start/routes/core_public.routes'
import { registerApiRoutes } from '#start/routes/api.routes'
import { registerAdminRestApiRoutes } from '#start/routes/admin_rest_api.routes'
import { registerHealthRoutes } from '#start/routes/health.routes'
import { middleware } from '#start/kernel'

// Health routes are outside maintenance middleware (liveness/readiness probes)
registerHealthRoutes()

// Wrap all feature routes with maintenance middleware
// Health routes are registered separately above (outside this wrapper)

router
  .group(() => {
    // Core SEO endpoints (sitemap.xml, robots.txt) — flavor-independent.
    registerCorePublicRoutes()

    if (features.auth) registerAuthRoutes()
    if (features.settings) registerSettingsRoutes()
    if (features.admin) registerAdminRoutes()
    if (features.adminApi) registerAdminApiRoutes()
    if (features.cms) {
      registerCmsAdminRoutes()
      registerCmsApiRoutes()
      registerCmsPublicRoutes()
    }

    // Token-guarded REST API — only when the `api` guard is enabled.
    if (enabledAuthGuards.api) {
      registerApiRoutes()
      registerAdminRestApiRoutes()
    }
  })
  .use(features.maintenance ? middleware.maintenance() : [])
