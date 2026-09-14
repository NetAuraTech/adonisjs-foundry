import { inject } from '@adonisjs/core';
import { type RestEndpoint } from '#transport/core/rest/rest_adapter';
import WebhookDeliveryTransformer from '#transport/webhook/transformers/webhook_delivery_transformer';
import { listWebhookDeliveriesValidator } from '#transport/webhook/validators/webhook';
import { ListWebhookDeliveriesAction } from '#webhook/actions/webhook/list_webhook_deliveries_action';
import type { Infer } from '@vinejs/vine/types';

type DeliveryListPagination = Awaited<ReturnType<ListWebhookDeliveriesAction['execute']>>;
type DeliveryListPayload = Infer<typeof listWebhookDeliveriesValidator>;

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
			paginated: true,
			strip: true,
			validator: () => listWebhookDeliveriesValidator,
			execute: (context, _prepared, payload) =>
				this.listWebhookDeliveriesAction.execute({ ...payload, ...context.pagination! }),
			transform: (entity) => WebhookDeliveryTransformer.paginate(entity.all(), entity.getMeta()),
		},
	};
}
