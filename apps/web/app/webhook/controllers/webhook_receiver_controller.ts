import { createHash } from 'node:crypto';
import { inject } from '@adonisjs/core';
import { RecordWebhookDeliveryAction } from '#webhook/actions/webhook/record_webhook_delivery_action';
import type { HttpContext } from '@adonisjs/core/http';

/**
 * Public inbound webhook receiver.
 *
 * Serves `POST /webhooks/:receiver`. Route registration convention: each
 * receiver is a named route under the `/webhooks` prefix that applies the
 * {@link WebhookSignatureMiddleware} (HMAC verification) and points at this
 * controller — adding a receiver is a one-line route. The receiver name is
 * carried in the path and flows into the delivery log and the security audit
 * trail.
 *
 * The controller is a thin transport adapter: it reads the verified request
 * (raw body, parsed payload, idempotency key) and hands it to
 * {@link RecordWebhookDeliveryAction}, which records the delivery
 * idempotently and enqueues its processing. It always answers `202 Accepted`
 * for a verified delivery — including a duplicate — so senders can retry
 * safely; the 202 acknowledges receipt, not completion.
 *
 * @example
 * // sender side, with a shared secret:
 * //   body = '{"type":"order.created", ...}'
 * //   ts = unix seconds
 * //   sig = HMAC_SHA256(secret, `${ts}.${body}`)  (hex)
 * //   POST /webhooks/demo  X-Timestamp: ts  X-Signature: sig  [X-Delivery-Id: evt_123]
 */
@inject()
export default class WebhookReceiverController {
	constructor(protected recordWebhookDeliveryAction: RecordWebhookDeliveryAction) {}

	/**
	 * Receive a verified webhook delivery: record it idempotently, enqueue
	 * processing, and answer 202.
	 */
	async receive(ctx: HttpContext) {
		const rawBody = ctx.request.raw() ?? '';

		// The sender's idempotency key when provided; otherwise a stable id
		// derived from the payload so identical payloads deduplicate.
		const deliveryId =
			ctx.request.header('x-delivery-id') ?? `digest:${createHash('sha256').update(rawBody).digest('hex')}`;

		await this.recordWebhookDeliveryAction.execute({
			receiver: ctx.params.receiver,
			deliveryId,
			rawBody,
			payload: ctx.request.body(),
			contentType: ctx.request.header('content-type') ?? null,
			ip: ctx.request.ip(),
			userAgent: ctx.request.header('user-agent') ?? null,
		});

		return ctx.response.status(202).json({ status: 'accepted' });
	}
}
