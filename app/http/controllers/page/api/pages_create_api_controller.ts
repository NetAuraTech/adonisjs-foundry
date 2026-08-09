import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { createPageValidator } from '#cms/validators/page'
import { CreatePageAction } from '#cms/domain/actions/page/create_page_action'
import PageTransformer from '#transformers/page/page_transformer'

/**
 * POST /api/v1/admin/pages — create a page from the admin REST API.
 */
@inject()
export default class PagesCreateApiController {
  constructor(protected createPageAction: CreatePageAction) {}

  async store(ctx: HttpContext) {
    const { request, response, auth, serialize } = ctx

    const data = await createPageValidator.validate(request.all())
    const user = auth.getUserOrFail()

    const page = await this.createPageAction.execute({
      defaultLocale: data.locale,
      metaImageId: data.metaImageId,
      translation: {
        locale: data.locale,
        slug: data.slug,
        title: data.title,
        content: data.content,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      },
      userId: user.id,
    })

    const serialized = await serialize(PageTransformer.transform(page))

    return response.created(serialized)
  }
}
