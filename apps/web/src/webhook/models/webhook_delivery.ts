import { column } from '@adonisjs/lucid/orm';
import { WebhookDeliverySchema } from '#database/schema';
import { WebhookDelivery as WebhookDeliveryDomain } from '#webhook/domain/webhook_delivery';
import type { WebhookDeliveryStatus } from '#webhook/types/webhook';
import type { DateTime } from 'luxon';

export default class WebhookDelivery extends WebhookDeliverySchema {
	@column()
	declare status: WebhookDeliveryStatus;

	@column.dateTime()
	declare processedAt: DateTime | null;

	/**
	 * Project this model onto its pure domain representation.
	 */
	toDomain(): WebhookDeliveryDomain {
		return WebhookDeliveryDomain.fromModel({
			id: this.id,
			receiver: this.receiver,
			deliveryId: this.deliveryId,
			status: this.status,
			payloadDigest: this.payloadDigest,
			contentType: this.contentType,
			ip: this.ip,
			userAgent: this.userAgent,
			error: this.error,
			createdAt: this.createdAt?.toJSDate() ?? null,
			processedAt: this.processedAt?.toJSDate() ?? null,
		});
	}
}
