/*
|--------------------------------------------------------------------------
| Cms front routes
|--------------------------------------------------------------------------
|
| Public surface of the CMS domain: contact form execution, the site root
| (the CMS homepage), and page rendering (locale and non-locale). The
| `sitemap.xml` and `robots.txt` endpoints live in
| `app/core/controllers/front/routes.ts` because they survive a CMS prune.
| Self-registers on import (see `app/cms/routes.ts`), gated by the `cms`
| feature flag. Public URLs are unchanged from the previous `start/routes`
| placement.
|
| The page-render catch-alls (`/:locale/:slug` and `/:slug`) are exported via
| `registerCmsPageRoutes()` instead of self-registering on import: the router
| matches routes in registration order, and a catch-all registered before
| `/admin`, `/login`, `/register` or `/health` would shadow them. `start/routes.ts`
| therefore calls the function last, after every other domain has registered.
|
| The site root keeps the `core.home.render` name in every flavor: on this
| (full) flavor the CMS homepage controller serves it, while the flavors
| that prune the CMS register the hand-written home of
| `app/core/routes.ts` under the same name.
|
*/

import router from '@adonisjs/core/services/router';
import features from '#config/features';
import { controllers } from '#generated/controllers';
import { maintenanceMiddleware } from '#transport/core/maintenance';

if (features.cms) {
	router
		.group(() => {
			router.post('/contact', [controllers.cms.front.Contact, 'execute']).as('cms.contact.execute');

			router.get('/', [controllers.cms.front.Page, 'home']).as('core.home.render');
		})
		.use(maintenanceMiddleware);
}

/**
 * Registers the CMS page-render catch-alls. Must be called after every other
 * route has been registered (see `start/routes.ts`): the router matches in
 * registration order, so registering `/:slug` earlier would shadow the
 * single-segment routes `/admin`, `/login`, `/register` and `/health`.
 */
export function registerCmsPageRoutes(): void {
	if (!features.cms) {
		return;
	}

	router
		.group(() => {
			router
				.get('/:locale/:slug', [controllers.cms.front.Page, 'render'])
				.as('cms.page.localised.render')
				.where('locale', /^[a-z]{2}(-[A-Z]{2})?$/);

			router
				.get('/:slug', [controllers.cms.front.Page, 'render'])
				.as('cms.page.render')
				.where('slug', /^[a-z0-9-]+$/);
		})
		.use(maintenanceMiddleware);
}
