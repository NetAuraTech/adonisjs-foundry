import { inject } from '@adonisjs/core';
import { type ApiOperationDoc, type JsonSchema } from '#transport/core/openapi/api_docs_registry';
import { dateTime, paginatedEnvelope, validationErrorSchema } from '#transport/core/openapi/schemas';
import { type RestEndpoint } from '#transport/core/rest/rest_adapter';
import WebhookDeliveryTransformer from '#transport/webhook/transformers/webhook_delivery_transformer';
import { listWebhookDeliveriesValidator } from '#transport/webhook/validators/webhook';
import { ListWebhookDeliveriesAction } from '#webhook/actions/webhook/list_webhook_deliveries_action';
import { WebhookDeliveryStatus } from '#webhook/types/webhook';
import type { Infer } from '@vinejs/vine/types';

type DeliveryListPagination = Awaited<ReturnType<ListWebhookDeliveriesAction['execute']>>;
type DeliveryListPayload = Infer<typeof listWebhookDeliveriesValidator>;

const webhookDeliverySchema: JsonSchema = {
	type: 'object',
	properties: {
		id: { type: 'number', nullable: true },
		receiver: { type: 'string' },
		deliveryId: { type: 'string' },
		status: { type: 'string', enum: Object.values(WebhookDeliveryStatus) },
		payloadDigest: { type: 'string' },
		contentType: { type: 'string', nullable: true },
		ip: { type: 'string', nullable: true },
		userAgent: { type: 'string', nullable: true },
		error: { type: 'string', nullable: true },
		createdAt: dateTime,
		processedAt: { ...dateTime, nullable: true },
	},
};

export const deliveriesEndpointsDocs: Record<keyof DeliveriesEndpoints, ApiOperationDoc> = {
	index: {
		summary: 'List webhook deliveries',
		description: 'Paginated, filterable inbound webhook delivery log (receiver, status, search).',
		tags: ['Webhooks'],
		request: [{ validator: listWebhookDeliveriesValidator, in: 'query' }],
		paginated: true,
		responses: {
			'200': { description: 'The paginated webhook delivery list.', schema: paginatedEnvelope(webhookDeliverySchema) },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	},
};

/**
 * Endpoint declarations for the webhook deliveries REST resource (read-only).
 */
export interface DeliveriesEndpoints {
	index: RestEndpoint<undefined, DeliveryListPayload, DeliveryListPagination, DeliveryListPagination>;
}

/**
 * Declarative webhook deliveries REST resource.
 *
 * Owns the read-only delivery-log endpoint declarations consumed by the REST
 * `handle` adapter (`#transport/core/rest/rest_adapter`); the
 * `/api/v1/admin/webhooks/deliveries` controller reduces to a one-line
 * dispatch over `endpoints`.
 */
@inject()
export default class DeliveriesResource {
	constructor(protected listWebhookDeliveriesAction: ListWebhookDeliveriesAction) {}

	readonly endpoints: DeliveriesEndpoints = {
		index: {
			docs: deliveriesEndpointsDocs.index,
			paginated: true,
			strip: true,
			validator: () => listWebhookDeliveriesValidator,
			execute: (context, _prepared, payload) =>
				this.listWebhookDeliveriesAction.execute({ ...payload, ...context.pagination! }),
			transform: (entity) => WebhookDeliveryTransformer.paginate(entity.all(), entity.getMeta()),
		},
	};
}
