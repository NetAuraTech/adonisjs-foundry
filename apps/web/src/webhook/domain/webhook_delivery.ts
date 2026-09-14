import { Entity } from '#core/domain/entity';
import { WebhookDeliveryIdentifier } from '#webhook/domain/identifiers';
import { WebhookDeliveryStatus } from '#webhook/types/webhook';

/**
 * Pure domain object for an incoming webhook delivery.
 *
 * The Lucid `WebhookDelivery` model is the persistence representation; build
 * one from a persisted row with {@link WebhookDelivery.fromModel}. An entity
 * not persisted yet carries a `null` id. The full payload is intentionally
 * absent — only the SHA-256 {@link WebhookDelivery.payloadDigest} is retained
 * for audit.
 */
export class WebhookDelivery extends Entity<{
	id: WebhookDeliveryIdentifier | null;
	receiver: string;
	deliveryId: string;
	status: WebhookDeliveryStatus;
	payloadDigest: string;
	contentType: string | null;
	ip: string | null;
	userAgent: string | null;
	error: string | null;
	createdAt: Date | null;
	processedAt: Date | null;
}> {
	private constructor(
		readonly id: WebhookDeliveryIdentifier | null,
		readonly receiver: string,
		readonly deliveryId: string,
		readonly status: WebhookDeliveryStatus,
		readonly payloadDigest: string,
		readonly contentType: string | null,
		readonly ip: string | null,
		readonly userAgent: string | null,
		readonly error: string | null,
		readonly createdAt: Date | null = null,
		readonly processedAt: Date | null = null,
	) {
		super({
			id,
			receiver,
			deliveryId,
			status,
			payloadDigest,
			contentType,
			ip,
			userAgent,
			error,
			createdAt,
			processedAt,
		});
	}

	/**
	 * Hydrate a domain delivery from its Lucid model representation.
	 *
	 * @param model - The persisted webhook delivery row.
	 */
	static fromModel(model: {
		id: number;
		receiver: string;
		deliveryId: string;
		status: WebhookDeliveryStatus;
		payloadDigest: string;
		contentType: string | null;
		ip: string | null;
		userAgent: string | null;
		error: string | null;
		createdAt?: Date | null;
		processedAt?: Date | null;
	}): WebhookDelivery {
		return new WebhookDelivery(
			WebhookDeliveryIdentifier.of(model.id),
			model.receiver,
			model.deliveryId,
			model.status,
			model.payloadDigest,
			model.contentType,
			model.ip,
			model.userAgent,
			model.error,
			model.createdAt ?? null,
			model.processedAt ?? null,
		);
	}

	/** Whether the delivery has finished processing (processed or failed). */
	isFinalized(): boolean {
		return this.status !== WebhookDeliveryStatus.RECEIVED;
	}
}
