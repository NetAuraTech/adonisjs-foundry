import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { resetPasswordValidator } from '#validators/auth'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { FullToken } from '#types/core'
import { ValidatePasswordTokenAction } from '#actions/password/validate_password_token_action'
import { ResetPasswordAction } from '#actions/password/reset_password_action'

@inject()
export default class ResetPasswordController {
  constructor(
    protected validatePasswordTokenAction: ValidatePasswordTokenAction,
    protected resetPasswordAction: ResetPasswordAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, params, i18n } = ctx

    await this.validatePasswordTokenAction.execute({ token: params.token as FullToken })

    return inertia.render('auth/front/reset_password', {
      token: params.token,
      translations: {
        title: i18n.t('auth.password.reset.title'),
        sub_title: i18n.t('auth.password.reset.sub_title'),
        password: {
          value: i18n.t('auth.password.reset.password.value'),
          help: i18n.t('auth.password.reset.password.help'),
          confirmation: {
            value: i18n.t('auth.password.reset.password.confirmation.value'),
            help: i18n.t('auth.password.reset.password.confirmation.help'),
          },
        },
        submit: i18n.t('auth.password.reset.submit'),
        back_to_login: i18n.t('auth.password.reset.back_to_login'),
      },
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, session, auth, i18n } = ctx

    const payload = await resetPasswordValidator.validate(request.all())

    const user = await this.resetPasswordAction.execute({
      ...payload,
      token: payload.token as FullToken,
    })

    await auth.use('web').login(user)
    regenerateCsrfToken(ctx)

    session.flash('success', i18n.t('auth.reset_password.success'))
    return response.redirect().toRoute('settings.profile.render')
  }
}
