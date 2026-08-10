import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { PreviewTokenHelper } from '#helpers/core/preview_token'
import env from '#start/env'

/**
 * GET /api/v1/admin/templates/preview/token — short-lived HMAC token for
 * the template preview (thumbnail capture).
 *
 * The template id is carried in the same "id" slot as the page preview
 * token, so no new signing surface is introduced.
 */
@inject()
export default class TemplatesPreviewTokenController {
  protected previewTokenHelper: PreviewTokenHelper

  constructor() {
    this.previewTokenHelper = new PreviewTokenHelper(env.get('APP_KEY').release())
  }

  async token(ctx: HttpContext) {
    const { request, response, auth } = ctx

    const user = auth.getUserOrFail()
    const id = Number(request.input('id'))
    const locale = String(request.input('locale', 'en'))

    if (!id || Number.isNaN(id)) {
      return response.badRequest({
        error: { code: 'E_INVALID_PARAMS', message: 'id is required' },
      })
    }

    const token = this.previewTokenHelper.generate(id, user.id, locale)
    return response.ok({ token })
  }
}
