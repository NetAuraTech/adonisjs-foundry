import type { I18nService } from '#services/i18n_service'

export function buildPagesShowPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: i18n.entry('cms.pages.show.title', { title: '{title}' }),
    translation: i18n.entry('cms.pages.show.translation', { count: '{count}' }),
    actions: {
      back: 'cms.pages.list.title',
      edit: i18n.entry('cms.pages.edit.title', { title: '{title}' }),
      show: i18n.entry('cms.pages.show.title', { title: '{title}' }),
      delete: {
        confirm: i18n.entry('cms.pages.delete.title', { title: '{title}' }),
        value: i18n.entry('cms.pages.delete.title', { title: '{title}' }),
      },
    },
    status: {
      draft: 'cms.pages.status.draft',
      published: 'cms.pages.status.published',
      archived: 'cms.pages.status.archived',
    },
    meta: {
      value: 'cms.pages.show.meta.value',
      title: 'cms.pages.show.meta.title',
      id: 'cms.pages.show.meta.id',
      locale: 'cms.pages.show.meta.locale',
      translations: 'cms.pages.show.meta.translations',
      created: 'cms.pages.show.meta.created',
      updated: 'cms.pages.show.meta.updated',
    },
    revision: {
      value: 'cms.pages.show.revision.value',
      view: 'cms.pages.show.revision.view',
    },
    homepage: {
      value: 'cms.pages.show.homepage.value',
      confirm: 'cms.pages.show.homepage.confirm',
      submit: 'cms.pages.show.homepage.submit',
      help: {
        title: {
          not_set: 'cms.pages.show.homepage.help.title.not_set',
          set: 'cms.pages.show.homepage.help.title.set',
        },
        message: {
          not_set: 'cms.pages.show.homepage.help.message.not_set',
          set: 'cms.pages.show.homepage.help.message.set',
        },
      },
    },
    last_update: 'cms.pages.show.last_update',
    default: 'cms.pages.show.default',
  })
}
