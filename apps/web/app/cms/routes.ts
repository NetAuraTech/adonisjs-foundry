/*
|--------------------------------------------------------------------------
| Cms routes
|--------------------------------------------------------------------------
|
| Cms domain surface entry — mirrors `start/routes.ts`: each surface
| self-registers on import, co-located with the controllers it binds, and
| gates itself on its feature flag. The admin Inertia surface (session
| guard), the versioned REST API (access-token guard) and the public front
| (contact, home, page rendering) live under `controllers/`. Public URLs
| are unchanged from the previous `start/routes` placement.
|
*/

import '#app/cms/controllers/admin/routes';
import '#app/cms/controllers/api/routes';
import '#app/cms/controllers/front/routes';
