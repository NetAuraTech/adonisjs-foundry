import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { VerifyEmailAction } from '#actions/email_verification/verify_email_action'
import { FullToken } from '#types/core'

@inject()
export default class EmailVerificationController {
  constructor(protected verifyEmailAction: VerifyEmailAction) {}

  async execute(ctx: HttpContext) {
    const { params, response, session, auth, i18n } = ctx

    const user = await this.verifyEmailAction.execute({ token: params.token as FullToken })

    if (!user) {
      session.flash('error', i18n.t('core.token.invalid'))
      return response.redirect().toRoute('auth.session.render')
    }

    if (!auth.user) {
      await auth.use('web').login(user)
    }

    session.flash('success', i18n.t('auth.verify_email.success'))

    return response.redirect().toRoute('settings.profile.render')
  }
}
