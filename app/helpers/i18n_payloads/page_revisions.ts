import type { I18nService } from '#services/i18n_service'

export function buildPageRevisionsPayload(i18n: I18nService) {
  return i18n.buildPayload({
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
  })
}
