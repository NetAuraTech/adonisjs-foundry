import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { revisionValidator } from '#validators/page'
import PageRevisionTransformer from '#transformers/page_revision_transformer'
import { extractPagination } from '#helpers/pagination/extract_pagination'
import { ListRevisionsAction } from '#actions/page/list_revisions_action'
import { RestoreRevisionAction } from '#actions/page/restore_revision_action'
import { ToggleRevisionKeepAction } from '#actions/page/toggle_revision_keep_action'

@inject()
export default class PageRevisionsController {
  constructor(
    protected listRevisionsAction: ListRevisionsAction,
    protected restoreRevisionAction: RestoreRevisionAction,
    protected toggleRevisionKeepAction: ToggleRevisionKeepAction
  ) {}

  async index(ctx: HttpContext) {
    const { inertia, params, request, i18n } = ctx

    const pagination = await extractPagination(request)
    const revisions = await this.listRevisionsAction.execute({
      pageId: Number(params.translationId),
      pagination,
    })

    return inertia.render('page/cms/revisions', {
      revisions: PageRevisionTransformer.transform(revisions.all()),
      translation_id: params.translationId,
      page_id: params.id,
      translations: {
        title: i18n.t('cms.pages.show.revision.value'),
        actions: {
          value: i18n.t('cms.pages.actions'),
          back: i18n.t('cms.pages.show.revision.back'),
          restore: {
            value: i18n.t('cms.pages.show.revision.restore.value'),
            confirm: i18n.t('cms.pages.show.revision.restore.confirm'),
          },
          unpin: i18n.t('cms.pages.show.revision.unpin'),
          pin: i18n.t('cms.pages.show.revision.pin'),
        },
      },
    })
  }

  async restore(ctx: HttpContext) {
    const { params, response, auth, session, i18n } = ctx

    const payload = await revisionValidator.validate(params)
    const user = auth.getUserOrFail()

    await this.restoreRevisionAction.execute({
      translationId: payload.translationId,
      revisionId: payload.revisionId,
      userId: user.id,
    })

    session.flash('success', i18n.t('page.revision.restored'))

    return response.redirect().back()
  }

  async toggleKeep(ctx: HttpContext) {
    const { params, response, session, i18n } = ctx

    const payload = await revisionValidator.validate(params)

    await this.toggleRevisionKeepAction.execute({ revisionId: payload.revisionId })

    session.flash('success', i18n.t('page.revision.keep_toggled'))

    return response.redirect().back()
  }
}
