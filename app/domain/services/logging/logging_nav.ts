import type { AdminNavEntry } from '#types/nav'
import { permissions } from '#start/permissions'

/** Admin navigation entries contributed by the logging domain. */
export const loggingNavEntries: AdminNavEntry[] = [
  {
    label: 'admin.logs.value',
    icon: 'ScrollText',
    route: 'admin.logs.render',
    permission: permissions.logsView,
    category: 'settings',
  },
]
