import type { I18nService } from '#services/i18n_service'
import type Role from '#models/auth/role'
import type { TranslationNodes } from '#types/translations'

export function buildUsersFormPayload(i18n: I18nService, roles: Role[]) {
  return i18n.buildPayload({
    title: {
      create: 'cms.users.create.title',
      edit: i18n.entry('cms.users.edit.title', { username: '{username}' }),
    },
    email: {
      value: 'cms.users.form.email.value',
      placeholder: 'cms.users.form.email.placeholder',
    },
    username: {
      value: 'cms.users.form.username.value',
      placeholder: 'cms.users.form.username.placeholder',
    },
    roles: {
      value: 'cms.users.form.role.value',
      placeholder: 'cms.users.form.role.placeholder',
      ...roles.reduce((acc, role) => {
        acc[role.slug] = {
          value: `cms.users.roles.${role.slug}.value`,
          description: `cms.users.roles.${role.slug}.description`,
        }
        return acc
      }, {} as TranslationNodes),
    },
    submit: 'cms.users.form.submit',
    actions: {
      list: 'cms.users.list.title',
    },
  })
}
