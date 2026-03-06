import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { PasswordService } from '#services/auth/password_service'
import { ErrorHandlerService } from '#services/logging/error_handler_service'
import { resetPasswordValidator } from '#validators/auth'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { FullToken } from '#types/core'

@inject()
export default class ResetPasswordController {
  constructor(
    protected passwordService: PasswordService,
    protected errorHandler: ErrorHandlerService
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, params, i18n } = ctx

    try {
      await this.passwordService.validate(params.token)

      return inertia.render('auth/front/reset_password', { token: params.token })
    } catch (error) {
      return this.errorHandler.handle(ctx, error, [
        {
          code: 'E_TOKEN_EXPIRED',
          message: i18n.t('core.token.invalid'),
          callback: ({ response, session }: HttpContext) => {
            session.flash('error', i18n.t('core.token.invalid'))
            return response.redirect().toRoute('auth.forgot_password.render')
          },
        },
        {
          code: 'E_MAX_ATTEMPTS_EXCEEDED',
          message: i18n.t('core.token.max_attempts_exceeded'),
          callback: ({ response, session }: HttpContext) => {
            session.flash('error', i18n.t('core.token.max_attempts_exceeded'))
            return response.redirect().toRoute('auth.forgot_password.render')
          },
        },
      ])
    }
  }

  async execute(ctx: HttpContext) {
    const { request, response, session, auth, i18n } = ctx

    try {
      const payload = await resetPasswordValidator.validate(request.all())

      const user = await this.passwordService.reset({
        ...payload,
        token: payload.token as FullToken,
      })

      await auth.use('web').login(user)
      regenerateCsrfToken(ctx)

      session.flash('success', i18n.t('auth.reset_password.success'))
      return response.redirect().toRoute('home')
    } catch (error) {
      return this.errorHandler.handle(ctx, error, [
        {
          code: 'E_INVALID_TOKEN',
          message: i18n.t('core.token.invalid'),
          callback: ({ response: callback_response, session: callback_session }) => {
            callback_session.flash('error', i18n.t('core.token.invalid'))
            return callback_response.redirect().toRoute('auth.forgot_password.render')
          },
        },
        {
          code: 'E_MAX_ATTEMPTS_EXCEEDED',
          message: i18n.t('core.token.max_attempts_exceeded'),
          callback: ({ response: callback_response, session: callback_session }) => {
            callback_session.flash('error', i18n.t('core.token.max_attempts_exceeded'))
            return callback_response.redirect().toRoute('auth.forgot_password.render')
          },
        },
      ])
    }
  }
}
