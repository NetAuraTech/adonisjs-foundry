import { createI18nEntry, type BuildPayloadResult, type I18nService } from '#services/i18n_service'

/**
 * The flat i18n key mapping for the admin page detail page.
 */
export const PAGES_SHOW_MAPPING = {
  title: createI18nEntry('page.admin.show.title', { title: '{title}' }),
  translation: createI18nEntry('page.admin.show.translation', { count: '{count}' }),
  actions: {
    back: 'page.admin.list.title',
    edit: createI18nEntry('page.admin.edit.title', { title: '{title}' }),
    show: createI18nEntry('page.admin.show.title', { title: '{title}' }),
    delete: {
      confirm: createI18nEntry('page.admin.delete.title', { title: '{title}' }),
      value: createI18nEntry('page.admin.delete.title', { title: '{title}' }),
    },
  },
  status: {
    draft: 'page.admin.status.draft',
    published: 'page.admin.status.published',
    archived: 'page.admin.status.archived',
  },
  meta: {
    value: 'page.admin.show.meta.value',
    title: 'page.admin.show.meta.title',
    id: 'page.admin.show.meta.id',
    locale: 'page.admin.show.meta.locale',
    translations: 'page.admin.show.meta.translations',
    created: 'page.admin.show.meta.created',
    updated: 'page.admin.show.meta.updated',
  },
  revision: {
    value: 'page.admin.show.revision.value',
    view: 'page.admin.show.revision.view',
  },
  homepage: {
    value: 'page.admin.show.homepage.value',
    confirm: 'page.admin.show.homepage.confirm',
    submit: 'page.admin.show.homepage.submit',
    help: {
      title: {
        not_set: 'page.admin.show.homepage.help.title.not_set',
        set: 'page.admin.show.homepage.help.title.set',
      },
      message: {
        not_set: 'page.admin.show.homepage.help.message.not_set',
        set: 'page.admin.show.homepage.help.message.set',
      },
    },
  },
  last_update: 'page.admin.show.last_update',
  default: 'page.admin.show.default',
}

/**
 * Shape of the resolved translation payload for the admin page detail page.
 */
export type AdminPagesShowTranslations = BuildPayloadResult<typeof PAGES_SHOW_MAPPING>

/**
 * Builds the resolved translation payload for the admin page detail page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The page detail `t` object with every UI string resolved.
 */
export function buildPagesShowPayload(i18n: I18nService): AdminPagesShowTranslations {
  return i18n.buildPayload(PAGES_SHOW_MAPPING)
}
