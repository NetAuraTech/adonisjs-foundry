import { inject } from '@adonisjs/core';
import webhooksConfig from '#config/webhooks';
import { LogService } from '#log/services/log_service';
import { verifyWebhookSignature } from '#webhook/domain/webhook_signature';
import WebhookSignatureException from '#webhook/exceptions/webhook_signature_exception';
import WebhookTimestampException from '#webhook/exceptions/webhook_timestamp_exception';
import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

/**
 * Verifies the HMAC signature of an inbound webhook delivery.
 *
 * Applied to every public receiver route under `/webhooks/*`. It enforces the
 * documented sender convention — an `X-Timestamp` (Unix seconds) plus an
 * `X-Signature` (hex HMAC-SHA256 of `${X-Timestamp}.${rawBody}` with the shared
 * secret) — rejecting missing/stale timestamps and missing/invalid signatures
 * with a JSON 401 and a security Log Entry. The pure verification lives in
 * `#webhook/domain/webhook_signature`; this middleware only orchestrates
 * rejection and audit logging.
 *
 * The middleware runs after the body parser (both are router-level), so
 * `ctx.request.raw()` already holds the exact raw body the signature binds.
 */
@inject()
export default class WebhookSignatureMiddleware {
	constructor(protected logService: LogService) {}

	async handle(ctx: HttpContext, next: NextFn, options: { secret?: string; replayWindowSeconds?: number } = {}) {
		const secret = options.secret ?? webhooksConfig.secret;
		const replayWindowSeconds = options.replayWindowSeconds ?? webhooksConfig.replayWindowSeconds;

		const result = verifyWebhookSignature({
			secret,
			signature: ctx.request.header('x-signature'),
			timestamp: ctx.request.header('x-timestamp'),
			rawBody: ctx.request.raw() ?? '',
			replayWindowSeconds,
		});

		if (!result.valid) {
			const reason = result.reason ?? 'invalid_signature';

			this.logService.logSecurity('webhook.signature_rejected', {
				receiver: (ctx.params as Record<string, string | undefined>).receiver,
				reason,
				ip: ctx.request.ip(),
				userAgent: ctx.request.header('user-agent') ?? undefined,
			});

			if (reason === 'missing_timestamp' || reason === 'stale_timestamp') {
				throw new WebhookTimestampException(reason);
			}

			throw new WebhookSignatureException(reason);
		}

		return next();
	}
}
