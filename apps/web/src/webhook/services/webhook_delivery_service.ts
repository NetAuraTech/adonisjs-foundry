import { createHash } from 'node:crypto';
import { inject } from '@adonisjs/core';
import { LogService } from '#log/services/log_service';
import { ProcessWebhookDeliveryJob } from '#webhook/jobs/process_webhook_delivery_job';
import { WebhookDeliveryRepository } from '#webhook/repositories/webhook_delivery_repository';
import {
	WebhookDeliveryStatus,
	type IncomingWebhookInput,
	type ProcessWebhookDeliveryPayload,
} from '#webhook/types/webhook';

/**
 * SHA-256 hex digest of the exact raw body, used as the audit-only payload
 * fingerprint (the full payload is never persisted to the delivery log).
 */
function digestRawBody(rawBody: string): string {
	return createHash('sha256').update(rawBody).digest('hex');
}

/**
 * Whether a database error is a unique-constraint violation, i.e. the atomic
 * duplicate-delivery guard fired (a concurrent insert of the same
 * `(receiver, delivery_id)`).
 */
function isUniqueConstraintViolation(error: unknown): boolean {
	if (!error || typeof error !== 'object') {
		return false;
	}

	const code = (error as { code?: unknown }).code;
	return (
		code === '23505' || code === 'ER_DUP_ENTRY' || code === 'SQLITE_CONSTRAINT_UNIQUE' || code === 'SQLITE_CONSTRAINT'
	);
}

/**
 * Inbound webhook delivery pipeline.
 *
 * Owns the idempotent record-or-duplicate decision, the dispatch of the
 * processing job, and the delivery's status transitions. It never returns an
 * HTTP response — the transport layer maps the returned booleans to status
 * codes.
 */
@inject()
export class WebhookDeliveryService {
	constructor(
		protected deliveryRepository: WebhookDeliveryRepository,
		protected logService: LogService,
	) {}

	/**
	 * Records an inbound webhook delivery idempotently and, for a first-time
	 * delivery, enqueues its processing.
	 *
	 * Idempotency is keyed on `(receiver, deliveryId)`: a delivery already on
	 * record is acknowledged without re-dispatch. The check-then-insert race is
	 * closed by the composite unique index — a concurrent insert throws a
	 * unique-constraint violation, which is treated as a duplicate.
	 *
	 * @param input - The verified delivery to record and dispatch.
	 * @returns `{ duplicate: true }` when the delivery was already recorded
	 *   (nothing dispatched), `{ duplicate: false }` when it was recorded and
	 *   its processing enqueued.
	 *
	 * @example
	 * const { duplicate } = await webhookDeliveryService.recordDelivery({ receiver, deliveryId, rawBody, payload })
	 */
	async recordDelivery(input: IncomingWebhookInput): Promise<{ duplicate: boolean }> {
		const existing = await this.deliveryRepository.findByReceiverAndDeliveryId(input.receiver, input.deliveryId);
		if (existing) {
			return { duplicate: true };
		}

		let deliveryId: number;
		try {
			const delivery = await this.deliveryRepository.createRecord({
				receiver: input.receiver,
				deliveryId: input.deliveryId,
				status: WebhookDeliveryStatus.RECEIVED,
				payloadDigest: digestRawBody(input.rawBody),
				contentType: input.contentType ?? null,
				ip: input.ip ?? null,
				userAgent: input.userAgent ?? null,
			});
			deliveryId = delivery.id;
		} catch (error) {
			if (isUniqueConstraintViolation(error)) {
				return { duplicate: true };
			}
			throw error;
		}

		this.logService.logBusiness('webhook.received', {
			receiver: input.receiver,
			deliveryId: input.deliveryId,
			ip: input.ip ?? undefined,
		});

		await ProcessWebhookDeliveryJob.dispatch({
			deliveryId,
			receiver: input.receiver,
			payload: input.payload,
		} satisfies ProcessWebhookDeliveryPayload);

		return { duplicate: false };
	}

	/**
	 * Processes a delivered webhook: marks the delivery `processed` and records
	 * a business event. This is where a real receiver handler would apply the
	 * payload; the demonstration receiver only advances the lifecycle.
	 *
	 * @param payload - The dispatched delivery (primary key, receiver, payload).
	 *
	 * @example
	 * await webhookDeliveryService.processDelivery({ deliveryId, receiver, payload })
	 */
	async processDelivery(payload: ProcessWebhookDeliveryPayload): Promise<void> {
		await this.deliveryRepository.markProcessed(payload.deliveryId);

		this.logService.logBusiness('webhook.processed', {
			receiver: payload.receiver,
			deliveryId: payload.deliveryId,
		});
	}

	/**
	 * Marks a delivery `failed` once its processing has permanently failed, and
	 * records a security Log Entry for the audit trail.
	 *
	 * @param deliveryId - The delivery primary key to mark failed.
	 * @param error - The error from the last processing attempt.
	 *
	 * @example
	 * await webhookDeliveryService.markDeliveryFailed(42, error)
	 */
	async markDeliveryFailed(deliveryId: number, error: Error): Promise<void> {
		const delivery = await this.deliveryRepository.findById(deliveryId);

		await this.deliveryRepository.markFailed(deliveryId, error.message);

		this.logService.logSecurity('webhook.processing_failed', {
			receiver: delivery?.receiver,
			deliveryId,
			error: error.message,
		});
	}
}
