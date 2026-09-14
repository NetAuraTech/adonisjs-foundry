import { BaseQuery, type PaginatedResult } from '#core/queries/base_query';
import WebhookDelivery from '#webhook/models/webhook_delivery';
import type { WebhookDelivery as WebhookDeliveryDomain } from '#webhook/domain/webhook_delivery';
import type { WebhookDeliveryListFilters } from '#webhook/types/webhook';

/**
 * Read-side query for listing inbound webhook deliveries for the admin
 * delivery log, newest first, with optional filters.
 */
export class ListWebhookDeliveriesQuery extends BaseQuery {
	/**
	 * Execute the webhook delivery listing query.
	 *
	 * All filters combine with AND. The result is always ordered by
	 * `created_at` descending (most recent first).
	 *
	 * @param filters - Optional receiver, status and search filters plus
	 *   pagination parameters.
	 * @returns A paginated result set of {@link WebhookDeliveryDomain} records, newest first.
	 *
	 * @example
	 * const result = await listWebhookDeliveriesQuery.execute({ status: WebhookDeliveryStatus.FAILED, page: 1 })
	 */
	async execute(filters: WebhookDeliveryListFilters = {}): Promise<PaginatedResult<WebhookDeliveryDomain>> {
		const query = WebhookDelivery.query(this.client()).orderBy('created_at', 'desc');

		if (filters.receiver) {
			query.where('receiver', filters.receiver);
		}

		if (filters.status) {
			query.where('status', filters.status);
		}

		if (filters.search) {
			query.whereILike('delivery_id', `%${filters.search}%`);
		}

		const result = await query.paginate(filters.page ?? 1, filters.perPage ?? 20);

		return this.toPaginated(result, (row) => row.toDomain());
	}
}
