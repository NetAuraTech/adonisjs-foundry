import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { showPageValidator } from '#validators/page'
import PageTransformer from '#transformers/page_transformer'
import { GetPageDetailAction } from '#actions/page/get_page_detail_action'
import { I18nService } from '#services/i18n_service'
import { buildPagesShowPayload } from '#helpers/i18n_payloads/pages_show'

@inject()
export default class PagesShowController {
  constructor(
    protected i18n: I18nService,
    protected getPageDetailAction: GetPageDetailAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, params } = ctx

    const { id } = await showPageValidator.validate(params)
    const page = await this.getPageDetailAction.execute({ id })

    return inertia.render('page/cms/show', {
      page: PageTransformer.transform(page),
      translations: buildPagesShowPayload(this.i18n),
    })
  }
}
