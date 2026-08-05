import type { I18nService } from '#services/i18n_service'

export function buildLogsListPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'cms.logs.list.title',
    empty: 'cms.logs.list.empty',
    logged_on: 'cms.logs.list.logged_on',
    search: {
      value: 'cms.logs.search.value',
      placeholder: 'cms.logs.search.placeholder',
      filter: 'cms.logs.search.filter',
    },
    level: {
      value: 'cms.logs.level.value',
      placeholder: 'cms.logs.level.placeholder',
      debug: 'cms.logs.level.debug',
      info: 'cms.logs.level.info',
      warn: 'cms.logs.level.warn',
      error: 'cms.logs.level.error',
      fatal: 'cms.logs.level.fatal',
    },
    category: {
      value: 'cms.logs.category.value',
      placeholder: 'cms.logs.category.placeholder',
      system: 'cms.logs.category.system',
      security: 'cms.logs.category.security',
      business: 'cms.logs.category.business',
      auth: 'cms.logs.category.auth',
      api: 'cms.logs.category.api',
      database: 'cms.logs.category.database',
      performance: 'cms.logs.category.performance',
    },
    date: {
      from: 'cms.logs.date.from',
      to: 'cms.logs.date.to',
    },
    context: {
      value: 'cms.logs.context.value',
      empty: 'cms.logs.context.empty',
      view: 'cms.logs.context.view',
    },
    columns: {
      level: 'cms.logs.columns.level',
      category: 'cms.logs.columns.category',
      message: 'cms.logs.columns.message',
      actor: 'cms.logs.columns.actor',
      date: 'cms.logs.columns.date',
    },
  })
}
