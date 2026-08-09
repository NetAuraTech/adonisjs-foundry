import type { HttpContext } from '@adonisjs/core/http'

/**
 * Serves the hand-written home page of the public front.
 *
 * The `inertia` flavor ships a minimal hand-written front instead of the CMS
 * page renderer: this controller is the canonical entry point a developer
 * opens to start building their own pages. It renders a blank Inertia page so
 * the front boots end-to-end (layout, shared props, fonts) with nothing else
 * to remove.
 */
export default class HomeController {
  /**
   * `GET /` — renders the blank home page as `front.home`.
   *
   * @returns The Inertia-rendered `core/front/home` page.
   */
  async render({ inertia }: HttpContext) {
    return inertia.render('core/front/home', {})
  }
}
