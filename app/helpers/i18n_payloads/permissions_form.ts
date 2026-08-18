import { createI18nEntry, type BuildPayloadResult, type I18nService } from '#services/i18n_service'

/**
 * The flat i18n key mapping for the permission create/edit form.
 */
export const PERMISSIONS_FORM_MAPPING = {
  title: {
    create: 'admin.permissions.create.title',
    edit: createI18nEntry('admin.permissions.edit.title', { name: '{name}' }),
  },
  name: {
    value: 'admin.permissions.form.name.value',
    placeholder: 'admin.permissions.form.name.placeholder',
  },
  slug: {
    value: 'admin.permissions.form.slug.value',
    placeholder: 'admin.permissions.form.slug.placeholder',
  },
  category: {
    value: 'admin.permissions.form.category.value',
    placeholder: 'admin.permissions.form.category.placeholder',
  },
  description: {
    value: 'admin.permissions.form.description.value',
    placeholder: 'admin.permissions.form.description.placeholder',
  },
  submit: 'admin.permissions.form.submit',
  actions: {
    list: 'admin.permissions.list.title',
  },
}

/**
 * Shape of the resolved translation payload for the permission create/edit form.
 */
export type AdminPermissionsFormTranslations = BuildPayloadResult<typeof PERMISSIONS_FORM_MAPPING>

/**
 * Builds the translation payload for the permission create/edit form.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The permission form `t` object with every UI string resolved.
 */
export function buildPermissionsFormPayload(i18n: I18nService): AdminPermissionsFormTranslations {
  return i18n.buildPayload(PERMISSIONS_FORM_MAPPING)
}
