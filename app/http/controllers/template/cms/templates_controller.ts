import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
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
import { ListTemplatesAction } from '#actions/template/list_templates_action'
import { CreateTemplateAction } from '#actions/template/create_template_action'
import { UpdateTemplateAction } from '#actions/template/update_template_action'
import { DeleteTemplateAction } from '#actions/template/delete_template_action'
import { ApplyToPageAction } from '#actions/template/apply_to_page_action'
import { CreateFromPageAction } from '#actions/template/create_from_page_action'

@inject()
export default class TemplatesController {
  constructor(
    protected listTemplatesAction: ListTemplatesAction,
    protected createTemplateAction: CreateTemplateAction,
    protected updateTemplateAction: UpdateTemplateAction,
    protected deleteTemplateAction: DeleteTemplateAction,
    protected applyToPageAction: ApplyToPageAction,
    protected createFromPageAction: CreateFromPageAction
  ) {}

  async render(ctx: HttpContext) {
    const { inertia, request, i18n } = ctx

    const data = stripEmptyStrings(request.all())
    const payload = await listTemplateValidator.validate(data)

    const templates = await this.listTemplatesAction.execute({
      type: payload.type,
      blockType: payload.block_type as any,
      search: payload.search,
    })

    return inertia.render('template/cms/index', {
      templates: TemplateTransformer.transform(templates),
      filters: payload,
      translations: {
        title: i18n.t('cms.templates.list.title'),
        empty: {
          value: i18n.t('cms.templates.list.empty.value'),
          help: i18n.t('cms.templates.list.empty.help'),
        },
        search: {
          value: i18n.t('cms.templates.search.value'),
          placeholder: i18n.t('cms.templates.search.placeholder'),
          type: {
            value: i18n.t('cms.templates.search.type.value'),
            placeholder: i18n.t('cms.templates.search.type.placeholder'),
            page: i18n.t('cms.templates.search.type.page'),
            block: i18n.t('cms.templates.search.type.block'),
          },
          filter: i18n.t('cms.templates.search.filter'),
        },
        delete: {
          value: i18n.t('cms.templates.delete.title', { name: '{name}' }),
          confirm: i18n.t('cms.templates.delete.confirm'),
        },
      },
    })
  }

  async execute(ctx: HttpContext) {
    const { request, response, auth, session, i18n } = ctx

    const payload = await createTemplateValidator.validate(request.all())
    const user = auth.getUserOrFail()

    await this.createTemplateAction.execute({ ...(payload as any), userId: user.id })

    session.flash('success', i18n.t('template.created'))

    return response.redirect().toRoute('admin.templates.render')
  }

  async update(ctx: HttpContext) {
    const { params, request, response, session, i18n } = ctx

    const { id } = await showTemplateValidator.validate(params)
    const payload = await updateTemplateValidator.validate(request.all())

    await this.updateTemplateAction.execute({ id, ...payload })

    session.flash('success', i18n.t('template.updated'))

    return response.redirect().back()
  }

  async destroy(ctx: HttpContext) {
    const { params, response, session, i18n } = ctx

    const { id } = await showTemplateValidator.validate(params)

    await this.deleteTemplateAction.execute({ id })

    session.flash('success', i18n.t('template.deleted'))

    return response.redirect().toRoute('admin.templates.render')
  }

  async applyToPage(ctx: HttpContext) {
    const { params, request, response, auth, session, i18n } = ctx

    const { id } = await showTemplateValidator.validate(params)
    const payload = await applyTemplateValidator.validate(request.all())
    const user = auth.getUserOrFail()

    await this.applyToPageAction.execute({
      templateId: id,
      pageId: payload.pageId,
      locale: payload.locale,
      userId: user.id,
    })

    session.flash('success', i18n.t('template.applied'))

    return response.redirect().back()
  }

  async createFromPage(ctx: HttpContext) {
    const { request, response, auth, session, i18n } = ctx

    const payload = await createFromPageValidator.validate(request.all())
    const user = auth.getUserOrFail()

    await this.createFromPageAction.execute({
      name: payload.name,
      pageId: payload.pageId,
      locale: payload.locale,
      userId: user.id,
    })

    session.flash('success', i18n.t('template.created_from_page', { name: payload.name }))

    return response.redirect().back()
  }
}
