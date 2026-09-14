import { inject } from '@adonisjs/core';
import { ListWebhookDeliveriesQuery } from '#webhook/queries/list_webhook_deliveries_query';
import type { WebhookDeliveryListFilters } from '#webhook/types/webhook';

/**
 * List inbound webhook deliveries for the admin delivery log, with optional
 * filters.
 */
@inject()
export class ListWebhookDeliveriesAction {
	constructor(protected listWebhookDeliveriesQuery: ListWebhookDeliveriesQuery) {}

	/**
	 * Execute the webhook delivery listing.
	 *
	 * @param filters - Optional receiver, status and search filters plus
	 *   pagination parameters.
	 * @returns A paginated result set of webhook deliveries, newest first.
	 *
	 * @example
	 * const result = await listWebhookDeliveriesAction.execute({ status: WebhookDeliveryStatus.FAILED, page: 1 })
	 */
	async execute(filters: WebhookDeliveryListFilters = {}) {
		return this.listWebhookDeliveriesQuery.execute(filters);
	}
}
