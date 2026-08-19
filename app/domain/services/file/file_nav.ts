import type { AdminNavEntry } from '#types/nav'
import { permissions } from '#start/permissions'

/** Admin navigation entries contributed by the file domain. */
export const fileNavEntries: AdminNavEntry[] = [
  {
    label: 'admin.files.value',
    icon: 'Folder',
    route: 'admin.files.render',
    permission: permissions.filesView,
    category: 'content',
  },
]
