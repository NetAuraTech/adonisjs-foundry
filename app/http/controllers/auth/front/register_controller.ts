import type { HttpContext } from '@adonisjs/core/http'
import { ErrorHandlerService } from '#services/logging/error_handler_service'
import { AuthService } from '#services/auth/auth_service'
import { registerValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { EmailVerificationService } from '#services/auth/email_verification_service'
import { enabledProviders } from '#helpers/auth/oauth'

@inject()
export default class RegisterController {
  constructor(
    protected errorHandler: ErrorHandlerService,
    protected authService: AuthService,
    protected emailVerificationService: EmailVerificationService
  ) {}

  render(ctx: HttpContext) {
    const { inertia } = ctx

    try {
      return inertia.render('auth/front/register', {
        providers: enabledProviders,
      })
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }

  async execute(ctx: HttpContext) {
    const { request, response, auth, session, i18n } = ctx

    try {
      const payload = await registerValidator.validate(request.all())

      const user = await this.authService.register({
        ...payload,
        locale: ctx.i18n.locale,
      })

      await auth.use('web').login(user)
      regenerateCsrfToken(ctx)

      await this.emailVerificationService.send(user)

      session.flash('success', i18n.t('auth.session.register.success'))

      return response.redirect().toRoute('settings.profile.render')
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }
}
