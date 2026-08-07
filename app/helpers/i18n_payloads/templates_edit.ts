import type { I18nService } from '#services/i18n_service'

/**
 * Translation payload for the admin Template metadata edit page.
 */
export function buildTemplatesEditPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: i18n.entry('admin.templates.edit.title', { name: '{name}' }),
    back: 'admin.templates.edit.back',
    form: {
      name: 'admin.templates.edit.form.name',
      description: 'admin.templates.edit.form.description',
      thumbnail: {
        value: 'admin.templates.edit.form.thumbnail.value',
        replace: 'admin.templates.edit.form.thumbnail.replace',
        remove: 'admin.templates.edit.form.thumbnail.remove',
        regenerate: 'admin.templates.edit.form.thumbnail.regenerate',
        regenerating: 'admin.templates.edit.form.thumbnail.regenerating',
        placeholder: 'admin.templates.edit.form.thumbnail.placeholder',
      },
      submit: 'admin.templates.edit.form.submit',
      cancel: 'admin.templates.edit.form.cancel',
    },
    preview: {
      value: 'admin.templates.edit.preview.value',
      empty: 'admin.templates.edit.preview.empty',
      block: 'admin.templates.edit.preview.block',
      page: 'admin.templates.edit.preview.page',
    },
  })
}
