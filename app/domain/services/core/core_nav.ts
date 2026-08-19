import type { AdminNavEntry } from '#types/nav'
import { permissions } from '#start/permissions'

/** Admin navigation entries contributed by the core domain (dashboard link). */
export const coreNavEntries: AdminNavEntry[] = [
  {
    label: 'admin.dashboard.value',
    icon: 'House',
    route: 'admin.dashboard.render',
    permission: permissions.adminAccess,
    category: 'no_category',
  },
]
