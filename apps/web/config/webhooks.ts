import env from '#start/env';

/**
 * Configuration for the inbound webhook facility.
 *
 * The {@link WebhookSignatureMiddleware} consults this configuration to verify
 * the `X-Signature` / `X-Timestamp` headers of every signed delivery.
 */
const webhooksConfig = {
	/**
	 * Shared HMAC-SHA256 signing secret.
	 *
	 * Senders compute `X-Signature` as the hex HMAC-SHA256 of
	 * `${X-Timestamp}.${rawBody}` with this secret. When unset (empty),
	 * signature verification cannot succeed and every signed delivery is
	 * rejected — the webhook surface is effectively disabled.
	 */
	secret: env.get('WEBHOOK_SECRET', ''),

	/**
	 * Maximum allowed clock skew, in seconds, between the sender's
	 * `X-Timestamp` and the receiver's clock. Deliveries whose timestamp falls
	 * outside this window are rejected as replays.
	 */
	replayWindowSeconds: env.get('WEBHOOK_REPLAY_WINDOW', 300),
};

export default webhooksConfig;
