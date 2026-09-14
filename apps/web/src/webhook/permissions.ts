/**
 * System permission catalog of the webhook domain: the delivery log surface.
 *
 * The slug values derive from this const; the permission seeder persists
 * exactly this matrix.
 */
export const webhookPermissionCatalog = {
	webhooks: ['view'],
} as const;
