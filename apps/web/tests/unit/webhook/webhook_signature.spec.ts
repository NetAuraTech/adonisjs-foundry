import { test } from '@japa/runner';
import { computeWebhookSignature, verifyWebhookSignature } from '#webhook/domain/webhook_signature';

/**
 * Pure unit tests for the inbound-webhook HMAC verification. No app, no DB,
 * no HTTP: the `nowSeconds` injection makes every clock-sensitive case
 * deterministic.
 */
const SECRET = 'unit-test-secret';
const NOW = 1_700_000_000;
const BODY = '{"type":"order.created","id":"evt_1"}';
const WINDOW = 300;

test.group('WebhookSignature', () => {
	test('computeWebhookSignature returns a deterministic hex SHA-256', ({ assert }) => {
		const a = computeWebhookSignature(SECRET, '123', BODY);
		const b = computeWebhookSignature(SECRET, '123', BODY);

		assert.equal(a, b);
		assert.match(a, /^[0-9a-f]{64}$/);
	});

	test('verify accepts a correctly signed, in-window request', ({ assert }) => {
		const result = verifyWebhookSignature({
			secret: SECRET,
			signature: computeWebhookSignature(SECRET, String(NOW), BODY),
			timestamp: String(NOW),
			rawBody: BODY,
			replayWindowSeconds: WINDOW,
			nowSeconds: NOW,
		});

		assert.isTrue(result.valid);
		assert.isUndefined(result.reason);
	});

	test('rejects a signature that does not match the body', ({ assert }) => {
		const result = verifyWebhookSignature({
			secret: SECRET,
			signature: computeWebhookSignature(SECRET, String(NOW), BODY + 'tampered'),
			timestamp: String(NOW),
			rawBody: BODY,
			replayWindowSeconds: WINDOW,
			nowSeconds: NOW,
		});

		assert.isFalse(result.valid);
		assert.equal(result.reason, 'invalid_signature');
	});

	test('rejects a signature computed with a different secret', ({ assert }) => {
		const result = verifyWebhookSignature({
			secret: SECRET,
			signature: computeWebhookSignature('other-secret', String(NOW), BODY),
			timestamp: String(NOW),
			rawBody: BODY,
			replayWindowSeconds: WINDOW,
			nowSeconds: NOW,
		});

		assert.isFalse(result.valid);
		assert.equal(result.reason, 'invalid_signature');
	});

	test('rejects a missing signature', ({ assert }) => {
		const result = verifyWebhookSignature({
			secret: SECRET,
			signature: null,
			timestamp: String(NOW),
			rawBody: BODY,
			replayWindowSeconds: WINDOW,
			nowSeconds: NOW,
		});

		assert.isFalse(result.valid);
		assert.equal(result.reason, 'missing_signature');
	});

	test('rejects a missing timestamp before checking the signature', ({ assert }) => {
		const result = verifyWebhookSignature({
			secret: SECRET,
			signature: computeWebhookSignature(SECRET, String(NOW), BODY),
			timestamp: null,
			rawBody: BODY,
			replayWindowSeconds: WINDOW,
			nowSeconds: NOW,
		});

		assert.isFalse(result.valid);
		assert.equal(result.reason, 'missing_timestamp');
	});

	test('rejects a non-numeric timestamp as missing', ({ assert }) => {
		const result = verifyWebhookSignature({
			secret: SECRET,
			signature: computeWebhookSignature(SECRET, 'not-a-number', BODY),
			timestamp: 'not-a-number',
			rawBody: BODY,
			replayWindowSeconds: WINDOW,
			nowSeconds: NOW,
		});

		assert.isFalse(result.valid);
		assert.equal(result.reason, 'missing_timestamp');
	});

	test('rejects a timestamp outside the replay window as a replay', ({ assert }) => {
		const stale = NOW - (WINDOW + 1);
		const result = verifyWebhookSignature({
			secret: SECRET,
			signature: computeWebhookSignature(SECRET, String(stale), BODY),
			timestamp: String(stale),
			rawBody: BODY,
			replayWindowSeconds: WINDOW,
			nowSeconds: NOW,
		});

		assert.isFalse(result.valid);
		assert.equal(result.reason, 'stale_timestamp');
	});

	test('accepts a timestamp at the edge of the replay window', ({ assert }) => {
		const edge = NOW - WINDOW;
		const result = verifyWebhookSignature({
			secret: SECRET,
			signature: computeWebhookSignature(SECRET, String(edge), BODY),
			timestamp: String(edge),
			rawBody: BODY,
			replayWindowSeconds: WINDOW,
			nowSeconds: NOW,
		});

		assert.isTrue(result.valid);
	});
});
