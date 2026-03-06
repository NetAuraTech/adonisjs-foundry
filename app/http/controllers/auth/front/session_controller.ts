import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import { ErrorHandlerService } from '#services/logging/error_handler_service'
import { AuthService } from '#services/auth/auth_service'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { enabledProviders } from '#helpers/auth/oauth'

@inject()
export default class SessionController {
  constructor(
    protected errorHandler: ErrorHandlerService,
    protected authService: AuthService
  ) {}
  render(ctx: HttpContext) {
    const { inertia } = ctx

    try {
      return inertia.render('auth/front/login', {
        providers: enabledProviders,
      })
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }

  async execute(ctx: HttpContext) {
    const { request, response, session, auth, i18n } = ctx

    try {
      const payload = await loginValidator.validate(request.all())

      const user = await this.authService.login(payload.email, payload.password)

      await auth.use('web').login(user, payload.remember_me)
      regenerateCsrfToken(ctx)

      session.flash('success', i18n.t('auth.login.success'))

      return response.redirect().toRoute('home')
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }
}
