/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Route module index — a pure per-domain import list in stable order. Each
| domain registers its own routes on import (see its `app/<domain>/routes.ts`),
| feature-gated inside the module and wrapped with the maintenance
| middleware (when enabled) before its auth guards.
|
| Explicit `register*` calls run last: the router matches in registration
| order, so the CMS page-render catch-alls must come after every other route.
|
*/

import '#transport/account/routes';
import '#transport/auth/routes';
import '#transport/cms/routes';
import '#transport/core/routes';
import '#transport/file/routes';
import '#transport/identity/routes';
import '#transport/log/routes';
import { registerCmsPageRoutes } from '#transport/cms/controllers/front/routes';
import { registerCoreHealthRoutes } from '#transport/core/health.routes';

// Health routes are outside maintenance middleware (liveness/readiness probes)
registerCoreHealthRoutes();

// The CMS page-render catch-alls (`/:locale/:slug`, `/:slug`) must register
// last so they never shadow `/admin`, `/login`, `/register`, `/health` or any
// other single-segment route.
registerCmsPageRoutes();
