import { permissions } from '#start/permissions';
import type { AdminNavEntry } from '#types/nav';

/** Admin navigation entries contributed by the page domain. */
export const pageNavEntries: AdminNavEntry[] = [
	{
		label: 'page.admin.value',
		icon: 'PanelsTopLeft',
		route: 'admin.pages.render',
		permission: permissions.pages.view,
		category: 'content',
	},
];
