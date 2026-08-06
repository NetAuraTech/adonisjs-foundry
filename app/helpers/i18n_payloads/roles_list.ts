import type { I18nService } from '#services/i18n_service'
import type Role from '#models/auth/role'
import type { TranslationNodes } from '#types/translations'
import { nestTranslation } from '#helpers/i18n_payloads/nest'

/**
 * Builds the translation payload for the roles listing page.
 *
 * Includes one `roles.{slug...}` entry per role (system or custom). Leaves are
 * the raw stored values: system roles store i18n keys (`roles.admin.value`)
 * resolved by the `roles` lang namespace, while custom roles store plain
 * strings which `i18n.t()` returns unchanged.
 */
export function buildRolesListPayload(i18n: I18nService, roles: Role[]) {
  const roleEntries: TranslationNodes = {}

  for (const role of roles) {
    nestTranslation(roleEntries, role.slug, {
      value: role.name,
      description: role.description ?? '',
    })
  }

  return i18n.buildPayload({
    title: 'cms.roles.list.title',
    search: {
      value: 'cms.roles.search.value',
      placeholder: 'cms.roles.search.placeholder',
      filter: 'cms.roles.search.filter',
    },
    create: { title: 'cms.roles.create.title' },
    table: {
      name: 'cms.roles.table.name',
      slug: 'cms.roles.table.slug',
      permissions: 'cms.roles.table.permissions',
      users: 'cms.roles.table.users',
    },
    actions: {
      value: 'cms.roles.actions',
      show: i18n.entry('cms.roles.show.title', { name: '{name}' }),
      edit: i18n.entry('cms.roles.edit.title', { name: '{name}' }),
      delete: i18n.entry('cms.roles.delete.title', { name: '{name}' }),
    },
    delete: {
      confirm: i18n.entry('cms.roles.delete.confirm', { name: '{name}' }),
    },
    system: {
      value: 'cms.roles.system.value',
      hint: 'cms.roles.system.hint',
    },
    empty: 'cms.roles.empty',
    roles: roleEntries,
  })
}
