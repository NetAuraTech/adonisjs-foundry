import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { PasswordService } from '#services/auth/password_service'
import { resetPasswordValidator } from '#validators/auth'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { FullToken } from '#types/core'

@inject()
export default class ResetPasswordController {
  constructor(protected passwordService: PasswordService) {}

  async render(ctx: HttpContext) {
    const { inertia, params } = ctx

    await this.passwordService.validate(params.token)

    return inertia.render('auth/front/reset_password', { token: params.token })
  }

  async execute(ctx: HttpContext) {
    const { request, response, session, auth, i18n } = ctx

    const payload = await resetPasswordValidator.validate(request.all())

    const user = await this.passwordService.reset({
      ...payload,
      token: payload.token as FullToken,
    })

    await auth.use('web').login(user)
    regenerateCsrfToken(ctx)

    session.flash('success', i18n.t('auth.reset_password.success'))
    return response.redirect().toRoute('settings.profile.render')
  }
}
