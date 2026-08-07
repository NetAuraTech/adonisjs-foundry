import type { I18nService } from '#services/i18n_service'

export function buildPagesIndexPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'page.admin.list.title',
    action: 'page.admin.list.action',
    search: {
      value: 'page.admin.search.value',
      placeholder: 'page.admin.search.placeholder',
      filter: 'page.admin.search.filter',
    },
    status: {
      all: 'page.admin.status.all',
      draft: 'page.admin.status.draft',
      published: 'page.admin.status.published',
      archived: 'page.admin.status.archived',
      value: 'page.admin.status.value',
    },
    locale: {
      value: 'page.admin.locale.value',
      all: 'page.admin.locale.all',
    },
    page_title: 'page.admin.form.title.value',
    slug: 'page.admin.form.slug.value',
    empty: 'page.admin.list.empty',
    value: 'page.admin.value',
    value_one: 'page.admin.value_one',
    actions: {
      value: 'page.admin.actions',
      show: i18n.entry('page.admin.show.title', { title: '{title}' }),
      edit: i18n.entry('page.admin.edit.title', { title: '{title}' }),
      delete: {
        value: i18n.entry('page.admin.delete.title', { title: '{title}' }),
        confirm: 'page.admin.delete.confirm',
      },
    },
  })
}
