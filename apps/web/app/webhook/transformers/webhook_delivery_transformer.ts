import { BaseTransformer } from '@adonisjs/core/transformers';
import type { WebhookDelivery } from '#webhook/domain/webhook_delivery';

/**
 * Maps a webhook {@link WebhookDelivery} domain object to the API/Inertia
 * delivery-log payload.
 */
export default class WebhookDeliveryTransformer extends BaseTransformer<WebhookDelivery> {
	/**
	 * Build the webhook delivery payload.
	 */
	toObject() {
		return {
			id: this.resource.id?.value ?? null,
			receiver: this.resource.receiver,
			deliveryId: this.resource.deliveryId,
			status: this.resource.status,
			payloadDigest: this.resource.payloadDigest,
			contentType: this.resource.contentType,
			ip: this.resource.ip,
			userAgent: this.resource.userAgent,
			error: this.resource.error,
			createdAt: this.resource.createdAt,
			processedAt: this.resource.processedAt,
		};
	}
}
