import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { OAuthProvider } from '#types/auth'
import { validateProvider } from '#helpers/auth/oauth'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { definePasswordValidator } from '#validators/auth'
import { UserRepository } from '#repositories/auth/user_repository'
import { FindOrCreateSocialUserAction } from '#actions/social/find_or_create_social_user_action'
import { LinkSocialProviderAction } from '#actions/social/link_social_provider_action'
import { UnlinkSocialProviderAction } from '#actions/social/unlink_social_provider_action'
import { NeedsPasswordSetupAction } from '#actions/social/needs_password_setup_action'

@inject()
export default class SocialController {
  constructor(
    protected findOrCreateSocialUserAction: FindOrCreateSocialUserAction,
    protected linkSocialProviderAction: LinkSocialProviderAction,
    protected unlinkSocialProviderAction: UnlinkSocialProviderAction,
    protected needsPasswordSetupAction: NeedsPasswordSetupAction,
    protected userRepository: UserRepository
  ) {}

  async redirect(ctx: HttpContext) {
    const { ally, params } = ctx

    const provider = params.provider as OAuthProvider

    validateProvider(provider)

    return ally.use(provider).redirect()
  }

  async callback(ctx: HttpContext) {
    const { ally, params, auth, response, session, i18n } = ctx

    const provider = params.provider as OAuthProvider

    validateProvider(provider)

    const providerInstance = ally.use(provider)

    if (providerInstance.accessDenied()) {
      session.flash('error', i18n.t('auth.social.access_denied'))
      return response.redirect().toRoute('auth.session.render')
    }

    if (providerInstance.stateMisMatch()) {
      session.flash('error', i18n.t('auth.social.state_mismatch'))
      return response.redirect().toRoute('auth.session.render')
    }

    if (providerInstance.hasError()) {
      session.flash('error', providerInstance.getError() ?? i18n.t('common.unexpected_error'))
      return response.redirect().toRoute('auth.session.render')
    }

    const allyUser = await providerInstance.user()
    const authenticatedUser = auth.user

    if (authenticatedUser) {
      await this.linkSocialProviderAction.execute({ user: authenticatedUser, allyUser, provider })
      regenerateCsrfToken(ctx)
      session.flash('success', i18n.t('auth.social.linked', { provider }))
      return response.redirect().toRoute('settings.account.render')
    }

    const user = await this.findOrCreateSocialUserAction.execute({ allyUser, provider })
    await auth.use('web').login(user)

    if (await this.needsPasswordSetupAction.execute({ user })) {
      session.flash('info', i18n.t('auth.social.set_password_info'))
      return response.redirect().toRoute('auth.social.render')
    }

    session.flash('success', i18n.t('auth.session.login.success'))
    return response.redirect().toRoute('settings.profile.render')
  }

  async unlink(ctx: HttpContext) {
    const { auth, params, response, session, i18n } = ctx

    const provider = params.provider as OAuthProvider

    validateProvider(provider)

    const user = auth.getUserOrFail()
    await this.unlinkSocialProviderAction.execute({ user, provider })

    if (await this.needsPasswordSetupAction.execute({ user })) {
      session.flash('warning', i18n.t('auth.social.password_required_after_unlink'))
      return response.redirect().toRoute('auth.social.render')
    }

    regenerateCsrfToken(ctx)
    session.flash('success', i18n.t('auth.social.unlinked', { provider }))

    return response.redirect().back()
  }

  async render(ctx: HttpContext) {
    const { inertia, i18n } = ctx

    return inertia.render('auth/front/define_password', {
      translations: {
        title: i18n.t('auth.password.define.title'),
        sub_title: i18n.t('auth.password.define.sub_title'),
        password: {
          value: i18n.t('auth.password.define.password.value'),
          help: i18n.t('auth.password.define.password.help'),
          confirmation: {
            value: i18n.t('auth.password.define.password.confirmation.value'),
            help: i18n.t('auth.password.define.password.confirmation.help'),
          },
        },
        submit: i18n.t('auth.password.define.submit'),
      },
    })
  }

  async execute(ctx: HttpContext) {
    const { auth, request, response, session, i18n } = ctx

    const user = auth.getUserOrFail()
    const payload = await definePasswordValidator.validate(request.all())

    await this.userRepository.updatePassword(user, payload.password)

    regenerateCsrfToken(ctx)
    session.flash('success', i18n.t('auth.social.password_defined'))
    return response.redirect().toRoute('settings.account.render')
  }
}
