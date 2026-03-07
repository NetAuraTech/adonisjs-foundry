import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import {
  deleteAccountValidator,
  updateEmailValidator,
  updatePasswordValidator,
} from '#validators/account'
import { Exception } from '@adonisjs/core/exceptions'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { enabledProviders } from '#helpers/auth/oauth'
import UserTransformer from '#transformers/user_transformer'
import { AccountService } from '#services/account/account_service'
import { ErrorHandlerService } from '#services/logging/error_handler_service'

@inject()
export default class AccountController {
  constructor(
    protected errorHandler: ErrorHandlerService,
    protected accountService: AccountService
  ) {}

  async render(ctx: HttpContext) {
    const { auth, inertia } = ctx

    try {
      const user = auth.user!

      return inertia.render('settings/account/front/index', {
        user: UserTransformer.transform(user),
        providers: enabledProviders,
      })
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }

  async execute(ctx: HttpContext) {
    const { auth, request, response, session, i18n } = ctx

    try {
      const action = request.input('_action')

      const user = auth.getUserOrFail()

      switch (action) {
        case 'update_email': {
          const payload = await updateEmailValidator(user.id).validate(request.all())

          const updated = await this.accountService.update(user, payload)

          regenerateCsrfToken(ctx)

          if (payload.email === updated.pendingEmail) {
            session.flash('success', i18n.t('settings.account.success'))
          }

          return response.redirect().toRoute('settings.account.render')
        }
        case 'update_password': {
          const payload = await updatePasswordValidator.validate(request.all())

          await this.accountService.update(user, payload)

          regenerateCsrfToken(ctx)

          session.flash('success', i18n.t('settings.account.password.success'))

          return response.redirect().toRoute('settings.account.render')
        }
        default:
          throw new Exception('', { status: 400 })
      }
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }

  async destroy(ctx: HttpContext) {
    const { auth, request, response, session, i18n } = ctx

    try {
      const user = auth.getUserOrFail()

      const payload = await deleteAccountValidator.validate(request.all())

      await this.accountService.delete(user, payload)

      await auth.use('web').logout()

      session.flash('success', i18n.t('settings.password.delete.success'))

      return response.redirect().toRoute('auth.session.render')
    } catch (error) {
      return this.errorHandler.handle(ctx, error)
    }
  }
}
