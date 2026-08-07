import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import {
  listTemplateValidator,
  createTemplateValidator,
  updateTemplateValidator,
  applyTemplateValidator,
  showTemplateValidator,
} from '#validators/template'
import { stripEmptyStrings } from '#helpers/core/strip_empty_strings'
import TemplateTransformer from '#transformers/template_transformer'
import { ListTemplatesAction } from '#actions/template/list_templates_action'
import { CreateTemplateAction } from '#actions/template/create_template_action'
import { UpdateTemplateAction } from '#actions/template/update_template_action'
import { DeleteTemplateAction } from '#actions/template/delete_template_action'
import { ApplyToPageAction } from '#actions/template/apply_to_page_action'
import { GetTemplateDetailAction } from '#actions/template/get_template_detail_action'
import { I18nService } from '#services/i18n_service'
import { buildTemplatesIndexPayload } from '#helpers/i18n_payloads/templates_index'
import { buildTemplatesEditPayload } from '#helpers/i18n_payloads/templates_edit'

@inject()
export default class TemplatesController {
  constructor(
    protected i18n: I18nService,
    protected listTemplatesAction: ListTemplatesAction,
    protected createTemplateAction: CreateTemplateAction,
    protected updateTemplateAction: UpdateTemplateAction,
    protected deleteTemplateAction: DeleteTemplateAction,
    protected applyToPageAction: ApplyToPageAction,
    protected getTemplateDetailAction: GetTemplateDetailAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, request } = ctx

    const data = stripEmptyStrings(request.all())
    const payload = await listTemplateValidator.validate(data)

    const templates = await this.listTemplatesAction.execute({
      type: payload.type,
      blockType: payload.block_type as any,
      search: payload.search,
    })

    return inertia.render('template/admin/index', {
      templates: TemplateTransformer.transform(templates),
      filters: payload,
      translations: buildTemplatesIndexPayload(this.i18n),
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, auth, session } = ctx

    const payload = await createTemplateValidator.validate(request.all())
    const user = auth.getUserOrFail()

    await this.createTemplateAction.execute({ ...(payload as any), userId: user.id })

    session.flash('success', this.i18n.translate('template.created'))

    return response.redirect().toRoute('admin.templates.render')
  }

  async edit(ctx: HttpContext) {
    const { inertia, params } = ctx

    const { id } = await showTemplateValidator.validate(params)
    const template = await this.getTemplateDetailAction.execute({ id })

    return inertia.render('template/admin/edit', {
      template: TemplateTransformer.transform(template),
      translations: buildTemplatesEditPayload(this.i18n),
    })
  }

  async update(ctx: HttpContext) {
    const { params, request, response, session } = ctx

    const { id } = await showTemplateValidator.validate(params)
    const payload = await updateTemplateValidator.validate(request.all())

    await this.updateTemplateAction.execute({ id, ...payload })

    session.flash('success', this.i18n.translate('template.updated'))

    return response.redirect().back()
  }

  async destroy(ctx: HttpContext) {
    const { params, response, session } = ctx

    const { id } = await showTemplateValidator.validate(params)

    await this.deleteTemplateAction.execute({ id })

    session.flash('success', this.i18n.translate('template.deleted'))

    return response.redirect().toRoute('admin.templates.render')
  }

  async applyToPage(ctx: HttpContext) {
    const { params, request, response, auth, session } = ctx

    const { id } = await showTemplateValidator.validate(params)
    const payload = await applyTemplateValidator.validate(request.all())
    const user = auth.getUserOrFail()

    await this.applyToPageAction.execute({
      templateId: id,
      pageId: payload.pageId,
      locale: payload.locale,
      userId: user.id,
    })

    session.flash('success', this.i18n.translate('template.applied'))

    return response.redirect().back()
  }
}
