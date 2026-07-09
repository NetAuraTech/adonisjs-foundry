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
import { registerAuthRoutes } from '#start/routes/auth.routes'
import { registerSettingsRoutes } from '#start/routes/settings.routes'
import { registerAdminRoutes } from '#start/routes/admin.routes'
import { registerAdminApiRoutes } from '#start/routes/admin_api.routes'
import { registerPublicRoutes } from '#start/routes/public.routes'

if (features.auth) registerAuthRoutes()
if (features.settings) registerSettingsRoutes()
if (features.admin) registerAdminRoutes()
if (features.adminApi) registerAdminApiRoutes()
if (features.public) registerPublicRoutes()
