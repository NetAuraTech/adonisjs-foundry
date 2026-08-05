import type { I18nService } from '#services/i18n_service'

/**
 * Builds the resolved translation payload for the admin dashboard page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The dashboard `t` object with every UI string resolved.
 */
export function buildDashboardPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'cms.dashboard.title',
    cards: {
      users: 'cms.users.value',
      pages: 'cms.pages.value',
      translations: 'cms.dashboard.cards.translations',
      files: 'cms.files.value',
      templates: 'cms.templates.value',
      published_locales: 'cms.dashboard.cards.published_locales',
      folders: 'cms.dashboard.cards.folders',
      no_role: 'cms.dashboard.cards.no_role',
    },
    status: {
      draft: 'cms.pages.status.draft',
      published: 'cms.pages.status.published',
      archived: 'cms.pages.status.archived',
    },
    recent: {
      published_pages: 'cms.dashboard.recent.published_pages',
      uploads: 'cms.dashboard.recent.uploads',
      empty: 'cms.dashboard.recent.empty',
    },
    view_all: 'cms.dashboard.view_all',
  })
}
