import type { PermissionSlugs } from '#types/permissions';

/**
 * System permission catalog of the auth domain: the user, role and
 * permission management surfaces.
 *
 * The slug values and the {@link AuthPermissionSlug} union both derive from
 * this const; the permission seeder persists exactly this matrix.
 */
export const authPermissionCatalog = {
	users: ['view', 'create', 'update', 'delete', 'manage_roles'],
	roles: ['view', 'create', 'update', 'delete', 'manage_permissions'],
	permissions: ['view', 'create', 'update', 'delete'],
} as const;

/** Union of every system permission slug owned by the auth domain. */
export type AuthPermissionSlug = PermissionSlugs<typeof authPermissionCatalog>;
