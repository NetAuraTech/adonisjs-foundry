import { permissions } from '#start/permissions';
import type { AdminNavEntry } from '#types/nav';

/** Admin navigation entries contributed by the maintenance domain. */
export const maintenanceNavEntries: AdminNavEntry[] = [
	{
		label: 'admin.settings.maintenance.value',
		icon: 'Wrench',
		route: 'admin.settings.maintenance.render',
		permission: permissions.settings.maintenance,
		category: 'settings',
	},
];
