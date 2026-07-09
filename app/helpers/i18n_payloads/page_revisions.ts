import type { I18nService } from '#services/i18n_service'

export function buildPageRevisionsPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'cms.pages.show.revision.value',
    help: 'cms.pages.show.revision.help',
    index: 'cms.pages.show.revision.index',
    created: {
      at: 'cms.pages.show.revision.created.at',
      by: 'cms.pages.show.revision.created.by',
    },
    empty: {
      value: 'cms.pages.show.revision.empty.value',
      help: 'cms.pages.show.revision.empty.help',
    },
    latest: 'cms.pages.show.revision.latest',
    actions: {
      value: 'cms.pages.actions',
      back: 'cms.pages.show.revision.back',
      restore: {
        value: 'cms.pages.show.revision.restore.value',
        confirm: 'cms.pages.show.revision.restore.confirm',
      },
      unpin: 'cms.pages.show.revision.unpin',
      pin: 'cms.pages.show.revision.pin',
    },
  })
}
