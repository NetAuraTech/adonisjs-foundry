import type { PermissionSlugs } from '#types/permissions';

/**
 * System permission catalog of the page domain: the page management surface.
 *
 * The slug values and the {@link PagePermissionSlug} union both derive from
 * this const; the permission seeder persists exactly this matrix.
 */
export const pagePermissionCatalog = {
	pages: ['view', 'create', 'update', 'delete', 'publish'],
} as const;

/** Union of every system permission slug owned by the page domain. */
export type PagePermissionSlug = PermissionSlugs<typeof pagePermissionCatalog>;
