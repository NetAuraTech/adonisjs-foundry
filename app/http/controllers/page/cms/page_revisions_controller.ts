import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { revisionValidator } from '#validators/page'
import PageRevisionTransformer from '#transformers/page_revision_transformer'
import { extractPagination } from '#helpers/pagination/extract_pagination'
import { ListRevisionsAction } from '#actions/page/list_revisions_action'
import { RestoreRevisionAction } from '#actions/page/restore_revision_action'
import { ToggleRevisionKeepAction } from '#actions/page/toggle_revision_keep_action'
import { I18nService } from '#services/i18n_service'

@inject()
export default class PageRevisionsController {
  constructor(
    protected i18n: I18nService,
    protected listRevisionsAction: ListRevisionsAction,
    protected restoreRevisionAction: RestoreRevisionAction,
    protected toggleRevisionKeepAction: ToggleRevisionKeepAction
  ) {}

  async index(ctx: HttpContext) {
    const { inertia, params, request } = ctx

    const pagination = await extractPagination(request)
    const revisions = await this.listRevisionsAction.execute({
      pageId: Number(params.translationId),
      pagination,
    })

    return inertia.render('page/cms/revisions', {
      revisions: PageRevisionTransformer.transform(revisions.all()),
      translation_id: params.translationId,
      page_id: params.id,
      translations: this.i18n.buildPayload({
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
      }),
    })
  }

  async restore(ctx: HttpContext) {
    const { params, response, auth, session } = ctx

    const payload = await revisionValidator.validate(params)
    const user = auth.getUserOrFail()

    await this.restoreRevisionAction.execute({
      translationId: payload.translationId,
      revisionId: payload.revisionId,
      userId: user.id,
    })

    session.flash('success', this.i18n.translate('page.revision.restored'))

    return response.redirect().back()
  }

  async toggleKeep(ctx: HttpContext) {
    const { params, response, session } = ctx

    const payload = await revisionValidator.validate(params)

    await this.toggleRevisionKeepAction.execute({ revisionId: payload.revisionId })

    session.flash('success', this.i18n.translate('page.revision.keep_toggled'))

    return response.redirect().back()
  }
}
