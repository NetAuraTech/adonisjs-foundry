import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { registerValidator } from '#validators/auth'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { enabledProviders } from '#helpers/auth/oauth'
import { RegisterUserAction } from '#actions/auth/register_user_action'
import { SendEmailVerificationAction } from '#actions/email_verification/send_email_verification_action'

@inject()
export default class RegisterController {
  constructor(
    protected registerUserAction: RegisterUserAction,
    protected sendEmailVerificationAction: SendEmailVerificationAction
  ) {}

  render(ctx: HttpContext) {
    const { inertia, i18n } = ctx

    return inertia.render('auth/front/register', {
      providers: enabledProviders,
      translations: {
        title: i18n.t('auth.register.title'),
        sub_title: i18n.t('auth.register.sub_title'),
        account: {
          has: i18n.t('auth.register.account.has'),
          login: i18n.t('auth.register.account.login'),
        },
        email: {
          value: i18n.t('auth.register.email.value'),
          placeholder: i18n.t('auth.register.email.placeholder'),
        },
        password: {
          value: i18n.t('auth.register.password.value'),
          help: i18n.t('auth.register.password.help'),
          confirmation: {
            value: i18n.t('auth.register.password.confirmation.value'),
            help: i18n.t('auth.register.password.confirmation.help'),
          },
        },
        submit: i18n.t('auth.register.submit'),
        or_continue_with: i18n.t('auth.register.or_continue_with'),
      },
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, auth, session, i18n } = ctx

    const payload = await registerValidator.validate(request.all())

    const user = await this.registerUserAction.execute({
      ...payload,
      locale: ctx.i18n.locale,
    })

    await auth.use('web').login(user)
    regenerateCsrfToken(ctx)

    await this.sendEmailVerificationAction.execute({ user })

    session.flash('success', i18n.t('auth.session.register.success'))

    return response.redirect().toRoute('settings.profile.render')
  }
}
