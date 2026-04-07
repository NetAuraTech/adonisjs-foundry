import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { TemplateService } from '#services/template/template_service'
import {
  listTemplateValidator,
  createTemplateValidator,
  updateTemplateValidator,
  applyTemplateValidator,
  createFromPageValidator,
  showTemplateValidator,
} from '#validators/template'
import { stripEmptyStrings } from '#helpers/core/strip_empty_strings'
import TemplateTransformer from '#transformers/template_transformer'

@inject()
export default class TemplatesController {
  constructor(protected templateService: TemplateService) {}

  async render(ctx: HttpContext) {
    const { inertia, request } = ctx

    const data = stripEmptyStrings(request.all())
    const payload = await listTemplateValidator.validate(data)

    const templates = await this.templateService.list({
      type: payload.type,
      blockType: payload.block_type as any,
      search: payload.search,
    })

    return inertia.render('template/cms/index', {
      templates: TemplateTransformer.transform(templates),
      filters: payload,
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, auth, session, i18n } = ctx

    const payload = await createTemplateValidator.validate(request.all())
    const user = auth.getUserOrFail()

    await this.templateService.create(payload as any, user.id)

    session.flash('success', i18n.t('template.created'))

    return response.redirect().toRoute('admin.templates.render')
  }

  async update(ctx: HttpContext) {
    const { params, request, response, session, i18n } = ctx

    const { id } = await showTemplateValidator.validate(params)
    const payload = await updateTemplateValidator.validate(request.all())

    await this.templateService.update(id, payload)

    session.flash('success', i18n.t('template.updated'))

    return response.redirect().back()
  }

  async destroy(ctx: HttpContext) {
    const { params, response, session, i18n } = ctx

    const { id } = await showTemplateValidator.validate(params)

    await this.templateService.delete(id)

    session.flash('success', i18n.t('template.deleted'))

    return response.redirect().toRoute('admin.templates.render')
  }

  async applyToPage(ctx: HttpContext) {
    const { params, request, response, auth, session, i18n } = ctx

    const { id } = await showTemplateValidator.validate(params)
    const payload = await applyTemplateValidator.validate(request.all())
    const user = auth.getUserOrFail()

    await this.templateService.applyToPage(id, payload.pageId, payload.locale, user.id)

    session.flash('success', i18n.t('template.applied'))

    return response.redirect().back()
  }

  async createFromPage(ctx: HttpContext) {
    const { request, response, auth, session, i18n } = ctx

    const payload = await createFromPageValidator.validate(request.all())
    const user = auth.getUserOrFail()

    await this.templateService.createFromPage(payload.name, payload.pageId, payload.locale, user.id)

    session.flash('success', i18n.t('template.created_from_page', { name: payload.name }))

    return response.redirect().back()
  }
}
