import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { AccountService } from '#services/account/account_service'
import { changeEmailValidator } from '#validators/account'
import { FullToken } from '#types/core'
import { regenerateCsrfToken } from '#helpers/auth/crsf'

@inject()
export default class EmailChangeController {
  constructor(protected accountService: AccountService) {}

  async render(ctx: HttpContext) {
    const { params, inertia } = ctx

    return inertia.render('settings/account/front/email_change', {
      token: params.token,
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, session, auth, i18n } = ctx

    const payload = await changeEmailValidator.validate(request.all())

    const updated = await this.accountService.confirmEmailChange(payload.token as FullToken)

    if (!auth.user || auth.user.id !== updated.id) {
      await auth.use('web').login(updated)
    }

    regenerateCsrfToken(ctx)

    session.flash('success', i18n.t('settings.email_change.success'))

    return response.redirect().toRoute('settings.account.render')
  }
}
