import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { showPageValidator, updatePageValidator, publishPageValidator } from '#validators/page'
import PageTransformer from '#transformers/page_transformer'
import router from '@adonisjs/core/services/router'
import { GetPageDetailAction } from '#actions/page/get_page_detail_action'
import { UpdatePageAction } from '#actions/page/update_page_action'
import { ChangePageStatusAction } from '#actions/page/change_page_status_action'
import { GetAvailablePagesForLinkAction } from '#actions/page/get_available_pages_for_link_action'
import { I18nService } from '#services/i18n_service'

@inject()
export default class PagesUpdateController {
  constructor(
    protected i18n: I18nService,
    protected getPageDetailAction: GetPageDetailAction,
    protected updatePageAction: UpdatePageAction,
    protected changePageStatusAction: ChangePageStatusAction,
    protected getAvailablePagesForLinkAction: GetAvailablePagesForLinkAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, params } = ctx

    const allRoutes = router.toJSON().root
    const availableRoutes = allRoutes
      .filter((r) => {
        if (!r.methods.includes('GET')) return false
        if (!r.name) return false
        const isExcluded =
          r.name.startsWith('admin.') ||
          r.name.startsWith('api.') ||
          r.name.startsWith('auth.') ||
          r.name.startsWith('pages.show') ||
          r.name.startsWith('settings.')

        return !isExcluded
      })
      .map((r) => ({
        name: r.name,
        pattern: r.pattern,
        params: r.pattern.match(/:(\w+)/g)?.map((p) => p.replace(':', '')) || [],
      }))

    const availablePostRoutes = allRoutes
      .filter((r) => {
        if (!r.methods.includes('POST')) return false
        if (!r.name) return false
        const isExcluded =
          r.name.startsWith('admin.') ||
          r.name.startsWith('api.') ||
          r.name.startsWith('auth.') ||
          r.name.startsWith('subscribe') ||
          r.name.startsWith('unsubscribe') ||
          r.name.startsWith('pages.show') ||
          r.name.startsWith('settings.')

        return !isExcluded
      })
      .map((r) => ({
        name: r.name,
        pattern: r.pattern,
        params: r.pattern.match(/:(\w+)/g)?.map((p) => p.replace(':', '')) || [],
      }))

    const availablePages = await this.getAvailablePagesForLinkAction.execute()

    const { id } = await showPageValidator.validate(params)
    const page = await this.getPageDetailAction.execute({ id })

    return inertia.render('page/cms/edit', {
      page: PageTransformer.transform(page),
      availableRoutes,
      availablePages,
      availablePostRoutes,
    })
  }

  async execute(ctx: HttpContext) {
    const { params, request, response, auth, session } = ctx

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

    session.flash('success', this.i18n.translate('page.saved'))

    return response.redirect().back()
  }

  async publish(ctx: HttpContext) {
    const { params, request, response, session } = ctx

    const { id } = await showPageValidator.validate(params)
    const { locale } = await publishPageValidator.validate(request.all())

    await this.changePageStatusAction.execute({ pageId: id, locale, status: 'published' })

    session.flash('success', this.i18n.translate('page.published'))

    return response.redirect().back()
  }

  async unpublish(ctx: HttpContext) {
    const { params, request, response, session } = ctx

    const { id } = await showPageValidator.validate(params)
    const { locale } = await publishPageValidator.validate(request.all())

    await this.changePageStatusAction.execute({ pageId: id, locale, status: 'draft' })

    session.flash('success', this.i18n.translate('page.unpublished'))

    return response.redirect().back()
  }
}
