import type { PermissionSlugs } from '#types/permissions';

/**
 * System permission catalog of the maintenance domain: the maintenance-mode
 * toggle entry of the settings surface.
 *
 * The slug values and the {@link MaintenancePermissionSlug} union both derive
 * from this const; the permission seeder persists exactly this matrix.
 */
export const maintenancePermissionCatalog = {
	settings: ['maintenance'],
} as const;

/** Union of every system permission slug owned by the maintenance domain. */
export type MaintenancePermissionSlug = PermissionSlugs<typeof maintenancePermissionCatalog>;
