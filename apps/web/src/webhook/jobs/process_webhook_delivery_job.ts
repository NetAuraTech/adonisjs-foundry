import { inject } from '@adonisjs/core';
import { Job } from '@adonisjs/queue';
import { WebhookDeliveryService } from '#webhook/services/webhook_delivery_service';
import type { ProcessWebhookDeliveryPayload } from '#webhook/types/webhook';
import type { JobOptions } from '@adonisjs/queue/types';

/**
 * Processes an inbound webhook delivery outside the HTTP request.
 *
 * The receiver endpoint records the delivery (idempotently) and enqueues this
 * job; the worker advances the delivery to `processed`. Failures follow the
 * global retry policy (see `config/queue.ts`); once the retries are exhausted,
 * {@link failed} marks the delivery `failed` and records a security Log Entry.
 */
@inject()
export class ProcessWebhookDeliveryJob extends Job<ProcessWebhookDeliveryPayload> {
	static options: JobOptions = {
		queue: 'webhook',
	};

	constructor(protected webhookDeliveryService: WebhookDeliveryService) {
		super();
	}

	/**
	 * Advances the delivery to `processed`.
	 */
	async execute(): Promise<void> {
		await this.webhookDeliveryService.processDelivery(this.payload);
	}

	/**
	 * Marks the delivery `failed` and records a security Log Entry once the job
	 * has permanently failed after all configured retries.
	 *
	 * @param error - The error thrown by the last attempt.
	 */
	async failed(error: Error): Promise<void> {
		await this.webhookDeliveryService.markDeliveryFailed(this.payload.deliveryId, error);
	}
}

export default ProcessWebhookDeliveryJob;
