import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { updateValidator } from '#validators/preference'
import PreferencesService from '#services/preferences/preference_service'

@inject()
export default class PreferencesController {
  constructor(private preferencesService: PreferencesService) {}

  async render(ctx: HttpContext) {
    const { inertia } = ctx

    return inertia.render('settings/preferences/front/index', {})
  }

  async execute(ctx: HttpContext): Promise<void> {
    const { request, response, auth, session, i18n } = ctx

    const user = auth.getUserOrFail()
    const payload = await updateValidator.validate(request.all())

    await this.preferencesService.update(user, payload)

    await user.refresh()

    session.flash('success', i18n.t('settings.preferences.success'))

    return response.redirect().toRoute('settings.preferences.render')
  }
}
