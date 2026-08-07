import type { I18nService } from '#services/i18n_service'

export function buildPagesIndexPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'admin.pages.list.title',
    action: 'admin.pages.list.action',
    search: {
      value: 'admin.pages.search.value',
      placeholder: 'admin.pages.search.placeholder',
      filter: 'admin.pages.search.filter',
    },
    status: {
      all: 'admin.pages.status.all',
      draft: 'admin.pages.status.draft',
      published: 'admin.pages.status.published',
      archived: 'admin.pages.status.archived',
      value: 'admin.pages.status.value',
    },
    locale: {
      value: 'admin.pages.locale.value',
      all: 'admin.pages.locale.all',
    },
    page_title: 'admin.pages.form.title.value',
    slug: 'admin.pages.form.slug.value',
    empty: 'admin.pages.list.empty',
    value: 'admin.pages.value',
    value_one: 'admin.pages.value_one',
    actions: {
      value: 'admin.pages.actions',
      show: i18n.entry('admin.pages.show.title', { title: '{title}' }),
      edit: i18n.entry('admin.pages.edit.title', { title: '{title}' }),
      delete: {
        value: i18n.entry('admin.pages.delete.title', { title: '{title}' }),
        confirm: 'admin.pages.delete.confirm',
      },
    },
  })
}
