import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';
import { handle } from '#transport/core/rest/rest_adapter';
import DeliveriesResource from '#transport/webhook/rest/deliveries_resource';

/**
 * GET /api/v1/admin/webhooks/deliveries — paginated, filterable inbound
 * webhook delivery log.
 *
 * Thin transport adapter over the `index` endpoint of the
 * {@link DeliveriesResource}; the endpoint declaration is executed by the
 * shared REST pipeline.
 */
@inject()
export default class DeliveriesApiController {
	constructor(protected deliveriesResource: DeliveriesResource) {}

	async index(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.deliveriesResource.endpoints.index);
	}
}
