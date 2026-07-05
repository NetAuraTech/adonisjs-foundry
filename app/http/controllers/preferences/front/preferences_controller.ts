import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { updateValidator } from '#validators/preference'
import { I18nService } from '#services/i18n_service'
import { UpdatePreferencesAction } from '#actions/preferences/update_preferences_action'

@inject()
export default class PreferencesController {
  constructor(
    protected i18n: I18nService,
    private updatePreferencesAction: UpdatePreferencesAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia } = ctx

    return inertia.render('settings/preferences/front/index', {
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
        appearance: {
          title: 'settings.preferences.appearance.title',
          sub_title: 'settings.preferences.appearance.sub_title',
          value: 'settings.preferences.appearance.value',
        },
        interface: {
          title: 'settings.preferences.interface.title',
          sub_title: 'settings.preferences.interface.sub_title',
          submit: 'settings.preferences.interface.submit',
          locale: {
            english: 'settings.preferences.interface.locale.english',
            french: 'settings.preferences.interface.locale.french',
            value: 'settings.preferences.interface.locale.value',
          },
        },
      }),
    })
  }

  async execute(ctx: HttpContext): Promise<void> {
    const { request, response, auth, session } = ctx

    const user = auth.getUserOrFail()
    const payload = await updateValidator.validate(request.all())

    await this.updatePreferencesAction.execute({ user, data: payload })

    await user.refresh()

    session.flash('success', this.i18n.translate('settings.preferences.success'))

    return response.redirect().toRoute('settings.preferences.render')
  }
}
