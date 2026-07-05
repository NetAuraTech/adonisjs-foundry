import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { I18nService } from '#services/i18n_service'
import UserTransformer from '#transformers/user_transformer'
import { profileValidator } from '#validators/profile'
import { UpdateUserProfileAction } from '#actions/profile/update_user_profile_action'

@inject()
export default class ProfileController {
  constructor(
    protected i18n: I18nService,
    protected updateUserProfileAction: UpdateUserProfileAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, auth } = ctx

    const user = auth.user!

    return inertia.render('settings/profile/front/index', {
      user: UserTransformer.transform(user),
      translations: this.i18n.buildPayload({
        header: {
          title: 'settings.title',
          sub_title: 'settings.sub_title',
          tabs: {
            profile: 'settings.profile.value',
            account: 'settings.account.value',
            preferences: 'settings.preferences.value',
            admin: 'cms.value',
            logout: 'auth.session.logout.value',
          },
        },
        avatar: {
          change: 'settings.profile.avatar.change',
          value: 'settings.profile.avatar.value',
        },
        username: {
          placeholder: 'settings.profile.username.placeholder',
          value: 'settings.profile.username.value',
        },
        title: 'settings.profile.title',
        sub_title: 'settings.profile.sub_title',
        submit: 'settings.profile.submit',
      }),
    })
  }

  async execute(ctx: HttpContext) {
    const { auth, request, response, session } = ctx

    const user = auth.getUserOrFail()

    const payload = await profileValidator(user.id).validate(request.all())

    await this.updateUserProfileAction.execute({ user, username: payload.username })

    await user.refresh()

    session.flash('success', this.i18n.translate('settings.profile.success'))

    return response.redirect().toRoute('settings.profile.render')
  }
}
