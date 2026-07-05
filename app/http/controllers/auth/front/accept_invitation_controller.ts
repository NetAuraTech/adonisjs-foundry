import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { acceptInvitationValidator, invitationValidator } from '#validators/auth'
import { I18nService } from '#services/i18n_service'
import { FullToken } from '#types/core'
import UserTransformer from '#transformers/user_transformer'
import { GetInvitationAction } from '#actions/invitation/get_invitation_action'
import { AcceptInvitationAction } from '#actions/invitation/accept_invitation_action'

@inject()
export default class AcceptInvitationController {
  constructor(
    protected i18n: I18nService,
    protected getInvitationAction: GetInvitationAction,
    protected acceptInvitationAction: AcceptInvitationAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, params } = ctx

    const payload = await invitationValidator.validate(params)
    const user = await this.getInvitationAction.execute({ token: payload.token as FullToken })

    return inertia.render('auth/front/accept_invitation', {
      token: payload.token,
      user: UserTransformer.transform(user),
      translations: {
        ...this.i18n.buildPayload({
          title: 'auth.invitation.title',
          sub_title: 'auth.invitation.sub_title',
          email: {
            value: 'auth.invitation.email.value',
            placeholder: 'auth.invitation.email.placeholder',
            help: 'auth.invitation.email.help',
          },
          username: {
            value: 'auth.invitation.username.value',
            placeholder: 'auth.invitation.username.placeholder',
            help: 'auth.invitation.username.help',
          },
          password: {
            confirmation: {
              help: 'auth.invitation.password.confirmation.help',
              value: 'auth.invitation.password.confirmation.value',
            },
            help: 'auth.invitation.password.help',
            value: 'auth.invitation.password.value',
          },
          submit: 'auth.invitation.submit',
        }),
        banner: {
          title: this.i18n.translate('auth.invitation.banner.title', { email: user.email }),
          message: this.i18n.translate('auth.invitation.banner.message'),
        },
      },
    })
  }

  async execute(ctx: HttpContext) {
    const { response, request, auth, session } = ctx

    const { token } = await invitationValidator.validate(request.only(['token']))

    const invitedUser = await this.getInvitationAction.execute({ token: token as FullToken })

    const payload = await acceptInvitationValidator(invitedUser.id).validate(request.all())

    const user = await this.acceptInvitationAction.execute({
      token: token as FullToken,
      password: payload.password,
    })

    await auth.use('web').login(user)

    session.flash('success', this.i18n.translate('auth.invitation.accepted'))

    return response.redirect().toRoute('settings.index')
  }
}
