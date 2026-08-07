import type { I18nService } from '#services/i18n_service'

export function buildTemplatesIndexPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'template.admin.list.title',
    actions: {
      edit: i18n.entry('template.admin.list.actions.edit', { name: '{name}' }),
      regenerate: i18n.entry('template.admin.list.actions.regenerate', { name: '{name}' }),
    },
    create_guidance: {
      value: 'template.admin.list.create_guidance.value',
      from_page: 'template.admin.list.create_guidance.from_page',
    },
    empty: {
      value: 'template.admin.list.empty.value',
      help: 'template.admin.list.empty.help',
    },
    thumbnail: {
      placeholder: 'template.admin.list.thumbnail.placeholder',
    },
    search: {
      value: 'template.admin.search.value',
      placeholder: 'template.admin.search.placeholder',
      type: {
        value: 'template.admin.search.type.value',
        placeholder: 'template.admin.search.type.placeholder',
        page: 'template.admin.search.type.page',
        block: 'template.admin.search.type.block',
      },
      filter: 'template.admin.search.filter',
    },
    delete: {
      value: i18n.entry('template.admin.delete.title', { name: '{name}' }),
      confirm: 'template.admin.delete.confirm',
    },
  })
}
