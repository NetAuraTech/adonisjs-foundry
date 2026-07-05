import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { createPageValidator } from '#validators/page'
import { CreatePageAction } from '#actions/page/create_page_action'
import { I18nService } from '#services/i18n_service'

@inject()
export default class PagesCreateController {
  constructor(
    protected i18n: I18nService,
    protected createPageAction: CreatePageAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia } = ctx

    return inertia.render('page/cms/create', {
      translations: this.i18n.buildPayload({
        title: 'cms.pages.create.title',
        action: 'cms.pages.list.title',
        details: 'cms.pages.create.details.value',
        locale: 'cms.pages.form.locale.default',
        slug: 'cms.pages.form.slug.value',
        page_title: {
          value: 'cms.pages.form.title.value',
          placeholder: 'cms.pages.form.title.placeholder',
        },
        seo: {
          value: 'cms.pages.create.seo.value',
          help: this.i18n.entry('cms.pages.create.seo.help', { title: '{title}' }),
        },
        meta: {
          title: {
            value: 'cms.pages.form.meta.title.value',
            placeholder: 'cms.pages.form.meta.title.placeholder',
          },
          description: {
            value: 'cms.pages.form.meta.description.value',
            placeholder: 'cms.pages.form.meta.description.placeholder',
          },
        },
        submit: 'cms.pages.form.submit',
      }),
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
