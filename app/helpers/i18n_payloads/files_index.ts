import type { I18nService } from '#services/i18n_service'

export function buildFilesIndexPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'cms.files.list.title',
    action: {
      folders: 'cms.files.list.action.folders',
      upload: 'cms.files.list.action.upload',
    },
    name: 'cms.files.form.name.value',
    type: 'cms.files.form.type.value',
    size: 'cms.files.form.size.value',
    uploaded_at: 'cms.files.form.uploaded_at.value',
    upload: {
      value: 'cms.files.upload.submit',
      help: 'cms.files.upload.help',
      remove: 'cms.files.upload.remove',
      max_size: i18n.entry('cms.files.upload.max_size', { size: '{size}' }),
      try_again: 'cms.files.upload.try_again',
      error: {
        size: i18n.entry('cms.files.upload.error.size', { max: '{max}' }),
      },
    },
    actions: {
      value: 'cms.files.actions',
      show: 'cms.files.show.title',
      delete: {
        value: i18n.entry('cms.files.delete.title', { filename: '{filename}' }),
        confirm: 'cms.files.delete.confirm',
      },
    },
    folders: {
      all: 'cms.files.list.folders.all',
    },
    search: {
      filter: 'cms.files.search.filter',
      value: 'cms.files.search.value',
      placeholder: 'cms.files.search.placeholder',
      type: {
        value: 'cms.files.search.type.value',
        options: {
          placeholder: 'cms.files.search.type.options.placeholder',
          image: 'cms.files.search.type.options.image',
          video: 'cms.files.search.type.options.video',
          audio: 'cms.files.search.type.options.audio',
          pdf: 'cms.files.search.type.options.pdf',
        },
      },
    },
    alts: {
      title: 'cms.files.show.alts.title',
      add: 'cms.files.show.alts.add',
      edit: 'cms.files.show.alts.edit',
      empty: 'cms.files.show.alts.empty',
      close: 'cms.files.show.alts.close',
      delete: {
        value: 'cms.files.show.alts.delete.value',
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
