import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import { AuthService } from '#services/auth/auth_service'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { enabledProviders } from '#helpers/auth/oauth'

@inject()
export default class SessionController {
  constructor(protected authService: AuthService) {}
  render(ctx: HttpContext) {
    const { inertia } = ctx

    return inertia.render('auth/front/login', {
      providers: enabledProviders,
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, session, auth, i18n } = ctx

    const payload = await loginValidator.validate(request.all())

    const user = await this.authService.login(payload.email, payload.password)

    await auth.use('web').login(user, payload.remember_me)
    regenerateCsrfToken(ctx)

    session.flash('success', i18n.t('auth.session.login.success'))

    return response.redirect().toRoute('settings.profile.render')
  }

  async destroy(ctx: HttpContext) {
    const { auth, response, session, i18n } = ctx

    const userId = auth.user?.id

    await auth.use('web').logout()

    if (userId) {
      await this.authService.logout(userId)
    }

    session.flash('success', i18n.t('auth.session.logout.success'))

    return response.redirect().toRoute('auth.session.render')
  }
}
