import { permissions } from '#start/permissions';
import type { AdminNavEntry } from '#types/nav';

/** Admin navigation entries contributed by the core domain (dashboard link). */
export const coreNavEntries: AdminNavEntry[] = [
	{
		label: 'admin.dashboard.value',
		icon: 'House',
		route: 'admin.dashboard.render',
		permission: permissions.admin.access,
		category: 'no_category',
	},
];
