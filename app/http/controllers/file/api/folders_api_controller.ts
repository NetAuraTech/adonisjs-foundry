import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import FoldersResource from '#rest/folders'

/**
 * GET  /api/v1/admin/folders — list root folders from the admin REST API.
 * POST /api/v1/admin/folders — create a folder.
 *
 * Thin transport adapters over the `index` and `store` endpoints of the
 * {@link FoldersResource}; the endpoint declarations are executed by the
 * shared REST pipeline.
 */
@inject()
export default class FoldersApiController {
  constructor(protected foldersResource: FoldersResource) {}

  async index(ctx: HttpContext): Promise<void> {
    await this.foldersResource.handle('index', ctx)
  }

  async store(ctx: HttpContext): Promise<void> {
    await this.foldersResource.handle('store', ctx)
  }
}
