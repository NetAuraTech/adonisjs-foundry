import type { I18nService } from '#services/i18n_service'

export function buildPagesIndexPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'cms.pages.list.title',
    action: 'cms.pages.list.action',
    search: {
      value: 'cms.pages.search.value',
      placeholder: 'cms.pages.search.placeholder',
      filter: 'cms.pages.search.filter',
    },
    status: {
      all: 'cms.pages.status.all',
      draft: 'cms.pages.status.draft',
      published: 'cms.pages.status.published',
      archived: 'cms.pages.status.archived',
      value: 'cms.pages.status.value',
    },
    locale: {
      value: 'cms.pages.locale.value',
      all: 'cms.pages.locale.all',
    },
    page_title: 'cms.pages.form.title.value',
    slug: 'cms.pages.form.slug.value',
    empty: 'cms.pages.list.empty',
    value: 'cms.pages.value',
    value_one: 'cms.pages.value_one',
    actions: {
      value: 'cms.pages.actions',
      show: i18n.entry('cms.pages.show.title', { title: '{title}' }),
      edit: i18n.entry('cms.pages.edit.title', { title: '{title}' }),
      delete: {
        value: i18n.entry('cms.pages.delete.title', { title: '{title}' }),
        confirm: 'cms.pages.delete.confirm',
      },
    },
  })
}
