import { inject } from '@adonisjs/core';
import { type RestEndpoint } from '#app/core/rest/rest_adapter';
import PermissionTransformer from '#app/identity/transformers/permission_transformer';
import { ListAllPermissionsAction } from '#identity/actions/permission/list_all_permissions_action';

type PermissionListResult = Awaited<ReturnType<ListAllPermissionsAction['execute']>>;

/**
 * Endpoint declarations for the permissions REST resource (read-only).
 */
export interface PermissionsEndpoints {
	index: RestEndpoint<undefined, unknown, PermissionListResult, PermissionListResult>;
}

/**
 * Declarative permissions REST resource.
 *
 * Owns the read-only permissions endpoint declarations consumed by the REST
 * `handle` adapter (`#app/core/rest/rest_adapter`); the `/api/v1/admin/permissions`
 * controller reduces to a one-line dispatch over `endpoints`.
 */
@inject()
export default class PermissionsResource {
	constructor(protected listAllPermissionsAction: ListAllPermissionsAction) {}

	readonly endpoints: PermissionsEndpoints = {
		index: {
			execute: () => this.listAllPermissionsAction.execute(),
			transform: (entity) => PermissionTransformer.transform(entity),
		},
	};
}
