import { BaseRepository } from '#core/repositories/base_repository';
import WebhookDelivery from '#webhook/models/webhook_delivery';
import { WebhookDeliveryStatus, type CreateWebhookDeliveryInput } from '#webhook/types/webhook';

/**
 * Handles all database operations for the {@link WebhookDelivery} model.
 *
 * Owns the write side of the inbound-webhook pipeline (idempotent inserts and
 * status transitions); the read side used by the admin delivery log lives in
 * the {@link ListWebhookDeliveriesQuery} query.
 */
export class WebhookDeliveryRepository extends BaseRepository {
	/**
	 * Persists a single webhook delivery row.
	 *
	 * The composite unique index on `(receiver, delivery_id)` is the atomic
	 * idempotency guard: a concurrent insert of the same delivery throws a
	 * unique-constraint violation, which the caller treats as a duplicate.
	 *
	 * @param input - The delivery row to persist.
	 * @returns The newly created {@link WebhookDelivery}.
	 *
	 * @example
	 * const delivery = await repository.createRecord({ receiver, deliveryId, status, payloadDigest })
	 */
	async createRecord(input: CreateWebhookDeliveryInput): Promise<WebhookDelivery> {
		return WebhookDelivery.create(
			{
				receiver: input.receiver,
				deliveryId: input.deliveryId,
				status: input.status,
				payloadDigest: input.payloadDigest,
				contentType: input.contentType ?? null,
				ip: input.ip ?? null,
				userAgent: input.userAgent ?? null,
			},
			this.client(),
		);
	}

	/**
	 * Finds a delivery by its idempotency key (receiver + delivery id).
	 *
	 * @param receiver - The receiver the delivery was sent to.
	 * @param deliveryId - The sender-supplied (or derived) delivery id.
	 * @returns The matching {@link WebhookDelivery}, or `null` when unseen.
	 *
	 * @example
	 * const existing = await repository.findByReceiverAndDeliveryId('stripe', 'evt_123')
	 */
	async findByReceiverAndDeliveryId(receiver: string, deliveryId: string): Promise<WebhookDelivery | null> {
		return WebhookDelivery.query(this.client()).where({ receiver, deliveryId }).first();
	}

	/**
	 * Finds a delivery by its primary key.
	 *
	 * @param id - The delivery primary key.
	 * @returns The matching {@link WebhookDelivery}, or `null` when missing.
	 *
	 * @example
	 * const delivery = await repository.findById(42)
	 */
	async findById(id: number): Promise<WebhookDelivery | null> {
		return WebhookDelivery.query(this.client()).where({ id }).first();
	}

	/**
	 * Marks a delivery as processed and stamps `processed_at`.
	 *
	 * @param id - The delivery primary key.
	 *
	 * @example
	 * await repository.markProcessed(42)
	 */
	async markProcessed(id: number): Promise<void> {
		await WebhookDelivery.query(this.client())
			.where({ id })
			.update({ status: WebhookDeliveryStatus.PROCESSED, processedAt: new Date() });
	}

	/**
	 * Marks a delivery as failed and records the failure reason.
	 *
	 * @param id - The delivery primary key.
	 * @param error - A human-readable failure reason to persist.
	 *
	 * @example
	 * await repository.markFailed(42, 'upstream 500')
	 */
	async markFailed(id: number, error: string): Promise<void> {
		await WebhookDelivery.query(this.client()).where({ id }).update({ status: WebhookDeliveryStatus.FAILED, error });
	}
}
