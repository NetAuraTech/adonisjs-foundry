import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';
import LogsResource from '#rest/logs_resource';
import { handle } from '#rest/rest_adapter';

/**
 * GET /api/v1/admin/logs — paginated, filterable application log entries.
 *
 * Thin transport adapter over the `index` endpoint of the
 * {@link LogsResource}; the endpoint declaration is executed by the shared
 * REST pipeline.
 */
@inject()
export default class LogsApiController {
	constructor(protected logsResource: LogsResource) {}

	async index(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.logsResource.endpoints.index);
	}
}
