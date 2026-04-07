import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { PageService } from '#services/page/page_service'
import { listPageValidator, showPageValidator } from '#validators/page'
import { stripEmptyStrings } from '#helpers/core/strip_empty_strings'
import { extractPagination } from '#helpers/pagination/extract_pagination'
import PageTransformer from '#transformers/page_transformer'

@inject()
export default class PagesController {
  constructor(protected pageService: PageService) {}

  async render(ctx: HttpContext) {
    const { inertia, request } = ctx

    const pagination = await extractPagination(request)
    const data = stripEmptyStrings(request.all())
    const payload = await listPageValidator.validate(data)

    const pages = await this.pageService.list(payload, pagination)

    return inertia.render('page/cms/index', {
      pages: PageTransformer.paginate(pages.all(), pages.getMeta()),
      filters: payload,
    })
  }

  async destroy(ctx: HttpContext) {
    const { response, params, session, i18n } = ctx

    const payload = await showPageValidator.validate(params)

    await this.pageService.delete(payload.id)

    session.flash('success', i18n.t('page.deleted'))

    return response.redirect().toRoute('admin.pages.render')
  }
}
