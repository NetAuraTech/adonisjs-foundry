import type { I18nService } from '#services/i18n_service'
import type Role from '#models/auth/role'
import type Permission from '#models/auth/permission'
import type { TranslationNodes } from '#types/translations'

export function buildUsersShowPayload(
  i18n: I18nService,
  role: Role,
  permissions: Permission[]
) {
  return i18n.buildPayload({
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
    actions: {
      edit: i18n.entry('cms.users.edit.title', { username: '{username}' }),
      delete: i18n.entry('cms.users.delete.title', { username: '{username}' }),
    },
    roles: {
      value: 'cms.users.show.role.value',
      current: 'cms.users.show.role.current',
      ...[role].reduce((acc, r) => {
        acc[r.slug] = {
          value: `cms.users.roles.${r.slug}.value`,
          description: `cms.users.roles.${r.slug}.description`,
        }
        return acc
      }, {} as TranslationNodes),
    },
    permissions: {
      value: i18n.entry('cms.users.show.permission.value', { amount: '{amount}' }),
      ...permissions.reduce(
        (acc, permission) => {
          const [section, action] = permission.slug.split('.')

          if (!acc.category[section]) {
            acc.category[section] = `cms.users.permissions.category.${section}`
          }

          if (!acc[section]) acc[section] = {}
          acc[section][action] = {
            value: `cms.users.permissions.${section}.${action}.value`,
          }

          return acc
        },
        { category: {} } as { category: Record<string, string>; [key: string]: any }
      ),
    },
  })
}
