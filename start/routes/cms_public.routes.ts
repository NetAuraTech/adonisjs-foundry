/*
|--------------------------------------------------------------------------
| CMS public routes
|--------------------------------------------------------------------------
|
| Contact, home, and page rendering (locale/non-locale). The `sitemap.xml`
| and `robots.txt` endpoints live in `core_public.routes.ts` because they
| survive a CMS prune. Registered from `start/routes.ts` behind the `cms`
| feature flag.
|
*/

import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

export function registerCmsPublicRoutes(): void {
  router.post('/contact', [controllers.page.front.Contact, 'execute'])

  router.get('/', [controllers.page.front.Page, 'home']).as('page.home')

  router
    .get('/:locale/:slug', [controllers.page.front.Page, 'render'])
    .as('page.localised.render')
    .where('locale', /^[a-z]{2}(-[A-Z]{2})?$/)

  router
    .get('/:slug', [controllers.page.front.Page, 'render'])
    .as('page.render')
    .where('slug', /^[a-z0-9-]+$/)
}
