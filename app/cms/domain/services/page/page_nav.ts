import type { AdminNavEntry } from '#types/nav'
import { permissions } from '#start/permissions'

/** Admin navigation entries contributed by the page domain. */
export const pageNavEntries: AdminNavEntry[] = [
  {
    label: 'page.admin.value',
    icon: 'PanelsTopLeft',
    route: 'admin.pages.render',
    permission: permissions.pages.view,
    category: 'content',
  },
]
