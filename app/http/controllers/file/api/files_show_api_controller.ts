import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import FilesResource from '#rest/files_resource'
import { handle } from '#rest/rest_adapter'

/**
 * GET /api/v1/admin/files/:id — show a file from the admin REST API.
 *
 * Thin transport adapter over the `show` endpoint of the
 * {@link FilesResource}; the endpoint declaration is executed by the shared
 * REST pipeline.
 */
@inject()
export default class FilesShowApiController {
  constructor(protected filesResource: FilesResource) {}

  async show(ctx: HttpContext): Promise<void> {
    await handle(ctx, this.filesResource.endpoints.show)
  }
}
