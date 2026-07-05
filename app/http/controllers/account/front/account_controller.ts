import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import {
  deleteAccountValidator,
  updateEmailValidator,
  updatePasswordValidator,
} from '#validators/account'
import { Exception } from '@adonisjs/core/exceptions'
import { regenerateCsrfToken } from '#helpers/auth/crsf'
import { I18nService } from '#services/i18n_service'
import { enabledProviders } from '#helpers/auth/oauth'
import UserTransformer from '#transformers/user_transformer'
import { UpdateUserAccountAction } from '#actions/account/update_user_account_action'
import { DeleteUserAccountAction } from '#actions/account/delete_user_account_action'

@inject()
export default class AccountController {
  constructor(
    protected i18n: I18nService,
    protected updateUserAccountAction: UpdateUserAccountAction,
    protected deleteUserAccountAction: DeleteUserAccountAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, auth } = ctx

    const user = auth.user!

    return inertia.render('settings/account/front/index', {
      user: UserTransformer.transform(user),
      providers: enabledProviders,
      translations: {
        ...this.i18n.buildPayload({
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
          email: {
            title: 'settings.account.email.title',
            sub_title: 'settings.account.email.sub_title',
            submit: 'settings.account.email.submit',
            placeholder: 'settings.account.email.placeholder',
            value: 'settings.account.email.value',
            change: {
              title: 'settings.account.email.change.title',
              sub_title: 'settings.account.email.change.sub_title',
              submit: 'settings.account.email.change.submit',
              cancel: 'settings.account.email.change.cancel',
              info: {
                title: 'settings.account.email.change.info.title',
                message: 'settings.account.email.change.info.message',
              },
            },
          },
          password: {
            title: 'settings.account.password.title',
            sub_title: 'settings.account.password.sub_title',
            submit: 'settings.account.password.submit',
            current: {
              value: 'settings.account.password.current.value',
            },
            confirm: {
              help: 'settings.account.password.confirm.help',
              value: 'settings.account.password.confirm.value',
            },
            new: {
              help: 'settings.account.password.new.help',
              value: 'settings.account.password.new.value',
            },
          },
          delete: {
            title: 'settings.account.delete.title',
            sub_title: 'settings.account.delete.sub_title',
            submit: 'settings.account.delete.submit',
            cancel: 'settings.account.delete.cancel',
            password: 'settings.account.delete.password',
            confirm: {
              title: 'settings.account.delete.confirm.title',
              sub_title: 'settings.account.delete.confirm.sub_title',
            },
          },
        }),
        oauth: {
          title: this.i18n.translate('settings.account.oauth.title'),
          sub_title: this.i18n.translate('settings.account.oauth.sub_title'),
          connected: this.i18n.translate('settings.account.oauth.connected'),
          not_connected: this.i18n.translate('settings.account.oauth.not_connected'),
          link: this.i18n.translate('settings.account.oauth.link'),
          unlink: {
            value: this.i18n.translate('settings.account.oauth.unlink.value'),
            confirm: this.i18n.translate('settings.account.oauth.unlink.confirm', {
              provider: '{provider}',
            }),
          },
        },
      },
    })
  }

  async execute(ctx: HttpContext) {
    const { auth, request, response, session } = ctx

    const action = request.input('_action')

    const user = auth.getUserOrFail()

    switch (action) {
      case 'update_email': {
        const payload = await updateEmailValidator(user.id).validate(request.all())

        const updated = await this.updateUserAccountAction.execute({ user, email: payload.email })

        regenerateCsrfToken(ctx)

        if (payload.email === updated.pendingEmail) {
          session.flash('success', this.i18n.translate('settings.account.success'))
        }

        return response.redirect().toRoute('settings.account.render')
      }
      case 'update_password': {
        const payload = await updatePasswordValidator.validate(request.all())

        await this.updateUserAccountAction.execute({
          user,
          currentPassword: payload.current_password,
          password: payload.password,
        })

        regenerateCsrfToken(ctx)

        session.flash('success', this.i18n.translate('settings.account.password.success'))

        return response.redirect().toRoute('settings.account.render')
      }
      default:
        throw new Exception('', { status: 400 })
    }
  }

  async destroy(ctx: HttpContext) {
    const { auth, request, response, session } = ctx

    const user = auth.getUserOrFail()

    const payload = await deleteAccountValidator.validate(request.all())

    await this.deleteUserAccountAction.execute({ user, password: payload.password })

    await auth.use('web').logout()

    session.flash('success', this.i18n.translate('settings.password.delete.success'))

    return response.redirect().toRoute('auth.session.render')
  }
}
