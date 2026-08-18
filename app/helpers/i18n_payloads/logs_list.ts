import type { BuildPayloadResult, I18nService } from '#services/i18n_service'

/**
 * The flat i18n key mapping for the admin logs listing page.
 */
export const LOGS_MAPPING = {
  title: 'admin.logs.list.title',
  empty: 'admin.logs.list.empty',
  logged_on: 'admin.logs.list.logged_on',
  search: {
    value: 'admin.logs.search.value',
    placeholder: 'admin.logs.search.placeholder',
    filter: 'admin.logs.search.filter',
  },
  level: {
    value: 'admin.logs.level.value',
    placeholder: 'admin.logs.level.placeholder',
    debug: 'admin.logs.level.debug',
    info: 'admin.logs.level.info',
    warn: 'admin.logs.level.warn',
    error: 'admin.logs.level.error',
    fatal: 'admin.logs.level.fatal',
  },
  category: {
    value: 'admin.logs.category.value',
    placeholder: 'admin.logs.category.placeholder',
    system: 'admin.logs.category.system',
    security: 'admin.logs.category.security',
    business: 'admin.logs.category.business',
    auth: 'admin.logs.category.auth',
    api: 'admin.logs.category.api',
    database: 'admin.logs.category.database',
    performance: 'admin.logs.category.performance',
  },
  date: {
    from: 'admin.logs.date.from',
    to: 'admin.logs.date.to',
  },
  context: {
    value: 'admin.logs.context.value',
    empty: 'admin.logs.context.empty',
    view: 'admin.logs.context.view',
  },
  columns: {
    level: 'admin.logs.columns.level',
    category: 'admin.logs.columns.category',
    message: 'admin.logs.columns.message',
    actor: 'admin.logs.columns.actor',
    date: 'admin.logs.columns.date',
  },
}

/**
 * Shape of the resolved translation payload for the admin logs listing page.
 */
export type AdminLogsIndexTranslations = BuildPayloadResult<typeof LOGS_MAPPING>

/**
 * Builds the resolved translation payload for the admin logs listing page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The logs listing `t` object with every UI string resolved.
 */
export function buildLogsListPayload(i18n: I18nService): AdminLogsIndexTranslations {
  return i18n.buildPayload(LOGS_MAPPING)
}
