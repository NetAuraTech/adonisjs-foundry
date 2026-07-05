import type { HttpContext } from '@adonisjs/core/http'
import { GetUserDetailAction } from '#actions/user/get_user_detail_action'
import { inject } from '@adonisjs/core'
import { showValidator } from '#validators/user'
import { I18nService } from '#services/i18n_service'
import UserTransformer from '#transformers/user_transformer'
import { enabledProviders } from '#helpers/auth/oauth'
import { ListAllPermissionsAction } from '#actions/permission/list_all_permissions_action'
import PermissionTransformer from '#transformers/permission_transformer'
import { TranslationNodes } from '#types/translations'

@inject()
export default class UsersShowsController {
  constructor(
    protected i18n: I18nService,
    protected getUserDetailAction: GetUserDetailAction,
    protected listAllPermissionsAction: ListAllPermissionsAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, params } = ctx

    const payload = await showValidator.validate(params)

    const user = await this.getUserDetailAction.execute({ id: payload.id })

    const role = user.role

    const permissions = await this.listAllPermissionsAction.execute()

    return inertia.render('auth/cms/show', {
      user: UserTransformer.transform(user),
      providers: enabledProviders,
      permissions: PermissionTransformer.transform(permissions),
      translations: {
        ...this.i18n.buildPayload({
          title: 'cms.users.list.title',
          info: {
            email: 'cms.users.show.info.email',
            username: 'cms.users.show.info.username',
            value: 'cms.users.show.info.value',
          },
          history: {
            created_at: 'cms.users.show.history.created_at',
            updated_at: 'cms.users.show.history.updated_at',
            verified_at: 'cms.users.show.history.verified_at',
            value: 'cms.users.show.history.value',
          },
          providers: {
            connected: 'cms.users.show.providers.connected',
            not_connected: 'cms.users.show.providers.not_connected',
            value: 'cms.users.show.providers.value',
          },
          status: {
            verified: 'cms.users.status.verified',
            unverified: 'cms.users.status.unverified',
            pending_invite: 'cms.users.status.pending_invite',
          },
        }),
        actions: {
          edit: this.i18n.translate('cms.users.edit.title', { username: '{username}' }),
          delete: this.i18n.translate('cms.users.delete.title', { username: '{username}' }),
        },
        roles: {
          ...this.i18n.buildPayload({
            roles: {
              value: 'cms.users.show.role.value',
              current: 'cms.users.show.role.current',
            },
          }).roles,
          ...[role].reduce((acc, r) => {
            acc[r.slug] = {
              value: this.i18n.translate(`cms.users.roles.${r.slug}.value`),
              description: this.i18n.translate(`cms.users.roles.${r.slug}.description`),
            }
            return acc
          }, {} as TranslationNodes),
        },
        permissions: {
          value: this.i18n.translate('cms.users.show.permission.value', { amount: '{amount}' }),
          ...permissions.reduce(
            (acc, permission) => {
              const [section, action] = permission.slug.split('.')

              if (!acc.category[section]) {
                acc.category[section] = this.i18n.translate(
                  `cms.users.permissions.category.${section}`
                )
              }

              if (!acc[section]) acc[section] = {}
              acc[section][action] = {
                value: this.i18n.translate(
                  `cms.users.permissions.${section}.${action}.value`
                ),
              }

              return acc
            },
            { category: {} } as { category: Record<string, string>; [key: string]: any }
          ),
        },
      },
    })
  }
}
