import type { PermissionSlugs } from '#types/permissions'

/**
 * System permission catalog of the file domain: the file and folder
 * management surfaces.
 *
 * The slug values and the {@link FilePermissionSlug} union both derive from
 * this const; the permission seeder persists exactly this matrix.
 */
export const filePermissionCatalog = {
  files: ['view', 'create', 'update', 'delete'],
  folders: ['view', 'create', 'update', 'delete'],
} as const

/** Union of every system permission slug owned by the file domain. */
export type FilePermissionSlug = PermissionSlugs<typeof filePermissionCatalog>
