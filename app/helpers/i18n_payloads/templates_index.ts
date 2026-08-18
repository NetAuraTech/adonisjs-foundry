import type { BuildPayloadResult, I18nService } from '#services/i18n_service'
import { createI18nEntry } from '#services/i18n_service'

/**
 * The flat i18n key mapping for the admin templates listing page.
 */
export const TEMPLATES_INDEX_MAPPING = {
  title: 'template.admin.list.title',
  actions: {
    edit: createI18nEntry('template.admin.list.actions.edit', { name: '{name}' }),
    regenerate: createI18nEntry('template.admin.list.actions.regenerate', { name: '{name}' }),
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
    value: createI18nEntry('template.admin.delete.title', { name: '{name}' }),
    confirm: 'template.admin.delete.confirm',
  },
}

/**
 * Shape of the resolved translation payload for the templates listing page.
 */
export type AdminTemplatesTranslations = BuildPayloadResult<typeof TEMPLATES_INDEX_MAPPING>

/**
 * Builds the translation payload for the admin templates listing page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The templates listing `t` object with every UI string resolved.
 */
export function buildTemplatesIndexPayload(i18n: I18nService): AdminTemplatesTranslations {
  return i18n.buildPayload(TEMPLATES_INDEX_MAPPING)
}
