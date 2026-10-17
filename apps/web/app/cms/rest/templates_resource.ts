import { inject } from '@adonisjs/core';
import { CreateFromPageAction } from '#cms/actions/template/create_from_page_action';
import { DeleteTemplateAction } from '#cms/actions/template/delete_template_action';
import { ListTemplatesAction } from '#cms/actions/template/list_templates_action';
import { SaveBlockTemplateAction } from '#cms/actions/template/save_block_template_action';
import { UpdateTemplateAction } from '#cms/actions/template/update_template_action';
import TemplateTransformer from '#transport/cms/transformers/template_transformer';
import {
	listTemplateValidator,
	createBlockTemplateValidator,
	createFromPageValidator,
	updateTemplateValidator,
	showTemplateValidator,
} from '#transport/cms/validators/template';
import { type ApiOperationDoc, type JsonSchema } from '#transport/core/openapi/api_docs_registry';
import { dateTime, errorSchema, validationErrorSchema } from '#transport/core/openapi/schemas';
import { type RestEndpoint } from '#transport/core/rest/rest_adapter';
import type Template from '#cms/models/template/template';
import type { Infer } from '@vinejs/vine/types';

type TemplateListPayload = Infer<typeof listTemplateValidator>;
type TemplateStorePayload = Infer<typeof createBlockTemplateValidator>;
type TemplateFromPagePayload = Infer<typeof createFromPageValidator>;
type TemplateUpdatePayload = Infer<typeof updateTemplateValidator>;
type TemplateIdPayload = Infer<typeof showTemplateValidator>;

/** The template payload, as shaped by `TemplateTransformer`. */
export const templateSchema: JsonSchema = {
	type: 'object',
	properties: {
		id: { type: 'number' },
		name: { type: 'string' },
		description: { type: 'string', nullable: true },
		type: { type: 'string', enum: ['page', 'block'] },
		blockType: { type: 'string', nullable: true },
		createdAt: dateTime,
		content: { type: 'object' },
		thumbnail: {
			type: 'object',
			properties: {
				id: { type: 'number' },
				url: { type: 'string' },
			},
			nullable: true,
		},
	},
};

export const templateEnvelope = (singular: boolean): JsonSchema => ({
	type: 'object',
	properties: singular ? { template: templateSchema } : { templates: { type: 'array', items: templateSchema } },
});

export const templatesEndpointsDocs: Record<
	'index' | 'store' | 'createFromPage' | 'update' | 'destroy',
	ApiOperationDoc
> = {
	index: {
		summary: 'List templates',
		description: 'Filterable by type, block type and search term (legacy `{ templates }` envelope).',
		tags: ['Templates'],
		request: [{ validator: listTemplateValidator, in: 'query' }],
		responses: {
			'200': { description: 'The template list.', schema: templateEnvelope(false) },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	},
	store: {
		summary: 'Create a block template',
		tags: ['Templates'],
		request: [{ validator: createBlockTemplateValidator, in: 'body' }],
		responses: {
			'201': { description: 'The created template.', schema: templateEnvelope(true) },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	},
	createFromPage: {
		summary: 'Create a template from a page',
		tags: ['Templates'],
		request: [{ validator: createFromPageValidator, in: 'body' }],
		responses: {
			'201': { description: 'The created template.', schema: templateEnvelope(true) },
			'404': { description: 'The page does not exist.', schema: errorSchema },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	},
	update: {
		summary: 'Update a template',
		tags: ['Templates'],
		request: [
			{ validator: showTemplateValidator, in: 'path' },
			{ validator: updateTemplateValidator, in: 'body' },
		],
		responses: {
			'200': { description: 'The updated template.', schema: templateEnvelope(true) },
			'404': { description: 'The template does not exist.', schema: errorSchema },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	},
	destroy: {
		summary: 'Delete a template',
		tags: ['Templates'],
		request: [{ validator: showTemplateValidator, in: 'path' }],
		responses: {
			'204': { description: 'The template was deleted.' },
			'404': { description: 'The template does not exist.', schema: errorSchema },
		},
	},
};

/**
 * Endpoint declarations for the templates REST resource.
 *
 * The templates API predates the serializer's `data` envelope, so every
 * endpoint declares a `wrap` key to keep the legacy named responses
 * (`{ templates: [...] }`, `{ template: {...} }`).
 */
export interface TemplatesEndpoints {
	index: RestEndpoint<undefined, TemplateListPayload, Template[], Template[]>;
	store: RestEndpoint<undefined, TemplateStorePayload, Template, Template>;
	createFromPage: RestEndpoint<undefined, TemplateFromPagePayload, Template, Template>;
	update: RestEndpoint<{ id: number }, TemplateUpdatePayload, Template, Template>;
	destroy: RestEndpoint<undefined, TemplateIdPayload, void, void>;
}

/**
 * Declarative templates REST resource.
 *
 * Owns the `/api/v1/admin/templates` endpoint declarations consumed by the
 * REST `handle` adapter (`#transport/core/rest/rest_adapter`); the controller reduces to
 * one-line dispatch over `endpoints`.
 */
@inject()
export default class TemplatesResource {
	constructor(
		protected listTemplatesAction: ListTemplatesAction,
		protected saveBlockTemplateAction: SaveBlockTemplateAction,
		protected createFromPageAction: CreateFromPageAction,
		protected updateTemplateAction: UpdateTemplateAction,
		protected deleteTemplateAction: DeleteTemplateAction,
	) {}

	readonly endpoints: TemplatesEndpoints = {
		index: {
			docs: templatesEndpointsDocs.index,
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
			docs: templatesEndpointsDocs.store,
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
			docs: templatesEndpointsDocs.createFromPage,
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
			docs: templatesEndpointsDocs.update,
			wrap: 'template',
			prepare: async (context) => {
				const { id } = await showTemplateValidator.validate(context.params);

				return { id };
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
			docs: templatesEndpointsDocs.destroy,
			status: 204,
			input: (context) => context.params,
			validator: () => showTemplateValidator,
			execute: (_context, _prepared, payload) => this.deleteTemplateAction.execute({ id: payload.id }),
		},
	};
}
