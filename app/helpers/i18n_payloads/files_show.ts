import type { I18nService } from '#services/i18n_service'

export function buildFilesShowPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: i18n.entry('cms.files.show.title', { name: '{name}' }),
    actions: {
      back: 'cms.files.list.title',
      delete: {
        value: i18n.entry('cms.files.delete.title', { name: '{name}' }),
        confirm: 'cms.files.delete.confirm',
      },
    },
    info: {
      name: 'cms.files.show.info.name',
      type: 'cms.files.show.info.type',
      size: 'cms.files.show.info.size',
      uploaded_at: 'cms.files.show.info.uploaded_at',
      value: 'cms.files.show.info.value',
    },
    alts: {
      value: 'cms.files.show.alts.value',
      add: 'cms.files.show.alts.add',
      delete: {
        confirm: 'cms.files.show.alts.delete.confirm',
      },
      form: {
        update: 'cms.files.show.alts.form.update',
        submit: 'cms.files.show.alts.form.submit',
        cancel: 'cms.files.show.alts.form.cancel',
        locale: {
          value: 'cms.files.show.alts.form.locale.value',
        },
        key: {
          value: 'cms.files.show.alts.form.key.value',
          placeholder: 'cms.files.show.alts.form.key.placeholder',
        },
        alt_text: {
          value: 'cms.files.show.alts.form.alt_text.value',
          placeholder: 'cms.files.show.alts.form.alt_text.placeholder',
        },
      },
    },
  })
}
