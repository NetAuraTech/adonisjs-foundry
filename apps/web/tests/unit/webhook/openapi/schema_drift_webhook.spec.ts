import { test } from '@japa/runner';
import { lucidMeta, pinDrift, pinEnvelope, serializePayload } from '#tests/helpers/openapi_drift';
import { paginatedEnvelope } from '#transport/core/openapi/schemas';
import { webhookDeliverySchema } from '#transport/webhook/rest/deliveries_resource';
import WebhookDeliveryTransformer from '#transport/webhook/transformers/webhook_delivery_transformer';
import { WebhookDelivery } from '#webhook/domain/webhook_delivery';
import { WebhookDeliveryStatus } from '#webhook/types/webhook';

const now = new Date('2026-01-15T10:00:00.000Z');

function makeProcessedDelivery(): WebhookDelivery {
	return WebhookDelivery.fromModel({
		id: 1,
		receiver: 'stripe',
		deliveryId: 'evt_123',
		status: WebhookDeliveryStatus.PROCESSED,
		payloadDigest: 'sha256:abc123',
		contentType: 'application/json',
		ip: '203.0.113.9',
		userAgent: 'Stripe/1.0',
		error: null,
		createdAt: now,
		processedAt: now,
	});
}

/** A delivery just received: no error yet and not processed yet either. */
function makeReceivedDelivery(): WebhookDelivery {
	return WebhookDelivery.fromModel({
		id: 2,
		receiver: 'demo',
		deliveryId: 'evt_456',
		status: WebhookDeliveryStatus.RECEIVED,
		payloadDigest: 'sha256:def456',
		contentType: null,
		ip: null,
		userAgent: null,
		error: null,
		createdAt: now,
		processedAt: null,
	});
}

test.group('OpenAPI drift — webhook schemas', () => {
	test('processed delivery payload is pinned to webhookDeliverySchema', async () => {
		const payload = await serializePayload(new WebhookDeliveryTransformer(makeProcessedDelivery()).toObject());

		pinDrift(webhookDeliverySchema, payload, 'webhookDelivery');
	});

	test('received delivery payload (null contentType, ip and processedAt) is accepted', async () => {
		const payload = await serializePayload(new WebhookDeliveryTransformer(makeReceivedDelivery()).toObject());

		pinDrift(webhookDeliverySchema, payload, 'webhookDelivery');
	});

	test('delivery list envelope conforms to the documented envelope', async () => {
		const payload = await serializePayload(new WebhookDeliveryTransformer(makeProcessedDelivery()).toObject());

		pinEnvelope(
			paginatedEnvelope(webhookDeliverySchema),
			{ data: [payload], metadata: lucidMeta() },
			'delivery list envelope',
		);
	});

	test('a dropped documented field is rejected', async ({ assert }) => {
		const payload = await serializePayload(new WebhookDeliveryTransformer(makeProcessedDelivery()).toObject());
		delete payload.payloadDigest;

		assert.throws(
			() => pinDrift(webhookDeliverySchema, payload, 'webhookDelivery'),
			/missing from payload: \[payloadDigest\]/,
		);
	});
});
