import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import FoldersResource from '#rest/folders'

/**
 * PUT /api/v1/admin/folders/:id — rename a folder from the admin REST API.
 *
 * Thin transport adapter over the `update` endpoint of the
 * {@link FoldersResource}; the endpoint declaration is executed by the shared
 * REST pipeline.
 */
@inject()
export default class FoldersUpdateApiController {
  constructor(protected foldersResource: FoldersResource) {}

  async update(ctx: HttpContext): Promise<void> {
    await this.foldersResource.handle('update', ctx)
  }
}
