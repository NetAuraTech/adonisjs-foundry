import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { InvitationService } from '#services/auth/invitation_service'
import { acceptInvitationValidator, invitationValidator } from '#validators/auth'
import { FullToken } from '#types/core'
import UserTransformer from '#transformers/user_transformer'

@inject()
export default class AcceptInvitationController {
  constructor(protected invitationService: InvitationService) {}

  async render(ctx: HttpContext) {
    const { inertia, params } = ctx

    const payload = await invitationValidator.validate(params)
    const user = await this.invitationService.get(payload.token as FullToken)

    return inertia.render('auth/front/accept_invitation', {
      token: payload.token,
      user: UserTransformer.transform(user),
    })
  }

  async execute(ctx: HttpContext) {
    const { response, request, auth, session, i18n } = ctx

    const { token } = await invitationValidator.validate(request.only(['token']))

    const invitation = await this.invitationService.get(token as FullToken)

    const payload = await acceptInvitationValidator(invitation.id).validate(request.all())

    const user = await this.invitationService.accept(token as FullToken, payload)

    await auth.use('web').login(user)

    session.flash('success', i18n.t('auth.invitation.accepted'))

    return response.redirect().toRoute('settings.index')
  }
}
