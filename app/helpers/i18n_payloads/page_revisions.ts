import type { I18nService } from '#services/i18n_service'

export function buildPageRevisionsPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'admin.pages.show.revision.value',
    help: 'admin.pages.show.revision.help',
    index: 'admin.pages.show.revision.index',
    created: {
      at: 'admin.pages.show.revision.created.at',
      by: 'admin.pages.show.revision.created.by',
    },
    empty: {
      value: 'admin.pages.show.revision.empty.value',
      help: 'admin.pages.show.revision.empty.help',
    },
    latest: 'admin.pages.show.revision.latest',
    actions: {
      value: 'admin.pages.actions',
      back: 'admin.pages.show.revision.back',
      restore: {
        value: 'admin.pages.show.revision.restore.value',
        confirm: 'admin.pages.show.revision.restore.confirm',
      },
      unpin: 'admin.pages.show.revision.unpin',
      pin: 'admin.pages.show.revision.pin',
    },
  })
}
