import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { PageService } from '#services/page/page_service'
import { createPageValidator } from '#validators/page'

@inject()
export default class PagesCreateController {
  constructor(protected pageService: PageService) {}

  async render(ctx: HttpContext) {
    const { inertia } = ctx

    return inertia.render('page/cms/create', {})
  }

  async execute(ctx: HttpContext) {
    const { request, response, auth, session, i18n } = ctx

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
    }

    const page = await this.pageService.create(payload, user.id)

    session.flash('success', i18n.t('page.created'))

    return response.redirect().toRoute('admin.pages_update.render', { id: page.id })
  }
}
