import type { I18nService } from '#services/i18n_service'

export function buildPagesShowPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: i18n.entry('admin.pages.show.title', { title: '{title}' }),
    translation: i18n.entry('admin.pages.show.translation', { count: '{count}' }),
    actions: {
      back: 'admin.pages.list.title',
      edit: i18n.entry('admin.pages.edit.title', { title: '{title}' }),
      show: i18n.entry('admin.pages.show.title', { title: '{title}' }),
      delete: {
        confirm: i18n.entry('admin.pages.delete.title', { title: '{title}' }),
        value: i18n.entry('admin.pages.delete.title', { title: '{title}' }),
      },
    },
    status: {
      draft: 'admin.pages.status.draft',
      published: 'admin.pages.status.published',
      archived: 'admin.pages.status.archived',
    },
    meta: {
      value: 'admin.pages.show.meta.value',
      title: 'admin.pages.show.meta.title',
      id: 'admin.pages.show.meta.id',
      locale: 'admin.pages.show.meta.locale',
      translations: 'admin.pages.show.meta.translations',
      created: 'admin.pages.show.meta.created',
      updated: 'admin.pages.show.meta.updated',
    },
    revision: {
      value: 'admin.pages.show.revision.value',
      view: 'admin.pages.show.revision.view',
    },
    homepage: {
      value: 'admin.pages.show.homepage.value',
      confirm: 'admin.pages.show.homepage.confirm',
      submit: 'admin.pages.show.homepage.submit',
      help: {
        title: {
          not_set: 'admin.pages.show.homepage.help.title.not_set',
          set: 'admin.pages.show.homepage.help.title.set',
        },
        message: {
          not_set: 'admin.pages.show.homepage.help.message.not_set',
          set: 'admin.pages.show.homepage.help.message.set',
        },
      },
    },
    last_update: 'admin.pages.show.last_update',
    default: 'admin.pages.show.default',
  })
}
