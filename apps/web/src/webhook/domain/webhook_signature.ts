import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Request headers carried by every signed inbound webhook.
 *
 * The convention (documented for sender integrations):
 * - `X-Timestamp`: the sender's Unix time in seconds at signing time.
 * - `X-Signature`: the hex-encoded HMAC-SHA256 of `${X-Timestamp}.${rawBody}`
 *   computed with the shared secret.
 *
 * The timestamp bounds the replay window; the signature binds the exact raw
 * body, so any tampering with the payload breaks it.
 */
export interface WebhookSignatureInput {
	/** The shared secret used by both sender and receiver. */
	secret: string;
	/** Value of the `X-Signature` header, if present. */
	signature?: string | null;
	/** Value of the `X-Timestamp` header, if present. */
	timestamp?: string | null;
	/** The exact raw request body the signature was computed over. */
	rawBody: string;
	/** Maximum allowed clock skew, in seconds, before a timestamp is replay-stale. */
	replayWindowSeconds: number;
	/** Current Unix time in seconds. Injectable for deterministic tests. */
	nowSeconds?: number;
}

/** Why a webhook signature check failed. */
export type WebhookSignatureFailureReason =
	| 'missing_timestamp'
	| 'stale_timestamp'
	| 'missing_signature'
	| 'invalid_signature';

/** Outcome of a webhook signature verification. */
export interface WebhookSignatureResult {
	valid: boolean;
	reason?: WebhookSignatureFailureReason;
}

/**
 * Computes the hex-encoded HMAC-SHA256 signature for a webhook request.
 *
 * @param secret - The shared signing secret.
 * @param timestamp - The `X-Timestamp` header value (Unix seconds, as a string).
 * @param rawBody - The exact raw request body.
 * @returns The hex signature string to place in the `X-Signature` header.
 */
export function computeWebhookSignature(secret: string, timestamp: string, rawBody: string): string {
	return createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
}

/**
 * Verifies a signed inbound webhook request in pure, side-effect-free form.
 *
 * The checks run in a fixed order and short-circuit on the first failure:
 * the timestamp must be present and within the replay window, then the
 * signature must be present and match in constant time. Returning a result
 * object (rather than throwing) keeps this function trivially unit-testable
 * and lets the caller decide how to reject and log.
 *
 * @param input - The secret, headers, raw body, and replay window to check.
 * @returns A {@link WebhookSignatureResult}; `valid` is `true` only when every
 *   check passed, otherwise `reason` names the first failure.
 */
export function verifyWebhookSignature(input: WebhookSignatureInput): WebhookSignatureResult {
	const {
		secret,
		signature,
		timestamp,
		rawBody,
		replayWindowSeconds,
		nowSeconds = Math.floor(Date.now() / 1000),
	} = input;

	if (!timestamp) {
		return { valid: false, reason: 'missing_timestamp' };
	}

	const parsedTimestamp = Number(timestamp);
	if (!Number.isFinite(parsedTimestamp)) {
		return { valid: false, reason: 'missing_timestamp' };
	}

	if (Math.abs(nowSeconds - parsedTimestamp) > replayWindowSeconds) {
		return { valid: false, reason: 'stale_timestamp' };
	}

	if (!signature) {
		return { valid: false, reason: 'missing_signature' };
	}

	const expected = computeWebhookSignature(secret, timestamp, rawBody);
	const provided = Buffer.from(signature);
	const computed = Buffer.from(expected);

	if (provided.length !== computed.length) {
		return { valid: false, reason: 'invalid_signature' };
	}

	let equal: boolean;
	try {
		equal = timingSafeEqual(provided, computed);
	} catch {
		equal = false;
	}

	if (!equal) {
		return { valid: false, reason: 'invalid_signature' };
	}

	return { valid: true };
}
