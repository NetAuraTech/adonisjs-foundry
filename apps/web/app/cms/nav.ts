import { permissions } from '#start/permissions';
import type { AdminNavEntry } from '#core/types/nav';

/** Admin navigation entries contributed by the CMS domain. */
export const cmsNavEntries: AdminNavEntry[] = [
	{
		label: 'cms.page.admin.value',
		icon: 'PanelsTopLeft',
		route: 'admin.cms.pages.render',
		permission: permissions.pages.view,
		category: 'content',
	},
	{
		label: 'cms.template.admin.value',
		icon: 'LayoutTemplate',
		route: 'admin.cms.templates.render',
		permission: permissions.templates.view,
		category: 'content',
	},
];
