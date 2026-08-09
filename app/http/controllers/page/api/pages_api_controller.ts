import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ListPagesAction } from '#cms/domain/actions/page/list_pages_action'
import { DeletePageAction } from '#cms/domain/actions/page/delete_page_action'
import { SetHomepageAction } from '#cms/domain/actions/page/set_homepage_action'
import { GetPageDetailAction } from '#cms/domain/actions/page/get_page_detail_action'
import { listPageValidator, showPageValidator } from '#cms/validators/page'
import PageTransformer from '#transformers/page/page_transformer'
import { stripEmptyStrings } from '#helpers/core/strip_empty_strings'
import { extractPagination } from '#helpers/pagination/extract_pagination'

/**
 * GET  /api/v1/admin/pages — list pages
 * PUT  /api/v1/admin/pages/:id/homepage — set homepage
 */
@inject()
export default class PagesApiController {
  constructor(
    protected listPagesAction: ListPagesAction,
    protected deletePageAction: DeletePageAction,
    protected setHomepageAction: SetHomepageAction,
    protected getPageDetailAction: GetPageDetailAction
  ) {}

  async index(ctx: HttpContext) {
    const { request, serialize } = ctx

    const pagination = await extractPagination(request)
    const data = stripEmptyStrings(request.all())
    const payload = await listPageValidator.validate(data)

    const pages = await this.listPagesAction.execute({
      status: payload.status,
      locale: payload.locale,
      search: payload.search,
      pagination,
    })

    return serialize(PageTransformer.paginate(pages.all(), pages.getMeta()))
  }

  async setHomepage(ctx: HttpContext) {
    const { params, auth, serialize } = ctx

    const { id } = await showPageValidator.validate(params)
    const user = auth.getUserOrFail()

    await this.setHomepageAction.execute({ pageId: id, userId: user.id })

    const page = await this.getPageDetailAction.execute({ id })

    return serialize(PageTransformer.transform(page))
  }
}
