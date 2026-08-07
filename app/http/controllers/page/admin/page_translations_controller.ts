import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { showPageValidator } from '#cms/validators/page'
import vine from '@vinejs/vine'
import { CreateTranslationAction } from '#cms/domain/actions/page/create_translation_action'
import { I18nService } from '#services/i18n_service'

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
    protected i18n: I18nService,
    protected createTranslationAction: CreateTranslationAction
  ) {}

  async execute(ctx: HttpContext) {
    const { params, request, response, session } = ctx

    const { id } = await showPageValidator.validate(params)
    const payload = await createTranslationValidator.validate(request.all())

    await this.createTranslationAction.execute({
      pageId: id,
      locale: payload.locale,
      slug: payload.slug,
      title: payload.title,
    })

    session.flash('success', this.i18n.translate('page.translation.created'))

    return response.redirect().back()
  }
}
