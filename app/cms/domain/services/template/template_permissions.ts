import type { PermissionSlugs } from '#types/permissions'

/**
 * System permission catalog of the template domain: the template management
 * surface.
 *
 * The slug values and the {@link TemplatePermissionSlug} union both derive
 * from this const; the permission seeder persists exactly this matrix.
 */
export const templatePermissionCatalog = {
  templates: ['view', 'create', 'update', 'delete'],
} as const

/** Union of every system permission slug owned by the template domain. */
export type TemplatePermissionSlug = PermissionSlugs<typeof templatePermissionCatalog>
