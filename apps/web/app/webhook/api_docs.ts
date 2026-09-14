import { registerApiDoc, type JsonSchema } from '#transport/core/openapi/api_docs_registry';
import { dateTime, validationErrorSchema, paginatedEnvelope } from '#transport/core/openapi/schemas';
import { listWebhookDeliveriesValidator } from '#transport/webhook/validators/webhook';
import { WebhookDeliveryStatus } from '#webhook/types/webhook';

/** The webhook delivery payload, as shaped by `WebhookDeliveryTransformer`. */
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

/**
 * Register the docs metadata of the webhook REST surface (read-only delivery
 * log listing) under its full route name.
 *
 * Called from `app/webhook/controllers/api/routes.ts` at import time,
 * alongside the route it documents, so the docs and the route live or die
 * together. The request schema is derived from the very same validator the
 * endpoint executes.
 */
export function registerWebhookApiDocs(): void {
	registerApiDoc('api.v1.admin.webhook.deliveries.index', {
		summary: 'List webhook deliveries',
		description: 'Paginated, filterable inbound webhook delivery log (receiver, status, search).',
		tags: ['Webhooks'],
		request: [{ validator: listWebhookDeliveriesValidator, in: 'query' }],
		paginated: true,
		responses: {
			'200': { description: 'The paginated webhook delivery list.', schema: paginatedEnvelope(webhookDeliverySchema) },
			'422': { description: 'Validation failed.', schema: validationErrorSchema },
		},
	});
}
