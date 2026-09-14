import factory from '@adonisjs/lucid/factories';
import WebhookDelivery from '#webhook/models/webhook_delivery';
import { WebhookDeliveryStatus } from '#webhook/types/webhook';

export const WebhookDeliveryFactory = factory
	.define(WebhookDelivery, async ({ faker }) => {
		return {
			receiver: faker.lorem.word(),
			deliveryId: faker.string.uuid(),
			status: WebhookDeliveryStatus.RECEIVED,
			payloadDigest: faker.string.hexadecimal({ length: 64, prefix: '' }),
			contentType: 'application/json',
			ip: faker.internet.ip(),
			userAgent: faker.internet.userAgent(),
			error: null,
		};
	})
	.build();
