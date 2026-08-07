import type { I18nService } from '#services/i18n_service'

export function buildTemplatesIndexPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'admin.templates.list.title',
    actions: {
      edit: i18n.entry('admin.templates.list.actions.edit', { name: '{name}' }),
      regenerate: i18n.entry('admin.templates.list.actions.regenerate', { name: '{name}' }),
    },
    create_guidance: {
      value: 'admin.templates.list.create_guidance.value',
      from_page: 'admin.templates.list.create_guidance.from_page',
    },
    empty: {
      value: 'admin.templates.list.empty.value',
      help: 'admin.templates.list.empty.help',
    },
    thumbnail: {
      placeholder: 'admin.templates.list.thumbnail.placeholder',
    },
    search: {
      value: 'admin.templates.search.value',
      placeholder: 'admin.templates.search.placeholder',
      type: {
        value: 'admin.templates.search.type.value',
        placeholder: 'admin.templates.search.type.placeholder',
        page: 'admin.templates.search.type.page',
        block: 'admin.templates.search.type.block',
      },
      filter: 'admin.templates.search.filter',
    },
    delete: {
      value: i18n.entry('admin.templates.delete.title', { name: '{name}' }),
      confirm: 'admin.templates.delete.confirm',
    },
  })
}
