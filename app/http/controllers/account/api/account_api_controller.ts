import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import AccountResource from '#rest/account'

/**
 * PUT /api/v1/account — update the current user's email or password (self),
 * dispatched on the body's `_action` discriminator.
 * DELETE /api/v1/account — delete the current user's account (self).
 *
 * Thin transport adapter over the endpoints of the {@link AccountResource};
 * each endpoint declaration is executed by the shared REST pipeline.
 */
@inject()
export default class AccountApiController {
  constructor(protected accountResource: AccountResource) {}

  async update(ctx: HttpContext): Promise<void> {
    await this.accountResource.handleUpdate(ctx)
  }

  async destroy(ctx: HttpContext): Promise<void> {
    await this.accountResource.handle('destroy', ctx)
  }
}
