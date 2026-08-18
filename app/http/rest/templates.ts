import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import type { Infer } from '@vinejs/vine/types'
import type Template from '#cms/models/template/template'
import { ListTemplatesAction } from '#cms/domain/actions/template/list_templates_action'
import { SaveBlockTemplateAction } from '#cms/domain/actions/template/save_block_template_action'
import { CreateFromPageAction } from '#cms/domain/actions/template/create_from_page_action'
import { UpdateTemplateAction } from '#cms/domain/actions/template/update_template_action'
import { DeleteTemplateAction } from '#cms/domain/actions/template/delete_template_action'
import {
  listTemplateValidator,
  createBlockTemplateValidator,
  createFromPageValidator,
  updateTemplateValidator,
  showTemplateValidator,
} from '#cms/validators/template'
import TemplateTransformer from '#transformers/template/template_transformer'
import { type RestEndpoint, type AnyRestEndpoint, handleRest } from '#rest/rest_resource'

type TemplateListPayload = Infer<typeof listTemplateValidator>
type TemplateStorePayload = Infer<typeof createBlockTemplateValidator>
type TemplateFromPagePayload = Infer<typeof createFromPageValidator>
type TemplateUpdatePayload = Infer<typeof updateTemplateValidator>
type TemplateIdPayload = Infer<typeof showTemplateValidator>

/**
 * Endpoint declarations for the templates REST resource.
 *
 * The templates API predates the serializer's `data` envelope, so every
 * endpoint declares a `wrap` key to keep the legacy named responses
 * (`{ templates: [...] }`, `{ template: {...} }`).
 */
export interface TemplatesEndpoints {
  index: RestEndpoint<undefined, TemplateListPayload, Template[], Template[]>
  store: RestEndpoint<undefined, TemplateStorePayload, Template, Template>
  createFromPage: RestEndpoint<undefined, TemplateFromPagePayload, Template, Template>
  update: RestEndpoint<{ id: number }, TemplateUpdatePayload, Template, Template>
  destroy: RestEndpoint<undefined, TemplateIdPayload, void, void>
}

/**
 * Declarative templates REST resource.
 *
 * Owns the `/api/v1/admin/templates` endpoint declarations executed by the
 * shared {@link handleRest} pipeline; the controller reduces to one-line
 * adapters over `handle()`.
 */
@inject()
export default class TemplatesResource {
  constructor(
    protected listTemplatesAction: ListTemplatesAction,
    protected saveBlockTemplateAction: SaveBlockTemplateAction,
    protected createFromPageAction: CreateFromPageAction,
    protected updateTemplateAction: UpdateTemplateAction,
    protected deleteTemplateAction: DeleteTemplateAction
  ) {}

  readonly endpoints: TemplatesEndpoints = {
    index: {
      wrap: 'templates',
      validator: () => listTemplateValidator,
      execute: (_context, _prepared, payload) =>
        this.listTemplatesAction.execute({
          type: payload.type,
          blockType: payload.block_type,
          search: payload.search,
        }),
      transform: (entity) => TemplateTransformer.transform(entity),
    },
    store: {
      status: 201,
      wrap: 'template',
      validator: () => createBlockTemplateValidator,
      execute: (context, _prepared, payload) =>
        this.saveBlockTemplateAction.execute({
          name: payload.name,
          description: payload.description,
          blockType: payload.blockType,
          content: payload.content,
          overwriteId: payload.overwriteId,
          userId: context.auth.getUserOrFail().id,
        }),
      transform: (entity) => TemplateTransformer.transform(entity),
    },
    createFromPage: {
      status: 201,
      wrap: 'template',
      validator: () => createFromPageValidator,
      execute: (context, _prepared, payload) =>
        this.createFromPageAction.execute({
          name: payload.name,
          pageId: payload.pageId,
          locale: payload.locale,
          content: payload.content,
          userId: context.auth.getUserOrFail().id,
        }),
      transform: (entity) => TemplateTransformer.transform(entity),
    },
    update: {
      wrap: 'template',
      prepare: async (context) => {
        const { id } = await showTemplateValidator.validate(context.params)

        return { id }
      },
      validator: () => updateTemplateValidator,
      execute: (_context, prepared, payload) =>
        this.updateTemplateAction.execute({
          id: prepared.id,
          ...(payload.name !== undefined && { name: payload.name }),
          ...(payload.description !== undefined && { description: payload.description }),
          ...(payload.thumbnailId !== undefined && { thumbnailId: payload.thumbnailId }),
        }),
      transform: (entity) => TemplateTransformer.transform(entity),
    },
    destroy: {
      status: 204,
      input: (context) => context.params,
      validator: () => showTemplateValidator,
      execute: (_context, _prepared, payload) =>
        this.deleteTemplateAction.execute({ id: payload.id }),
    },
  }

  /**
   * Dispatch a REST action to its declared endpoint.
   */
  async handle(route: keyof TemplatesEndpoints, ctx: HttpContext): Promise<void> {
    const endpoint = this.endpoints[route] as AnyRestEndpoint

    await handleRest(ctx, endpoint)
  }
}
