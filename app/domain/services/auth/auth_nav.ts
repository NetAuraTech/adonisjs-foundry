import type { AdminNavEntry } from '#types/nav'
import { permissions } from '#start/permissions'

/** Admin navigation entries contributed by the auth domain. */
export const authNavEntries: AdminNavEntry[] = [
  {
    label: 'admin.users.value',
    icon: 'Users',
    route: 'admin.users.render',
    permission: permissions.usersView,
    category: 'access_control',
  },
  {
    label: 'admin.roles.value',
    icon: 'ShieldCheck',
    route: 'admin.roles.render',
    permission: permissions.rolesView,
    category: 'access_control',
  },
  {
    label: 'admin.permissions.value',
    icon: 'KeyRound',
    route: 'admin.permissions.render',
    permission: permissions.permissionsView,
    category: 'access_control',
  },
]
