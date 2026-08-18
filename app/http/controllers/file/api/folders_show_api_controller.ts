import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import FoldersResource from '#rest/folders'

/**
 * GET /api/v1/admin/folders/:id — show a folder from the admin REST API.
 * GET /api/v1/admin/folders/:id/children — list a folder's direct children.
 *
 * Thin transport adapters over the `show` and `children` endpoints of the
 * {@link FoldersResource}; the endpoint declarations are executed by the
 * shared REST pipeline.
 */
@inject()
export default class FoldersShowApiController {
  constructor(protected foldersResource: FoldersResource) {}

  async show(ctx: HttpContext): Promise<void> {
    await this.foldersResource.handle('show', ctx)
  }

  async children(ctx: HttpContext): Promise<void> {
    await this.foldersResource.handle('children', ctx)
  }
}
