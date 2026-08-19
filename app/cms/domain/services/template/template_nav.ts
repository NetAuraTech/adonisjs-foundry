import type { AdminNavEntry } from '#types/nav'
import { permissions } from '#start/permissions'

/** Admin navigation entries contributed by the template domain. */
export const templateNavEntries: AdminNavEntry[] = [
  {
    label: 'template.admin.value',
    icon: 'LayoutTemplate',
    route: 'admin.templates.render',
    permission: permissions.templatesView,
    category: 'content',
  },
]
