import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';
import PagesResource from '#transport/cms/rest/pages_resource';
import { handle } from '#transport/core/rest/rest_adapter';

/**
 * GET  /api/v1/admin/pages — list pages
 * GET  /api/v1/admin/pages/search — full-text search pages
 * PUT  /api/v1/admin/pages/:id/homepage — set homepage
 *
 * Thin transport adapters over the `index`, `search` and `setHomepage`
 * endpoints of the {@link PagesResource}; the endpoint declarations are
 * executed by the shared REST pipeline.
 */
@inject()
export default class PagesApiController {
	constructor(protected pagesResource: PagesResource) {}

	async index(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.pagesResource.endpoints.index);
	}

	async search(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.pagesResource.endpoints.search);
	}

	async setHomepage(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.pagesResource.endpoints.setHomepage);
	}
}
