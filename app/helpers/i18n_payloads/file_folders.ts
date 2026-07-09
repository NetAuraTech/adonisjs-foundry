import type { I18nService } from '#services/i18n_service'

export function buildFileFoldersPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'cms.folders.list.title',
    action: 'cms.files.list.title',
    browse: 'cms.folders.list.browse',
    help: 'cms.folders.form.help',
    name: {
      root: 'cms.folders.form.name.root',
      sub: 'cms.folders.form.name.sub',
    },
    empty: {
      value: 'cms.folders.list.empty.value',
      help: 'cms.folders.list.empty.help',
    },
    actions: {
      add: 'cms.folders.list.add',
      create: 'cms.folders.form.create',
      update: 'cms.folders.form.update',
      cancel: 'cms.folders.form.cancel',
      rename: 'cms.folders.list.rename',
      delete: {
        value: i18n.entry('cms.folders.delete.title', { folder: '{folder}' }),
        confirm: 'cms.folders.delete.confirm',
      },
    },
  })
}
