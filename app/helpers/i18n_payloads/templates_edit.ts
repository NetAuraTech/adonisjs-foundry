import type { I18nService } from '#services/i18n_service'

/**
 * Translation payload for the admin Template metadata edit page.
 */
export function buildTemplatesEditPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: i18n.entry('template.admin.edit.title', { name: '{name}' }),
    back: 'template.admin.edit.back',
    form: {
      name: 'template.admin.edit.form.name',
      description: 'template.admin.edit.form.description',
      thumbnail: {
        value: 'template.admin.edit.form.thumbnail.value',
        replace: 'template.admin.edit.form.thumbnail.replace',
        remove: 'template.admin.edit.form.thumbnail.remove',
        regenerate: 'template.admin.edit.form.thumbnail.regenerate',
        regenerating: 'template.admin.edit.form.thumbnail.regenerating',
        placeholder: 'template.admin.edit.form.thumbnail.placeholder',
      },
      submit: 'template.admin.edit.form.submit',
      cancel: 'template.admin.edit.form.cancel',
    },
    preview: {
      value: 'template.admin.edit.preview.value',
      empty: 'template.admin.edit.preview.empty',
      block: 'template.admin.edit.preview.block',
      page: 'template.admin.edit.preview.page',
    },
  })
}
