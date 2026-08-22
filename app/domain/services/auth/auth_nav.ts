import { permissions } from '#start/permissions';
import type { AdminNavEntry } from '#types/nav';

/** Admin navigation entries contributed by the auth domain. */
export const authNavEntries: AdminNavEntry[] = [
	{
		label: 'admin.users.value',
		icon: 'Users',
		route: 'admin.users.render',
		permission: permissions.users.view,
		category: 'access_control',
	},
	{
		label: 'admin.roles.value',
		icon: 'ShieldCheck',
		route: 'admin.roles.render',
		permission: permissions.roles.view,
		category: 'access_control',
	},
	{
		label: 'admin.permissions.value',
		icon: 'KeyRound',
		route: 'admin.permissions.render',
		permission: permissions.permissions.view,
		category: 'access_control',
	},
];
