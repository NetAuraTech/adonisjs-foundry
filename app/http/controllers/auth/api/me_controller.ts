import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

/**
 * Identity endpoint of the REST API (`/api/v1/auth`).
 */
@inject()
export default class MeController {
  /**
   * GET /api/v1/auth/me
   *
   * Returns the user authenticated by the `Authorization: Bearer` token,
   * serialized exactly like the session-based identity payloads (role and
   * permissions included).
   */
  async show(ctx: HttpContext) {
    const user = ctx.auth.use('api').getUserOrFail()

    await user.load((loader) => {
      loader.load('role', (role) => {
        role.preload('permissions')
      })
    })

    return ctx.serialize(UserTransformer.transform(user))
  }
}
