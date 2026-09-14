import { createHash } from 'node:crypto';
import testUtils from '@adonisjs/core/services/test_utils';
import { QueueManager } from '@adonisjs/queue';
import { test } from '@japa/runner';
import webhooksConfig from '#config/webhooks';
import { computeWebhookSignature } from '#webhook/domain/webhook_signature';
import { ProcessWebhookDeliveryJob } from '#webhook/jobs/process_webhook_delivery_job';
import WebhookDelivery from '#webhook/models/webhook_delivery';
import { WebhookDeliveryStatus } from '#webhook/types/webhook';

/**
 * Functional seam for the inbound-webhook receiver (`POST /webhooks/:receiver`).
 * Exercises the full HTTP contract end to end: HMAC signature verification
 * (valid / invalid / missing / replay), the idempotent record, and the queue
 * dispatch. Two drivers are exercised:
 *
 * - the fake driver (`QueueManager.fake()`) proves the request only records
 *   and enqueues (status stays `received`);
 * - the sync driver (`.env.test` runs `QUEUE_DRIVER=sync`) covers the full
 *   record → dispatch → process path in-memory (status advances to `processed`).
 *
 * The payload is sent as a JSON object so the body parser runs its JSON branch
 * and captures the exact raw body; the signature is computed over the same
 * `JSON.stringify(payload)` string the client transmits.
 */
const secret = webhooksConfig.secret;
const now = () => Math.floor(Date.now() / 1000);

/** Build the `X-Timestamp` / `X-Signature` header values for a raw body. */
function sign(rawBody: string, ts: number) {
	return {
		timestamp: String(ts),
		signature: computeWebhookSignature(secret, String(ts), rawBody),
	};
}

test.group('Webhook receiver', (group) => {
	group.each.setup(() => testUtils.db().truncate());
	group.each.teardown(() => QueueManager.restore());

	test('accepts a validly signed delivery, records it and enqueues processing (fake driver)', async ({
		client,
		assert,
	}) => {
		const fake = QueueManager.fake();
		const payload = { type: 'order.created', id: 'evt_1' };
		const body = JSON.stringify(payload);
		const ts = now();
		const { timestamp, signature } = sign(body, ts);

		const res = await client
			.post('/webhooks/demo')
			.header('x-delivery-id', 'evt_1')
			.header('x-timestamp', timestamp)
			.header('x-signature', signature)
			.json(payload);

		res.assertStatus(202);

		const row = await WebhookDelivery.query().where('receiver', 'demo').where('delivery_id', 'evt_1').first();
		assert.exists(row);
		assert.equal(row!.status, WebhookDeliveryStatus.RECEIVED);

		fake.assertPushed(ProcessWebhookDeliveryJob.name, {
			queue: 'webhook',
			payload: (p: { receiver?: string; payload?: unknown; deliveryId?: number }) =>
				p.receiver === 'demo' && p.deliveryId === row!.id && (p.payload as { id?: string })?.id === 'evt_1',
		});
	});

	test('advances a delivery to processed through the sync driver', async ({ client, assert }) => {
		const payload = { type: 'order.created', id: 'evt_sync' };
		const body = JSON.stringify(payload);
		const ts = now();
		const { timestamp, signature } = sign(body, ts);

		const res = await client
			.post('/webhooks/demo')
			.header('x-delivery-id', 'evt_sync')
			.header('x-timestamp', timestamp)
			.header('x-signature', signature)
			.json(payload);

		res.assertStatus(202);

		const row = await WebhookDelivery.query().where('receiver', 'demo').where('delivery_id', 'evt_sync').first();
		assert.exists(row);
		assert.equal(row!.status, WebhookDeliveryStatus.PROCESSED);
		assert.isNotNull(row!.processedAt);
	});

	test('rejects an invalid signature with 401 and records nothing', async ({ client, assert }) => {
		const payload = { type: 'order.created', id: 'evt_bad' };
		const body = JSON.stringify(payload);
		const ts = now();
		const { timestamp } = sign(body, ts);

		const res = await client
			.post('/webhooks/demo')
			.header('x-delivery-id', 'evt_bad')
			.header('x-timestamp', timestamp)
			.header('x-signature', computeWebhookSignature('wrong-secret', String(ts), body))
			.json(payload);

		res.assertStatus(401);
		assert.equal(res.body().error.code, 'E_WEBHOOK_SIGNATURE');
		assert.isNull(await WebhookDelivery.query().where('receiver', 'demo').first());
	});

	test('rejects a missing signature with 401', async ({ client, assert }) => {
		const payload = { type: 'order.created', id: 'evt_nosig' };
		const ts = now();

		const res = await client.post('/webhooks/demo').header('x-timestamp', String(ts)).json(payload);

		res.assertStatus(401);
		assert.equal(res.body().error.code, 'E_WEBHOOK_SIGNATURE');
		assert.isNull(await WebhookDelivery.query().where('receiver', 'demo').first());
	});

	test('rejects a stale timestamp (replay) with 401', async ({ client, assert }) => {
		const payload = { type: 'order.created', id: 'evt_replay' };
		const body = JSON.stringify(payload);
		const ts = now() - 100_000;
		const { timestamp, signature } = sign(body, ts);

		const res = await client
			.post('/webhooks/demo')
			.header('x-delivery-id', 'evt_replay')
			.header('x-timestamp', timestamp)
			.header('x-signature', signature)
			.json(payload);

		res.assertStatus(401);
		assert.equal(res.body().error.code, 'E_WEBHOOK_TIMESTAMP');
		assert.isNull(await WebhookDelivery.query().where('receiver', 'demo').first());
	});

	test('rejects a missing timestamp with 401', async ({ client, assert }) => {
		const payload = { type: 'order.created', id: 'evt_notime' };
		const body = JSON.stringify(payload);
		const ts = now();

		const res = await client
			.post('/webhooks/demo')
			.header('x-signature', computeWebhookSignature(secret, String(ts), body))
			.json(payload);

		res.assertStatus(401);
		assert.equal(res.body().error.code, 'E_WEBHOOK_TIMESTAMP');
		assert.isNull(await WebhookDelivery.query().where('receiver', 'demo').first());
	});

	test('deduplicates a repeated delivery id (idempotent 202)', async ({ client, assert }) => {
		QueueManager.fake();
		const payload = { type: 'order.created', id: 'evt_dup' };
		const body = JSON.stringify(payload);

		const first = sign(body, now());
		const firstRes = await client
			.post('/webhooks/demo')
			.header('x-delivery-id', 'evt_dup')
			.header('x-timestamp', first.timestamp)
			.header('x-signature', first.signature)
			.json(payload);
		firstRes.assertStatus(202);

		const second = sign(body, now());
		const secondRes = await client
			.post('/webhooks/demo')
			.header('x-delivery-id', 'evt_dup')
			.header('x-timestamp', second.timestamp)
			.header('x-signature', second.signature)
			.json(payload);
		secondRes.assertStatus(202);

		const rows = await WebhookDelivery.query().where('receiver', 'demo').where('delivery_id', 'evt_dup');
		assert.equal(rows.length, 1);
	});

	test('derives a stable delivery id from the payload when no id header is sent', async ({ client, assert }) => {
		QueueManager.fake();
		const payload = { type: 'order.created', id: 'evt_noid' };
		const body = JSON.stringify(payload);
		const ts = now();
		const { timestamp, signature } = sign(body, ts);
		const expected = `digest:${createHash('sha256').update(body).digest('hex')}`;

		const res = await client
			.post('/webhooks/demo')
			.header('x-timestamp', timestamp)
			.header('x-signature', signature)
			.json(payload);

		res.assertStatus(202);
		const row = await WebhookDelivery.query().where('receiver', 'demo').first();
		assert.exists(row);
		assert.equal(row!.deliveryId, expected);
	});
});
