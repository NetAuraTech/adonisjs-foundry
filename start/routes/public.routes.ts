/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
|
| Contact, sitemap, robots, home, page rendering (locale/non-locale).
|
*/

import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

export function registerPublicRoutes(): void {
  router.post('/contact', [controllers.page.front.Contact, 'execute'])

  router.get('/sitemap.xml', [controllers.page.front.Page, 'sitemap'])
  router.get('/robots.txt', [controllers.page.front.Page, 'robots'])

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
