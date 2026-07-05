import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { listPageValidator, showPageValidator } from '#validators/page'
import { stripEmptyStrings } from '#helpers/core/strip_empty_strings'
import { extractPagination } from '#helpers/pagination/extract_pagination'
import PageTransformer from '#transformers/page_transformer'
import { ListPagesAction } from '#actions/page/list_pages_action'
import { DeletePageAction } from '#actions/page/delete_page_action'
import { SetHomepageAction } from '#actions/page/set_homepage_action'
import { I18nService } from '#services/i18n_service'

@inject()
export default class PagesController {
  constructor(
    protected i18n: I18nService,
    protected listPagesAction: ListPagesAction,
    protected deletePageAction: DeletePageAction,
    protected setHomepageAction: SetHomepageAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, request } = ctx

    const pagination = await extractPagination(request)
    const data = stripEmptyStrings(request.all())
    const payload = await listPageValidator.validate(data)

    const pages = await this.listPagesAction.execute({
      status: payload.status,
      locale: payload.locale,
      search: payload.search,
      pagination,
    })

    return inertia.render('page/cms/index', {
      pages: PageTransformer.paginate(pages.all(), pages.getMeta()),
      filters: payload,
      translations: this.i18n.buildPayload({
        title: 'cms.pages.list.title',
        action: 'cms.pages.list.action',
        search: {
          value: 'cms.pages.search.value',
          placeholder: 'cms.pages.search.placeholder',
          filter: 'cms.pages.search.filter',
        },
        status: {
          all: 'cms.pages.status.all',
          draft: 'cms.pages.status.draft',
          published: 'cms.pages.status.published',
          archived: 'cms.pages.status.archived',
          value: 'cms.pages.status.value',
        },
        locale: {
          value: 'cms.pages.locale.value',
          all: 'cms.pages.locale.all',
        },
        page_title: 'cms.pages.form.title.value',
        slug: 'cms.pages.form.slug.value',
        empty: 'cms.pages.list.empty',
        value: 'cms.pages.value',
        value_one: 'cms.pages.value_one',
        actions: {
          value: 'cms.pages.actions',
          show: this.i18n.entry('cms.pages.show.title', { title: '{title}' }),
          edit: this.i18n.entry('cms.pages.edit.title', { title: '{title}' }),
          delete: {
            value: this.i18n.entry('cms.pages.delete.title', { title: '{title}' }),
            confirm: 'cms.pages.delete.confirm',
          },
        },
      }),
    })
  }

  async destroy(ctx: HttpContext) {
    const { response, params, session } = ctx

    const payload = await showPageValidator.validate(params)

    await this.deletePageAction.execute({ id: payload.id })

    session.flash('success', this.i18n.translate('page.deleted'))

    return response.redirect().toRoute('admin.pages.render')
  }

  async setHomepage(ctx: HttpContext) {
    const { params, response, auth } = ctx
    const user = auth.getUserOrFail()
    await this.setHomepageAction.execute({ pageId: Number(params.id), userId: user.id })
    return response.redirect().toRoute('admin.pages_show.render', { id: params.id })
  }
}
