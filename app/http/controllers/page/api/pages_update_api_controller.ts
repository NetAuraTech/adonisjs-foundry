import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { showPageValidator, updatePageValidator, publishPageValidator } from '#cms/validators/page'
import PageTransformer from '#transformers/page/page_transformer'
import { UpdatePageAction } from '#cms/domain/actions/page/update_page_action'
import { ChangePageStatusAction } from '#cms/domain/actions/page/change_page_status_action'
import { GetPageDetailAction } from '#cms/domain/actions/page/get_page_detail_action'

/**
 * PUT  /api/v1/admin/pages/:id — update a page
 * PUT  /api/v1/admin/pages/:id/publish — publish a page translation
 * PUT  /api/v1/admin/pages/:id/unpublish — unpublish a page translation
 */
@inject()
export default class PagesUpdateApiController {
  constructor(
    protected updatePageAction: UpdatePageAction,
    protected changePageStatusAction: ChangePageStatusAction,
    protected getPageDetailAction: GetPageDetailAction
  ) {}

  async update(ctx: HttpContext) {
    const { params, request, auth, serialize } = ctx
    const { id } = await showPageValidator.validate(params)
    const payload = await updatePageValidator.validate(request.all())
    const user = auth.getUserOrFail()
    const { locale, ...data } = payload
    await this.updatePageAction.execute({
      pageId: id,
      locale,
      slug: data.slug,
      title: data.title,
      content: data.content,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaImageId: data.metaImageId,
      userId: user.id,
    })
    const page = await this.getPageDetailAction.execute({ id })
    return serialize(PageTransformer.transform(page))
  }

  async publish(ctx: HttpContext) {
    const { params, request, auth, serialize } = ctx
    const { id } = await showPageValidator.validate(params)
    const { locale } = await publishPageValidator.validate(request.all())
    await this.changePageStatusAction.execute({
      pageId: id,
      locale,
      status: 'published',
      userId: auth.user?.id,
    })
    const page = await this.getPageDetailAction.execute({ id })
    return serialize(PageTransformer.transform(page))
  }

  async unpublish(ctx: HttpContext) {
    const { params, request, auth, serialize } = ctx
    const { id } = await showPageValidator.validate(params)
    const { locale } = await publishPageValidator.validate(request.all())
    await this.changePageStatusAction.execute({
      pageId: id,
      locale,
      status: 'draft',
      userId: auth.user?.id,
    })
    const page = await this.getPageDetailAction.execute({ id })
    return serialize(PageTransformer.transform(page))
  }
}
