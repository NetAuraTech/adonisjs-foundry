import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { changeEmailValidator } from '#validators/account'
import { FullToken } from '#types/core'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { ConfirmEmailChangeAction } from '#actions/account/confirm_email_change_action'

@inject()
export default class EmailChangeController {
  constructor(protected confirmEmailChangeAction: ConfirmEmailChangeAction) {}

  async render(ctx: HttpContext) {
    const { inertia, params, i18n } = ctx

    return inertia.render('settings/account/front/email_change', {
      token: params.token,
      translations: {
        title: i18n.t('settings.email.change.title'),
        sub_title: i18n.t('settings.email.change.sub_title'),
        submit: i18n.t('settings.email.change.submit'),
        cancel: i18n.t('settings.email.change.cancel'),
        token: i18n.t('settings.email.change.token'),
        info: {
          title: i18n.t('settings.email.change.info.title'),
          message: i18n.t('settings.email.change.info.message'),
        },
      },
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, session, auth, i18n } = ctx

    await changeEmailValidator.validate(request.all())

    const updated = await this.confirmEmailChangeAction.execute({
      token: request.input('token') as FullToken,
    })

    if (!auth.user || auth.user.id !== updated.id) {
      await auth.use('web').login(updated)
    }

    regenerateCsrfToken(ctx)

    session.flash('success', i18n.t('settings.email.change.success'))

    return response.redirect().toRoute('settings.account.render')
  }
}
