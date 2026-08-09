import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { showPageValidator } from '#cms/validators/page'
import { DeletePageAction } from '#cms/domain/actions/page/delete_page_action'

/**
 * DELETE /api/v1/admin/pages/:id — delete a page from the admin REST API.
 */
@inject()
export default class PagesDeleteApiController {
  constructor(protected deletePageAction: DeletePageAction) {}

  async destroy(ctx: HttpContext) {
    const { params, response } = ctx

    const { id } = await showPageValidator.validate(params)

    await this.deletePageAction.execute({ id })

    return response.noContent()
  }
}
