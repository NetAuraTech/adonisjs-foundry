/*
|--------------------------------------------------------------------------
| Core front routes
|--------------------------------------------------------------------------
|
| Public SEO surface of the core domain: `sitemap.xml` and `robots.txt`.
| They must exist in every flavor that has a public front, independently of
| the CMS module — registered unconditionally (alongside the CMS public
| routes) so the endpoints survive a CMS prune. Self-registers on import
| (see `app/core/routes.ts`).
|
| The core home route is deliberately not registered here: on `main` the CMS
| page home serves the site root, so the home is exported separately from
| `app/core/routes.ts` for the flavors that prune the CMS.
|
*/

import router from '@adonisjs/core/services/router';
import { controllers } from '#generated/controllers';
import { maintenanceMiddleware } from '#transport/core/maintenance';

router
	.group(() => {
		router.get('/sitemap.xml', [controllers.core.front.Sitemap, 'show']).as('core.sitemap.show');
		router.get('/robots.txt', [controllers.core.front.Robots, 'show']).as('core.robots.show');
	})
	.use(maintenanceMiddleware);
