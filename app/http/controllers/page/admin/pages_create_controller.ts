import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { createPageValidator } from '#validators/page'
import { CreatePageAction } from '#actions/page/create_page_action'
import { I18nService } from '#services/i18n_service'
import { buildPagesCreatePayload } from '#helpers/i18n_payloads/pages_create'

@inject()
export default class PagesCreateController {
  constructor(
    protected i18n: I18nService,
    protected createPageAction: CreatePageAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia } = ctx

    return inertia.render('page/admin/create', {
      translations: buildPagesCreatePayload(this.i18n),
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, auth, session } = ctx

    const data = await createPageValidator.validate(request.all())
    const user = auth.getUserOrFail()

    const payload = {
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
    }

    const page = await this.createPageAction.execute(payload)

    session.flash('success', this.i18n.translate('page.created'))

    return response.redirect().toRoute('admin.pages_update.render', { id: page.id })
  }
}
