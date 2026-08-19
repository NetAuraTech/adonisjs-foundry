import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import PagesResource from '#rest/pages_resource'
import { handle } from '#rest/rest_adapter'

/**
 * PUT  /api/v1/admin/pages/:id — update a page
 * PUT  /api/v1/admin/pages/:id/publish — publish a page translation
 * PUT  /api/v1/admin/pages/:id/unpublish — unpublish a page translation
 *
 * Thin transport adapters over the `update`, `publish` and `unpublish`
 * endpoints of the {@link PagesResource}; the endpoint declarations are
 * executed by the shared REST pipeline.
 */
@inject()
export default class PagesUpdateApiController {
  constructor(protected pagesResource: PagesResource) {}

  async update(ctx: HttpContext): Promise<void> {
    await handle(ctx, this.pagesResource.endpoints.update)
  }

  async publish(ctx: HttpContext): Promise<void> {
    await handle(ctx, this.pagesResource.endpoints.publish)
  }

  async unpublish(ctx: HttpContext): Promise<void> {
    await handle(ctx, this.pagesResource.endpoints.unpublish)
  }
}
