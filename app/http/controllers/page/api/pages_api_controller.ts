import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import PagesResource from '#rest/pages'

/**
 * GET  /api/v1/admin/pages — list pages
 * PUT  /api/v1/admin/pages/:id/homepage — set homepage
 *
 * Thin transport adapters over the `index` and `setHomepage` endpoints of
 * the {@link PagesResource}; the endpoint declarations are executed by the
 * shared REST pipeline.
 */
@inject()
export default class PagesApiController {
  constructor(protected pagesResource: PagesResource) {}

  async index(ctx: HttpContext): Promise<void> {
    await this.pagesResource.handle('index', ctx)
  }

  async setHomepage(ctx: HttpContext): Promise<void> {
    await this.pagesResource.handle('setHomepage', ctx)
  }
}
