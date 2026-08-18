import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import ProfileResource from '#rest/profile'

/**
 * GET /api/v1/profile — show the current user's profile (self).
 * PUT /api/v1/profile — update the current user's username (self).
 *
 * Thin transport adapter over the endpoints of the {@link ProfileResource};
 * each endpoint declaration is executed by the shared REST pipeline.
 */
@inject()
export default class ProfileApiController {
  constructor(protected profileResource: ProfileResource) {}

  async show(ctx: HttpContext): Promise<void> {
    await this.profileResource.handle('show', ctx)
  }

  async update(ctx: HttpContext): Promise<void> {
    await this.profileResource.handle('update', ctx)
  }
}
