import type { PermissionSlugs } from '#types/permissions';

/**
 * System permission catalog of the CMS domain: the page and template
 * management surfaces.
 *
 * The slug values and the {@link CmsPermissionSlug} union both derive from
 * this const; the permission seeder persists exactly this matrix.
 */
export const cmsPermissionCatalog = {
	pages: ['view', 'create', 'update', 'delete', 'publish'],
	templates: ['view', 'create', 'update', 'delete'],
} as const;

/** Union of every system permission slug owned by the CMS domain. */
export type CmsPermissionSlug = PermissionSlugs<typeof cmsPermissionCatalog>;
