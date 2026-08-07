import type { I18nService } from '#services/i18n_service'

export function buildPagesShowPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: i18n.entry('page.admin.show.title', { title: '{title}' }),
    translation: i18n.entry('page.admin.show.translation', { count: '{count}' }),
    actions: {
      back: 'page.admin.list.title',
      edit: i18n.entry('page.admin.edit.title', { title: '{title}' }),
      show: i18n.entry('page.admin.show.title', { title: '{title}' }),
      delete: {
        confirm: i18n.entry('page.admin.delete.title', { title: '{title}' }),
        value: i18n.entry('page.admin.delete.title', { title: '{title}' }),
      },
    },
    status: {
      draft: 'page.admin.status.draft',
      published: 'page.admin.status.published',
      archived: 'page.admin.status.archived',
    },
    meta: {
      value: 'page.admin.show.meta.value',
      title: 'page.admin.show.meta.title',
      id: 'page.admin.show.meta.id',
      locale: 'page.admin.show.meta.locale',
      translations: 'page.admin.show.meta.translations',
      created: 'page.admin.show.meta.created',
      updated: 'page.admin.show.meta.updated',
    },
    revision: {
      value: 'page.admin.show.revision.value',
      view: 'page.admin.show.revision.view',
    },
    homepage: {
      value: 'page.admin.show.homepage.value',
      confirm: 'page.admin.show.homepage.confirm',
      submit: 'page.admin.show.homepage.submit',
      help: {
        title: {
          not_set: 'page.admin.show.homepage.help.title.not_set',
          set: 'page.admin.show.homepage.help.title.set',
        },
        message: {
          not_set: 'page.admin.show.homepage.help.message.not_set',
          set: 'page.admin.show.homepage.help.message.set',
        },
      },
    },
    last_update: 'page.admin.show.last_update',
    default: 'page.admin.show.default',
  })
}
