import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import PageRevisionTransformer from '#transformers/page/page_revision_transformer'
import { extractPagination } from '#helpers/pagination/extract_pagination'
import { ListRevisionsAction } from '#cms/domain/actions/page/list_revisions_action'
import { RestoreRevisionAction } from '#cms/domain/actions/page/restore_revision_action'
import { ToggleRevisionKeepAction } from '#cms/domain/actions/page/toggle_revision_keep_action'

/**
 * GET  /api/v1/admin/pages/:id/translations/:translationId/revisions — list
 * POST /api/v1/admin/pages/:id/translations/:translationId/revisions/:revisionId/restore — restore
 * PUT  /api/v1/admin/pages/:id/translations/:translationId/revisions/:revisionId/pin — toggle keep
 */
@inject()
export default class PageRevisionsApiController {
  constructor(
    protected listRevisionsAction: ListRevisionsAction,
    protected restoreRevisionAction: RestoreRevisionAction,
    protected toggleRevisionKeepAction: ToggleRevisionKeepAction
  ) {}

  async index(ctx: HttpContext) {
    const { params, request, serialize } = ctx

    const pagination = await extractPagination(request)

    const revisions = await this.listRevisionsAction.execute({
      pageId: Number(params.id),
      pagination,
    })

    return serialize(PageRevisionTransformer.paginate(revisions.all(), revisions.getMeta()))
  }

  async restore(ctx: HttpContext) {
    const { params, auth, serialize } = ctx
    const user = auth.getUserOrFail()

    await this.restoreRevisionAction.execute({
      translationId: Number(params.translationId),
      revisionId: Number(params.revisionId),
      userId: user.id,
    })

    return serialize({ restored: true })
  }

  async toggle(ctx: HttpContext) {
    const { params, serialize } = ctx

    const result = await this.toggleRevisionKeepAction.execute({
      revisionId: Number(params.revisionId),
    })

    return serialize({ pinned: result })
  }
}
