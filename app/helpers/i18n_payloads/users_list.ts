import type { I18nService } from '#services/i18n_service'
import type Role from '#models/auth/role'
import type { TranslationNodes } from '#types/translations'

export function buildUsersListPayload(i18n: I18nService, roles: Role[]) {
  return i18n.buildPayload({
    title: 'cms.users.list.title',
    action: 'cms.users.list.action',
    search: {
      value: 'cms.users.search.value',
      placeholder: 'cms.users.search.placeholder',
      filter: 'cms.users.search.filter',
    },
    roles: {
      value: 'cms.users.roles.value',
      placeholder: 'cms.users.roles.placeholder',
      ...roles.reduce((acc, role) => {
        acc[role.slug] = {
          value: `cms.users.roles.${role.slug}.value`,
          description: `cms.users.roles.${role.slug}.description`,
        }
        return acc
      }, {} as TranslationNodes),
    },
    status: {
      verified: 'cms.users.status.verified',
      unverified: 'cms.users.status.unverified',
      pending_invite: 'cms.users.status.pending_invite',
      value: 'cms.users.status.value',
    },
    empty: 'cms.users.list.empty',
    register_on: 'cms.users.list.register_on',
    value: 'cms.users.value',
    value_one: 'cms.users.value_one',
    actions: {
      value: 'cms.users.actions',
      show: i18n.entry('cms.users.show.title', { username: '{username}' }),
      edit: i18n.entry('cms.users.edit.title', { username: '{username}' }),
      delete: i18n.entry('cms.users.delete.title', { username: '{username}' }),
    },
  })
}
