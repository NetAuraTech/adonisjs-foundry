import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { acceptInvitationValidator, invitationValidator } from '#validators/auth'
import { FullToken } from '#types/core'
import UserTransformer from '#transformers/user_transformer'
import { GetInvitationAction } from '#actions/invitation/get_invitation_action'
import { AcceptInvitationAction } from '#actions/invitation/accept_invitation_action'

@inject()
export default class AcceptInvitationController {
  constructor(
    protected getInvitationAction: GetInvitationAction,
    protected acceptInvitationAction: AcceptInvitationAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, params, i18n } = ctx

    const payload = await invitationValidator.validate(params)
    const user = await this.getInvitationAction.execute({ token: payload.token as FullToken })

    return inertia.render('auth/front/accept_invitation', {
      token: payload.token,
      user: UserTransformer.transform(user),
      translations: {
        title: i18n.t('auth.invitation.title'),
        sub_title: i18n.t('auth.invitation.sub_title'),
        banner: {
          title: i18n.t('auth.invitation.banner.title', { email: user.email }),
          message: i18n.t('auth.invitation.banner.message'),
        },
        email: {
          value: i18n.t('auth.invitation.email.value'),
          placeholder: i18n.t('auth.invitation.email.placeholder'),
          help: i18n.t('auth.invitation.email.help'),
        },
        username: {
          value: i18n.t('auth.invitation.username.value'),
          placeholder: i18n.t('auth.invitation.username.placeholder'),
          help: i18n.t('auth.invitation.username.help'),
        },
        password: {
          confirmation: {
            help: i18n.t('auth.invitation.password.confirmation.help'),
            value: i18n.t('auth.invitation.password.confirmation.value'),
          },
          help: i18n.t('auth.invitation.password.help'),
          value: i18n.t('auth.invitation.password.value'),
        },
        submit: i18n.t('auth.invitation.submit'),
      },
    })
  }

  async execute(ctx: HttpContext) {
    const { response, request, auth, session, i18n } = ctx

    const { token } = await invitationValidator.validate(request.only(['token']))

    const invitedUser = await this.getInvitationAction.execute({ token: token as FullToken })

    const payload = await acceptInvitationValidator(invitedUser.id).validate(request.all())

    const user = await this.acceptInvitationAction.execute({
      token: token as FullToken,
      password: payload.password,
    })

    await auth.use('web').login(user)

    session.flash('success', i18n.t('auth.invitation.accepted'))

    return response.redirect().toRoute('settings.index')
  }
}
