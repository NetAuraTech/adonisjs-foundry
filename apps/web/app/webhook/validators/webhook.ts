import vine from '@vinejs/vine';
import { WebhookDeliveryStatus } from '#webhook/types/webhook';

const statuses = Object.values(WebhookDeliveryStatus);

export const listWebhookDeliveriesValidator = vine.create({
	receiver: vine.string().trim().maxLength(100).optional(),
	status: vine.enum(statuses).optional(),
	search: vine.string().trim().maxLength(100).optional(),
});
