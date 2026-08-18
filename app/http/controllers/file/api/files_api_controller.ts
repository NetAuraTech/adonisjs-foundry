import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import FilesResource from '#rest/files'

/**
 * GET  /api/v1/admin/files — list files from the admin REST API.
 * PUT  /api/v1/admin/files/:id/move — move a file to another folder.
 *
 * Thin transport adapters over the `index` and `move` endpoints of the
 * {@link FilesResource}; the endpoint declarations are executed by the shared
 * REST pipeline.
 */
@inject()
export default class FilesApiController {
  constructor(protected filesResource: FilesResource) {}

  async index(ctx: HttpContext): Promise<void> {
    await this.filesResource.handle('index', ctx)
  }

  async move(ctx: HttpContext): Promise<void> {
    await this.filesResource.handle('move', ctx)
  }
}
