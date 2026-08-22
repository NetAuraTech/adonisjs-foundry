import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';
import PermissionsResource from '#rest/permissions_resource';
import { handle } from '#rest/rest_adapter';

/**
 * GET /api/v1/admin/permissions — list all permissions from the admin REST API.
 *
 * Thin transport adapter over the `index` endpoint of the
 * {@link PermissionsResource}; the endpoint declaration is executed by the
 * shared REST pipeline.
 */
@inject()
export default class PermissionsApiController {
	constructor(protected permissionsResource: PermissionsResource) {}

	async index(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.permissionsResource.endpoints.index);
	}
}
