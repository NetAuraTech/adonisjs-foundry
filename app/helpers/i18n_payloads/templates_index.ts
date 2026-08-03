import type { I18nService } from '#services/i18n_service'

export function buildTemplatesIndexPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'cms.templates.list.title',
    action: 'cms.templates.list.action',
    actions: {
      edit: i18n.entry('cms.templates.list.actions.edit', { name: '{name}' }),
    },
    empty: {
      value: 'cms.templates.list.empty.value',
      help: 'cms.templates.list.empty.help',
    },
    search: {
      value: 'cms.templates.search.value',
      placeholder: 'cms.templates.search.placeholder',
      type: {
        value: 'cms.templates.search.type.value',
        placeholder: 'cms.templates.search.type.placeholder',
        page: 'cms.templates.search.type.page',
        block: 'cms.templates.search.type.block',
      },
      filter: 'cms.templates.search.filter',
    },
    delete: {
      value: i18n.entry('cms.templates.delete.title', { name: '{name}' }),
      confirm: 'cms.templates.delete.confirm',
    },
  })
}
