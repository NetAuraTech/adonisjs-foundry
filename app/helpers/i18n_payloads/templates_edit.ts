import type { I18nService } from '#services/i18n_service'

/**
 * Translation payload for the admin Template metadata edit page.
 */
export function buildTemplatesEditPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: i18n.entry('cms.templates.edit.title', { name: '{name}' }),
    back: 'cms.templates.edit.back',
    form: {
      name: 'cms.templates.edit.form.name',
      description: 'cms.templates.edit.form.description',
      thumbnail: {
        value: 'cms.templates.edit.form.thumbnail.value',
        replace: 'cms.templates.edit.form.thumbnail.replace',
        remove: 'cms.templates.edit.form.thumbnail.remove',
        regenerate: 'cms.templates.edit.form.thumbnail.regenerate',
        regenerating: 'cms.templates.edit.form.thumbnail.regenerating',
        placeholder: 'cms.templates.edit.form.thumbnail.placeholder',
      },
      submit: 'cms.templates.edit.form.submit',
      cancel: 'cms.templates.edit.form.cancel',
    },
    preview: {
      value: 'cms.templates.edit.preview.value',
      empty: 'cms.templates.edit.preview.empty',
      block: 'cms.templates.edit.preview.block',
      page: 'cms.templates.edit.preview.page',
    },
  })
}
