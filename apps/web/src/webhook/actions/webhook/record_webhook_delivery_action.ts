import { inject } from '@adonisjs/core';
import { WebhookDeliveryService } from '#webhook/services/webhook_delivery_service';
import type { IncomingWebhookInput } from '#webhook/types/webhook';

/**
 * Records an inbound webhook delivery and enqueues its processing.
 */
@inject()
export class RecordWebhookDeliveryAction {
	constructor(protected webhookDeliveryService: WebhookDeliveryService) {}

	/**
	 * Execute the record-or-duplicate decision for a verified delivery.
	 *
	 * @param input - The verified delivery to record and dispatch.
	 * @returns `{ duplicate: true }` when the delivery was already recorded,
	 *   `{ duplicate: false }` when it was recorded and dispatched.
	 *
	 * @example
	 * const result = await recordWebhookDeliveryAction.execute({ receiver, deliveryId, rawBody, payload })
	 */
	async execute(input: IncomingWebhookInput): Promise<{ duplicate: boolean }> {
		return this.webhookDeliveryService.recordDelivery(input);
	}
}
