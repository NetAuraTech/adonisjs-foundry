import type { AdminNavEntry } from '#types/nav'

/** Admin navigation entries contributed by the template domain. */
export const templateNavEntries: AdminNavEntry[] = [
  {
    label: 'template.admin.value',
    icon: 'LayoutTemplate',
    route: 'admin.templates.render',
    permission: 'templates.manage',
    category: 'content',
  },
]
