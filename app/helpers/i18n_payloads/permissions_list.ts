import type { I18nService } from '#services/i18n_service'
import type Permission from '#models/auth/permission'
import type { TranslationNodes } from '#types/translations'
import { nestTranslation, permissionCategoryKey } from '#helpers/i18n_payloads/nest'

/**
 * Builds the translation payload for the permissions listing page.
 *
 * Includes per-permission entries nested by slug (`items.{...}`) and
 * per-category labels (`categories.{...}`) so the frontend can group by
 * category. Leaves are the raw stored values — system permissions store i18n
 * keys resolved by the `permissions` lang namespace, custom permissions store
 * plain strings returned unchanged by `i18n.t()`.
 */
export function buildPermissionsListPayload(i18n: I18nService, permissions: Permission[]) {
  const categories: TranslationNodes = {}
  const items: TranslationNodes = {}

  for (const permission of permissions) {
    nestTranslation(categories, permissionCategoryKey(permission.category), permission.category)
    nestTranslation(items, permission.slug, {
      value: permission.name,
      description: permission.description ?? '',
    })
  }

  return i18n.buildPayload({
    title: 'cms.permissions.list.title',
    create: { title: 'cms.permissions.create.title' },
    table: {
      name: 'cms.permissions.table.name',
      slug: 'cms.permissions.table.slug',
      description: 'cms.permissions.table.description',
    },
    actions: {
      value: 'cms.permissions.actions',
      edit: i18n.entry('cms.permissions.edit.title', { name: '{name}' }),
      delete: i18n.entry('cms.permissions.delete.title', { name: '{name}' }),
    },
    delete: {
      confirm: i18n.entry('cms.permissions.delete.confirm', { name: '{name}' }),
    },
    system: {
      value: 'cms.permissions.system.value',
      hint: 'cms.permissions.system.hint',
    },
    empty: 'cms.permissions.empty',
    categories,
    items,
  })
}
