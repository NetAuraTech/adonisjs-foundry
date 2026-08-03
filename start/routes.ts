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
import { registerAuthRoutes } from '#start/routes/auth.routes'
import { registerSettingsRoutes } from '#start/routes/settings.routes'
import { registerAdminRoutes } from '#start/routes/admin.routes'
import { registerAdminApiRoutes } from '#start/routes/admin_api.routes'
import { registerPublicRoutes } from '#start/routes/public.routes'
import { registerHealthRoutes } from '#start/routes/health.routes'
import { middleware } from '#start/kernel'

// Health routes are outside maintenance middleware (liveness/readiness probes)
registerHealthRoutes()

// Wrap all feature routes with maintenance middleware
// Health routes are registered separately above (outside this wrapper)

router
  .group(() => {
    if (features.auth) registerAuthRoutes()
    if (features.settings) registerSettingsRoutes()
    if (features.admin) registerAdminRoutes()
    if (features.adminApi) registerAdminApiRoutes()
    if (features.public) registerPublicRoutes()
  })
  .use(features.maintenance ? middleware.maintenance() : [])
