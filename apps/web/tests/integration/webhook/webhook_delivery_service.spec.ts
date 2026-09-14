import { createHash } from 'node:crypto';
import testUtils from '@adonisjs/core/services/test_utils';
import { QueueManager } from '@adonisjs/queue';
import { test } from '@japa/runner';
import { LogService } from '#log/services/log_service';
import { ProcessWebhookDeliveryJob } from '#webhook/jobs/process_webhook_delivery_job';
import WebhookDelivery from '#webhook/models/webhook_delivery';
import { WebhookDeliveryRepository } from '#webhook/repositories/webhook_delivery_repository';
import { WebhookDeliveryService } from '#webhook/services/webhook_delivery_service';
import { WebhookDeliveryStatus } from '#webhook/types/webhook';

/**
 * Integration seam for the inbound-webhook delivery pipeline: idempotent
 * recording, the dispatch decision, and the status transitions. Runs against
 * the real database; the fake queue driver isolates the dispatch from
 * execution.
 */
test.group('WebhookDeliveryService', (group) => {
	const service = new WebhookDeliveryService(new WebhookDeliveryRepository(), new LogService());

	group.each.setup(() => testUtils.db().truncate());
	group.each.teardown(() => QueueManager.restore());

	test('records a first-time delivery and dispatches its processing', async ({ assert }) => {
		const fake = QueueManager.fake();

		const result = await service.recordDelivery({
			receiver: 'demo',
			deliveryId: 'evt_1',
			rawBody: '{"a":1}',
			payload: { a: 1 },
		});

		assert.isFalse(result.duplicate);

		const row = await WebhookDelivery.query().where('receiver', 'demo').where('delivery_id', 'evt_1').first();
		assert.exists(row);
		assert.equal(row!.status, WebhookDeliveryStatus.RECEIVED);

		fake.assertPushed(ProcessWebhookDeliveryJob.name, {
			queue: 'webhook',
			payload: (p: { receiver?: string; deliveryId?: number; payload?: unknown }) =>
				p.receiver === 'demo' && p.deliveryId === row!.id && (p.payload as { a?: number })?.a === 1,
		});
	});

	test('is idempotent for a duplicate (receiver, deliveryId)', async ({ assert }) => {
		QueueManager.fake();

		await service.recordDelivery({ receiver: 'demo', deliveryId: 'evt_dup', rawBody: '{"a":1}', payload: { a: 1 } });
		const result = await service.recordDelivery({
			receiver: 'demo',
			deliveryId: 'evt_dup',
			rawBody: '{"a":1}',
			payload: { a: 1 },
		});

		assert.isTrue(result.duplicate);

		const rows = await WebhookDelivery.query().where('receiver', 'demo').where('delivery_id', 'evt_dup');
		assert.equal(rows.length, 1);
	});

	test('treats the same delivery id under a different receiver as distinct', async ({ assert }) => {
		QueueManager.fake();

		await service.recordDelivery({ receiver: 'demo', deliveryId: 'evt_shared', rawBody: '{"a":1}', payload: { a: 1 } });
		const result = await service.recordDelivery({
			receiver: 'stripe',
			deliveryId: 'evt_shared',
			rawBody: '{"a":1}',
			payload: { a: 1 },
		});

		assert.isFalse(result.duplicate);

		const rows = await WebhookDelivery.query().where('delivery_id', 'evt_shared');
		assert.equal(rows.length, 2);
	});

	test('processDelivery advances the delivery to processed', async ({ assert }) => {
		QueueManager.fake();
		await service.recordDelivery({ receiver: 'demo', deliveryId: 'evt_proc', rawBody: '{"a":1}', payload: { a: 1 } });

		const row = await WebhookDelivery.query().where('receiver', 'demo').where('delivery_id', 'evt_proc').first();
		assert.exists(row);

		await service.processDelivery({ deliveryId: row!.id, receiver: 'demo', payload: { a: 1 } });

		const updated = await WebhookDelivery.query().where('id', row!.id).first();
		assert.equal(updated!.status, WebhookDeliveryStatus.PROCESSED);
		assert.isNotNull(updated!.processedAt);
	});

	test('markDeliveryFailed records the failure reason', async ({ assert }) => {
		const row = await WebhookDelivery.create({
			receiver: 'demo',
			deliveryId: 'evt_fail',
			status: WebhookDeliveryStatus.RECEIVED,
			payloadDigest: createHash('sha256').update('{"a":1}').digest('hex'),
		});

		await service.markDeliveryFailed(row.id, new Error('upstream 500'));

		const updated = await WebhookDelivery.query().where('id', row.id).first();
		assert.equal(updated!.status, WebhookDeliveryStatus.FAILED);
		assert.equal(updated!.error, 'upstream 500');
	});
});
