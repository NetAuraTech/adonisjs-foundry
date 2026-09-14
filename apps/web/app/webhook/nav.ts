import { permissions } from '#start/permissions';
import type { AdminNavEntry } from '#core/types/nav';

/** Admin navigation entries contributed by the webhook domain. */
export const webhookNavEntries: AdminNavEntry[] = [
	{
		label: 'webhook.admin.value',
		icon: 'Webhook',
		route: 'admin.webhook.deliveries.render',
		permission: permissions.webhooks.view,
		category: 'settings',
	},
];
