import type { HttpContext } from '@adonisjs/core/http'
import { SocialService } from '#services/auth/social_service'
import { inject } from '@adonisjs/core'
import { ErrorHandlerService } from '#services/logging/error_handler_service'
import { OAuthProvider } from '#types/auth'
import { validateProvider } from '#helpers/auth/oauth'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { definePasswordValidator } from '#validators/auth'
import { UserRepository } from '#repositories/auth/user_repository'

@inject()
export default class SocialController {
  constructor(
    protected socialService: SocialService,
    protected errorHandler: ErrorHandlerService,
    protected userRepository: UserRepository
  ) {}

  async redirect(ctx: HttpContext) {
    const { ally, params } = ctx

    try {
      const provider = params.provider as OAuthProvider

      validateProvider(provider)

      return ally.use(provider).redirect()
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }

  async callback(ctx: HttpContext) {
    const { ally, params, auth, response, session, i18n } = ctx

    try {
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
        await this.socialService.linkProvider(authenticatedUser, allyUser, provider)
        regenerateCsrfToken(ctx)
        session.flash('success', i18n.t('auth.social.linked', { provider }))
        return response.redirect().toRoute('settings.account.render')
      }

      const user = await this.socialService.findOrCreateUser(allyUser, provider)
      await auth.use('web').login(user)

      if (this.socialService.needsPasswordSetup(user)) {
        session.flash('info', i18n.t('auth.social.set_password_info'))
        return response.redirect().toRoute('auth.social.render')
      }

      session.flash('success', i18n.t('auth.session.login.success'))
      return response.redirect().toRoute('settings.profile.render')
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }

  async unlink(ctx: HttpContext) {
    const { auth, params, response, session, i18n } = ctx

    try {
      const provider = params.provider as OAuthProvider

      validateProvider(provider)

      const user = auth.getUserOrFail()
      await this.socialService.unlinkProvider(user, provider)

      // Safety net: should not happen in practice since users are always
      // prompted to set a password during registration, but guards against
      // any edge case that would leave the account inaccessible.
      if (this.socialService.needsPasswordSetup(user)) {
        session.flash('warning', i18n.t('auth.social.password_required_after_unlink'))
        return response.redirect().toRoute('auth.social.render')
      }

      regenerateCsrfToken(ctx)
      session.flash('success', i18n.t('auth.social.unlinked', { provider }))

      return response.redirect().back()
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }

  async render(ctx: HttpContext) {
    const { inertia } = ctx

    try {
      return inertia.render('auth/front/define_password', {})
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }

  async execute(ctx: HttpContext) {
    const { auth, request, response, session, i18n } = ctx

    try {
      const user = auth.getUserOrFail()
      const payload = await definePasswordValidator.validate(request.all())

      await this.userRepository.updatePassword(user, payload.password)

      regenerateCsrfToken(ctx)
      session.flash('success', i18n.t('auth.social.password_defined'))
      return response.redirect().toRoute('settings.account.render')
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }
}
