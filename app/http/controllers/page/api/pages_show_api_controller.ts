import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import PagesResource from '#rest/pages_resource'
import { handle } from '#rest/rest_adapter'

/**
 * GET /api/v1/admin/pages/:id — show a page from the admin REST API.
 *
 * Thin transport adapter over the `show` endpoint of the
 * {@link PagesResource}; the endpoint declaration is executed by the shared
 * REST pipeline.
 */
@inject()
export default class PagesShowApiController {
  constructor(protected pagesResource: PagesResource) {}

  async show(ctx: HttpContext): Promise<void> {
    await handle(ctx, this.pagesResource.endpoints.show)
  }
}
