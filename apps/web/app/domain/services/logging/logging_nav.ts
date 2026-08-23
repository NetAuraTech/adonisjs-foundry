import { permissions } from '#start/permissions';
import type { AdminNavEntry } from '#types/nav';

/** Admin navigation entries contributed by the logging domain. */
export const loggingNavEntries: AdminNavEntry[] = [
	{
		label: 'admin.logs.value',
		icon: 'ScrollText',
		route: 'admin.logs.render',
		permission: permissions.logs.view,
		category: 'settings',
	},
];
