import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { forgotPasswordValidator } from '#validators/auth'
import { I18nService } from '#services/i18n_service'
import User from '#models/auth/user'
import { SendPasswordResetAction } from '#actions/password/send_password_reset_action'

@inject()
export default class ForgotPasswordController {
  constructor(
    protected i18n: I18nService,
    protected sendPasswordResetAction: SendPasswordResetAction
  ) {}

  render(ctx: HttpContext) {
    const { inertia } = ctx

    return inertia.render('auth/front/forgot_password', {
      translations: this.i18n.buildPayload({
        title: 'auth.password.forgot.title',
        sub_title: 'auth.password.forgot.sub_title',
        email: {
          value: 'auth.password.forgot.email.value',
          placeholder: 'auth.password.forgot.email.placeholder',
        },
        submit: 'auth.password.forgot.submit',
        back_to_login: 'auth.password.forgot.back_to_login',
      }),
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, session } = ctx

    const payload = await forgotPasswordValidator.validate(request.all())

    const user = await User.findBy('email', payload.email)

    if (user) {
      await this.sendPasswordResetAction.execute({ user })
    }

    session.flash('success', this.i18n.translate('auth.password.forgot.email_sent'))

    return response.redirect().toRoute('auth.session.render')
  }
}
