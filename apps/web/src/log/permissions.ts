import type { PermissionSlugs } from '#types/permissions';

/**
 * System permission catalog of the logging domain: the activity-log surface.
 *
 * The slug values and the {@link LoggingPermissionSlug} union both derive
 * from this const; the permission seeder persists exactly this matrix.
 */
export const loggingPermissionCatalog = {
	logs: ['view'],
} as const;

/** Union of every system permission slug owned by the logging domain. */
export type LoggingPermissionSlug = PermissionSlugs<typeof loggingPermissionCatalog>;
