import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import User from '#models/auth/user'
import UserTransformer from '#transformers/user_transformer'
import { profileValidator } from '#validators/profile'
import { UpdateUserProfileAction } from '#actions/profile/update_user_profile_action'

/**
 * GET  /api/v1/profile — current user profile (own)
 * PUT  /api/v1/profile — update own username
 */
@inject()
export default class ProfileApiController {
  constructor(protected updateUserProfileAction: UpdateUserProfileAction) {}

  async show(ctx: HttpContext) {
    const { auth, serialize } = ctx

    const user = auth.getUserOrFail()

    await this.preloadRole(user)

    return serialize(UserTransformer.transform(user))
  }

  async update(ctx: HttpContext) {
    const { auth, request, serialize } = ctx

    const user = auth.getUserOrFail()

    const payload = await profileValidator(user.id).validate(request.all())

    await this.updateUserProfileAction.execute({ user, username: payload.username })

    await user.refresh()
    await this.preloadRole(user)

    return serialize(UserTransformer.transform(user))
  }

  private async preloadRole(user: InstanceType<typeof User>) {
    await user.load((loader) => {
      loader.load('role', (role) => {
        role.preload('permissions')
      })
    })
  }
}
