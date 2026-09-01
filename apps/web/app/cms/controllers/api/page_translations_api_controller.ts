import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';
import PagesResource from '#transport/cms/rest/pages_resource';
import { handle } from '#transport/core/rest/rest_adapter';

/**
 * POST /api/v1/admin/pages/:id/translations — create a page translation from
 * the admin REST API.
 *
 * Thin transport adapter over the `storeTranslation` endpoint of the
 * {@link PagesResource}; the endpoint declaration is executed by the shared
 * REST pipeline.
 */
@inject()
export default class PageTranslationsApiController {
	constructor(protected pagesResource: PagesResource) {}

	async store(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.pagesResource.endpoints.storeTranslation);
	}
}
