import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { showPageValidator } from '#validators/page'
import vine from '@vinejs/vine'
import { GetPageDetailAction } from '#actions/page/get_page_detail_action'
import { CreateTranslationAction } from '#actions/page/create_translation_action'

const createTranslationValidator = vine.compile(
  vine.object({
    locale: vine.string().trim().maxLength(10),
    slug: vine.string().trim(),
    title: vine.string().trim(),
  })
)

@inject()
export default class PageTranslationsController {
  constructor(
    protected getPageDetailAction: GetPageDetailAction,
    protected createTranslationAction: CreateTranslationAction
  ) {}

  async execute(ctx: HttpContext) {
    const { params, request, response, session, i18n } = ctx

    const { id } = await showPageValidator.validate(params)
    const payload = await createTranslationValidator.validate(request.all())

    await this.createTranslationAction.execute({
      pageId: id,
      locale: payload.locale,
      slug: payload.slug,
      title: payload.title,
    })

    session.flash('success', i18n.t('page.translation.created'))

    return response.redirect().back()
  }
}
