import type { I18nService } from '#services/i18n_service'

/**
 * Builds the translation payload for the permission create/edit form.
 */
export function buildPermissionsFormPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: {
      create: 'cms.permissions.create.title',
      edit: i18n.entry('cms.permissions.edit.title', { name: '{name}' }),
    },
    name: {
      value: 'cms.permissions.form.name.value',
      placeholder: 'cms.permissions.form.name.placeholder',
    },
    slug: {
      value: 'cms.permissions.form.slug.value',
      placeholder: 'cms.permissions.form.slug.placeholder',
    },
    category: {
      value: 'cms.permissions.form.category.value',
      placeholder: 'cms.permissions.form.category.placeholder',
    },
    description: {
      value: 'cms.permissions.form.description.value',
      placeholder: 'cms.permissions.form.description.placeholder',
    },
    submit: 'cms.permissions.form.submit',
    actions: {
      list: 'cms.permissions.list.title',
    },
  })
}
