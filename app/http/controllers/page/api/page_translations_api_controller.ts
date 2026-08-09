import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { showPageValidator, createTranslationValidator } from '#cms/validators/page'
import { CreateTranslationAction } from '#cms/domain/actions/page/create_translation_action'
import PageTransformer from '#transformers/page/page_transformer'
import { GetPageDetailAction } from '#cms/domain/actions/page/get_page_detail_action'

/**
 * POST /api/v1/admin/pages/:id/translations — create a page translation from the admin REST API.
 */
@inject()
export default class PageTranslationsApiController {
  constructor(
    protected createTranslationAction: CreateTranslationAction,
    protected getPageDetailAction: GetPageDetailAction
  ) {}

  async store(ctx: HttpContext) {
    const { params, request, response, serialize } = ctx

    const { id } = await showPageValidator.validate(params)
    const payload = await createTranslationValidator.validate(request.all())

    await this.createTranslationAction.execute({
      pageId: id,
      locale: payload.locale,
      slug: payload.slug,
      title: payload.title,
    })

    const page = await this.getPageDetailAction.execute({ id })

    const serialized = await serialize(PageTransformer.transform(page))

    return response.created(serialized)
  }
}
