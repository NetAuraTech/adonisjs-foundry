import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import FilesResource from '#rest/files'

/**
 * PUT    /api/v1/admin/files/:id/alt — upsert an alt-text entry.
 * DELETE /api/v1/admin/files/:id/alt — delete an alt-text entry.
 *
 * Thin transport adapters over the `upsertAlt` and `deleteAlt` endpoints of
 * the {@link FilesResource}; the endpoint declarations are executed by the
 * shared REST pipeline.
 */
@inject()
export default class FilesAltApiController {
  constructor(protected filesResource: FilesResource) {}

  async upsertAlt(ctx: HttpContext): Promise<void> {
    await this.filesResource.handle('upsertAlt', ctx)
  }

  async deleteAlt(ctx: HttpContext): Promise<void> {
    await this.filesResource.handle('deleteAlt', ctx)
  }
}
