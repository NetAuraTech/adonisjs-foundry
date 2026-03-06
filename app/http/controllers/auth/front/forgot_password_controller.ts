import type { HttpContext } from '@adonisjs/core/http'
import { ErrorHandlerService } from '#services/logging/error_handler_service'
import { inject } from '@adonisjs/core'
import { forgotPasswordValidator } from '#validators/auth'
import User from '#models/auth/user'
import { PasswordService } from '#services/auth/password_service'

@inject()
export default class ForgotPasswordController {
  constructor(
    protected errorHandler: ErrorHandlerService,
    protected passwordService: PasswordService
  ) {}

  render(ctx: HttpContext) {
    const { inertia } = ctx

    try {
      return inertia.render('auth/front/forgot_password', {})
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }

  async execute(ctx: HttpContext) {
    const { request, response, session, i18n } = ctx

    try {
      const payload = await forgotPasswordValidator.validate(request.all())

      const user = await User.findBy('email', payload.email)

      if (user) {
        await this.passwordService.send(user)
      }

      session.flash('success', i18n.t('auth.forgot_password.email_sent'))

      return response.redirect().toRoute('auth.session.render')
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }
}
