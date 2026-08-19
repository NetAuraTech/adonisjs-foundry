import type { AdminNavEntry } from '#types/nav'
import { permissions } from '#start/permissions'

/** Admin navigation entries contributed by the maintenance domain. */
export const maintenanceNavEntries: AdminNavEntry[] = [
  {
    label: 'admin.settings.maintenance.value',
    icon: 'Wrench',
    route: 'admin.settings.maintenance.render',
    permission: permissions.settings.maintenance,
    category: 'settings',
  },
]
