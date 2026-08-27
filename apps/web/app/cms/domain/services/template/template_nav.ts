import { permissions } from '#start/permissions';
import type { AdminNavEntry } from '#core/types/nav';

/** Admin navigation entries contributed by the template domain. */
export const templateNavEntries: AdminNavEntry[] = [
	{
		label: 'template.admin.value',
		icon: 'LayoutTemplate',
		route: 'admin.templates.render',
		permission: permissions.templates.view,
		category: 'content',
	},
];
