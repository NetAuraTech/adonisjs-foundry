import type { BuildPayloadResult, I18nService } from '#services/i18n_service'

/**
 * The flat i18n key mapping for the admin page revisions listing page.
 */
export const PAGE_REVISIONS_MAPPING = {
  title: 'page.admin.show.revision.value',
  help: 'page.admin.show.revision.help',
  index: 'page.admin.show.revision.index',
  created: {
    at: 'page.admin.show.revision.created.at',
    by: 'page.admin.show.revision.created.by',
  },
  empty: {
    value: 'page.admin.show.revision.empty.value',
    help: 'page.admin.show.revision.empty.help',
  },
  latest: 'page.admin.show.revision.latest',
  actions: {
    value: 'page.admin.actions',
    back: 'page.admin.show.revision.back',
    restore: {
      value: 'page.admin.show.revision.restore.value',
      confirm: 'page.admin.show.revision.restore.confirm',
    },
    unpin: 'page.admin.show.revision.unpin',
    pin: 'page.admin.show.revision.pin',
  },
}

/**
 * Shape of the resolved translation payload for the admin page revisions page.
 */
export type AdminPagesRevisionTranslations = BuildPayloadResult<typeof PAGE_REVISIONS_MAPPING>

/**
 * Builds the resolved translation payload for the admin page revisions page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The page revisions `t` object with every UI string resolved.
 */
export function buildPageRevisionsPayload(i18n: I18nService): AdminPagesRevisionTranslations {
  return i18n.buildPayload(PAGE_REVISIONS_MAPPING)
}
