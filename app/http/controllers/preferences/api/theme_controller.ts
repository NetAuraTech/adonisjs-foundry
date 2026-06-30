import type { HttpContext } from '@adonisjs/core/http'
import { updateValidator } from '#validators/preference'
import { inject } from '@adonisjs/core'
import { UpdatePreferencesAction } from '#actions/preferences/update_preferences_action'

@inject()
export default class ThemesController {
  constructor(private updatePreferencesAction: UpdatePreferencesAction) {}

  async execute(ctx: HttpContext) {
    const { request, response, auth, session, i18n } = ctx

    const user = auth.getUserOrFail()
    const payload = await updateValidator.validate(request.all())

    await this.updatePreferencesAction.execute({ user, data: payload })

    await user.refresh()

    session.flash('success', i18n.t('settings.preferences.success'))

    return response.ok(i18n.t('settings.preferences.theme.success'))
  }
}
