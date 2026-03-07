import type { HttpContext } from '@adonisjs/core/http'
import { ErrorHandlerService } from '#services/logging/error_handler_service'
import { inject } from '@adonisjs/core'
import UserTransformer from '#transformers/user_transformer'
import { profileValidator } from '#validators/profile'
import { ProfileService } from '#services/profile/profile_service'

@inject()
export default class ProfileController {
  constructor(
    protected errorHandler: ErrorHandlerService,
    protected profileService: ProfileService
  ) {}

  async render(ctx: HttpContext) {
    const { auth, inertia } = ctx

    try {
      const user = auth.user!

      return inertia.render('settings/profile/front/index', {
        user: UserTransformer.transform(user),
      })
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }

  async execute(ctx: HttpContext) {
    const { auth, request, response, session, i18n } = ctx

    try {
      const user = auth.getUserOrFail()

      const payload = await profileValidator(user.id).validate(request.all())

      await this.profileService.update(user, payload)

      await user.refresh()

      session.flash('success', i18n.t('settings.profile.success'))

      return response.redirect().toRoute('settings.profile.render')
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }
}
