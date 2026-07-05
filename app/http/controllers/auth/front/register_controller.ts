import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { registerValidator } from '#validators/auth'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { I18nService } from '#services/i18n_service'
import { enabledProviders } from '#helpers/auth/oauth'
import { RegisterUserAction } from '#actions/auth/register_user_action'
import { SendEmailVerificationAction } from '#actions/email_verification/send_email_verification_action'

@inject()
export default class RegisterController {
  constructor(
    protected i18n: I18nService,
    protected registerUserAction: RegisterUserAction,
    protected sendEmailVerificationAction: SendEmailVerificationAction
  ) {}

  render(ctx: HttpContext) {
    const { inertia } = ctx

    return inertia.render('auth/front/register', {
      providers: enabledProviders,
      translations: this.i18n.buildPayload({
        title: 'auth.register.title',
        sub_title: 'auth.register.sub_title',
        account: {
          has: 'auth.register.account.has',
          login: 'auth.register.account.login',
        },
        email: {
          value: 'auth.register.email.value',
          placeholder: 'auth.register.email.placeholder',
        },
        password: {
          value: 'auth.register.password.value',
          help: 'auth.register.password.help',
          confirmation: {
            value: 'auth.register.password.confirmation.value',
            help: 'auth.register.password.confirmation.help',
          },
        },
        submit: 'auth.register.submit',
        or_continue_with: 'auth.register.or_continue_with',
      }),
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, auth, session } = ctx

    const payload = await registerValidator.validate(request.all())

    const user = await this.registerUserAction.execute({
      ...payload,
      locale: this.i18n.getLocale(),
    })

    await auth.use('web').login(user)
    regenerateCsrfToken(ctx)

    await this.sendEmailVerificationAction.execute({ user })

    session.flash('success', this.i18n.translate('auth.session.register.success'))

    return response.redirect().toRoute('settings.profile.render')
  }
}
