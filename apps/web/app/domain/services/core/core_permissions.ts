import type { PermissionSlugs } from '#types/permissions';

/**
 * System permission catalog of the core domain: the single `admin.access`
 * slug that gates the whole administration area.
 *
 * The slug values and the {@link CorePermissionSlug} union both derive from
 * this const; the permission seeder persists exactly this matrix.
 */
export const corePermissionCatalog = {
	admin: ['access'],
} as const;

/** Union of every system permission slug owned by the core domain. */
export type CorePermissionSlug = PermissionSlugs<typeof corePermissionCatalog>;

/**
 * System role slugs of the core domain — the two roles present in every
 * flavor; the role seeder persists exactly this list.
 */
export const coreRoleSlugs = ['admin', 'user'] as const;

/** Union of every system role slug owned by the core domain. */
export type CoreRoleSlug = (typeof coreRoleSlugs)[number];
