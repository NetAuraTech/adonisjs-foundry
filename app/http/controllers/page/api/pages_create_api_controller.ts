import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import PagesResource from '#rest/pages_resource'
import { handle } from '#rest/rest_adapter'

/**
 * POST /api/v1/admin/pages — create a page from the admin REST API.
 *
 * Thin transport adapter over the `store` endpoint of the
 * {@link PagesResource}; the endpoint declaration is executed by the shared
 * REST pipeline.
 */
@inject()
export default class PagesCreateApiController {
  constructor(protected pagesResource: PagesResource) {}

  async store(ctx: HttpContext): Promise<void> {
    await handle(ctx, this.pagesResource.endpoints.store)
  }
}
