import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { changeEmailValidator } from '#validators/account'
import { FullToken } from '#types/core'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { ConfirmEmailChangeAction } from '#actions/account/confirm_email_change_action'
import { I18nService } from '#services/i18n_service'

@inject()
export default class EmailChangeController {
  constructor(
    protected i18n: I18nService,
    protected confirmEmailChangeAction: ConfirmEmailChangeAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, params } = ctx

    return inertia.render('settings/account/front/email_change', {
      token: params.token,
      translations: this.i18n.buildPayload({
        title: 'settings.email.change.title',
        sub_title: 'settings.email.change.sub_title',
        submit: 'settings.email.change.submit',
        cancel: 'settings.email.change.cancel',
        token: 'settings.email.change.token',
        info: {
          title: 'settings.email.change.info.title',
          message: 'settings.email.change.info.message',
        },
      }),
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, session, auth } = ctx

    await changeEmailValidator.validate(request.all())

    const updated = await this.confirmEmailChangeAction.execute({
      token: request.input('token') as FullToken,
    })

    if (!auth.user || auth.user.id !== updated.id) {
      await auth.use('web').login(updated)
    }

    regenerateCsrfToken(ctx)

    session.flash('success', this.i18n.translate('settings.email.change.success'))

    return response.redirect().toRoute('settings.account.render')
  }
}
