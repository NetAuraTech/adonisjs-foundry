import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { showPageValidator } from '#cms/validators/page'
import PageTransformer from '#transformers/page/page_transformer'
import { GetPageDetailAction } from '#cms/domain/actions/page/get_page_detail_action'

/**
 * GET /api/v1/admin/pages/:id — show a page from the admin REST API.
 */
@inject()
export default class PagesShowApiController {
  constructor(protected getPageDetailAction: GetPageDetailAction) {}

  async show(ctx: HttpContext) {
    const { params, serialize } = ctx

    const { id } = await showPageValidator.validate(params)

    const page = await this.getPageDetailAction.execute({ id })

    return serialize(PageTransformer.transform(page))
  }
}
