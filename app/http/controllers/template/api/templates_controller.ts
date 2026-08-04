import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import {
  createBlockTemplateValidator,
  createFromPageValidator,
  listTemplateValidator,
  updateTemplateValidator,
} from '#validators/template'
import TemplateTransformer from '#transformers/template_transformer'
import { ListTemplatesAction } from '#actions/template/list_templates_action'
import { UpdateTemplateAction } from '#actions/template/update_template_action'
import { SaveBlockTemplateAction } from '#actions/template/save_block_template_action'
import { CreateFromPageAction } from '#actions/template/create_from_page_action'

/**
 * JSON API consumed by the page builder and admin Templates library.
 *
 * - `index` feeds the "Templates" insert picker / apply modal (block + page).
 * - `store` accepts a Block Template submission from the builder and maps it
 *   onto the existing create/update actions (see {@link SaveBlockTemplateAction}).
 * - `createFromPage` snapshots a page translation into a Page Template (see
 *   {@link CreateFromPageAction}) so the editor can auto-capture its thumbnail.
 * - `update` handles lightweight metadata updates (name, thumbnail) from the
 *   builder's template save flow.
 */
@inject()
export default class TemplatesApiController {
  constructor(
    protected listTemplatesAction: ListTemplatesAction,
    protected saveBlockTemplateAction: SaveBlockTemplateAction,
    protected updateTemplateAction: UpdateTemplateAction,
    protected createFromPageAction: CreateFromPageAction
  ) {}

  /**
   * GET /api/admin/templates?type=block|page
   *
   * Returns templates serialized through the shared transformer. `content`
   * is included so the builder can deep-clone a Block Template and insert it.
   */
  async index(ctx: HttpContext) {
    const { request, response, serialize } = ctx

    const payload = await listTemplateValidator.validate(request.all())

    const templates = await this.listTemplatesAction.execute({
      type: payload.type,
      blockType: payload.block_type,
      search: payload.search,
    })

    const serialized = await serialize(TemplateTransformer.transform(templates))

    return response.ok({ templates: serialized.data })
  }

  /**
   * POST /api/admin/templates
   *
   * Creates (or overwrites, when `overwriteId` is set) a Block Template from
   * a single-root block payload captured in the builder.
   */
  async store(ctx: HttpContext) {
    const { request, response, auth, serialize } = ctx

    const payload = await createBlockTemplateValidator.validate(request.all())
    const user = auth.getUserOrFail()

    const template = await this.saveBlockTemplateAction.execute({
      name: payload.name,
      description: payload.description,
      blockType: payload.blockType,
      content: payload.content,
      overwriteId: payload.overwriteId,
      userId: user.id,
    })

    const serialized = await serialize(TemplateTransformer.transform(template))

    return response.created({ template: serialized.data })
  }

  /**
   * POST /api/admin/templates/from-page
   *
   * Creates a Page Template by snapshotting the *saved* content of a page
   * translation server-side (via {@link CreateFromPageAction}). Returns the
   * serialized template so the editor can trigger the thumbnail capture.
   */
  async createFromPage(ctx: HttpContext) {
    const { request, response, auth, serialize } = ctx

    const payload = await createFromPageValidator.validate(request.all())
    const user = auth.getUserOrFail()

    const template = await this.createFromPageAction.execute({
      name: payload.name,
      pageId: payload.pageId,
      locale: payload.locale,
      content: payload.content,
      userId: user.id,
    })

    const serialized = await serialize(TemplateTransformer.transform(template))

    return response.created({ template: serialized.data })
  }

  /**
   * PUT /api/admin/templates/:id
   *
   * Lightweight metadata update (name, description, thumbnailId) used by the
   * builder's template save flow to attach the auto-captured thumbnail.
   */
  async update(ctx: HttpContext) {
    const { params, request, response, serialize } = ctx

    const id = Number(params.id)
    if (!id || Number.isNaN(id)) {
      return response.badRequest({
        error: { code: 'E_INVALID_PARAMS', message: 'id is required' },
      })
    }

    const payload = await updateTemplateValidator.validate(request.all())

    const template = await this.updateTemplateAction.execute({
      id,
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.thumbnailId !== undefined && { thumbnailId: payload.thumbnailId }),
    })

    const serialized = await serialize(TemplateTransformer.transform(template))

    return response.ok({ template: serialized.data })
  }
}
