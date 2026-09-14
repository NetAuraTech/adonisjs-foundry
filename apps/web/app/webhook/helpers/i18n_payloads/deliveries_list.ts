import type { BuildPayloadResult, I18nTranslator } from '#core/contracts/i18n_translator';

/**
 * The flat i18n key mapping for the admin webhook deliveries listing page.
 */
export const DELIVERIES_MAPPING = {
	title: 'webhook.admin.list.title',
	empty: 'webhook.admin.list.empty',
	search: {
		value: 'webhook.admin.search.value',
		placeholder: 'webhook.admin.search.placeholder',
		filter: 'webhook.admin.search.filter',
	},
	receiver: {
		value: 'webhook.admin.receiver.value',
		placeholder: 'webhook.admin.receiver.placeholder',
	},
	status: {
		value: 'webhook.admin.status.value',
		placeholder: 'webhook.admin.status.placeholder',
		received: 'webhook.admin.status.received',
		processed: 'webhook.admin.status.processed',
		failed: 'webhook.admin.status.failed',
	},
	columns: {
		receiver: 'webhook.admin.columns.receiver',
		deliveryId: 'webhook.admin.columns.deliveryId',
		status: 'webhook.admin.columns.status',
		ip: 'webhook.admin.columns.ip',
		receivedOn: 'webhook.admin.columns.receivedOn',
		processedOn: 'webhook.admin.columns.processedOn',
	},
	digest: {
		view: 'webhook.admin.digest.view',
	},
} as const;

/**
 * Shape of the resolved translation payload for the admin webhook deliveries
 * listing page.
 */
export type AdminWebhookDeliveriesTranslations = BuildPayloadResult<typeof DELIVERIES_MAPPING>;

/**
 * Builds the resolved translation payload for the admin webhook deliveries
 * listing page.
 *
 * @param i18n - The request-scoped {@link I18nTranslator}.
 * @returns The deliveries listing `t` object with every UI string resolved.
 */
export function buildWebhookDeliveriesListPayload(i18n: I18nTranslator): AdminWebhookDeliveriesTranslations {
	return i18n.buildPayload(DELIVERIES_MAPPING);
}
