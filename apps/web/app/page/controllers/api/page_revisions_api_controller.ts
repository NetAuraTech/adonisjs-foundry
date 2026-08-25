import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';
import PagesResource from '#rest/pages_resource';
import { handle } from '#rest/rest_adapter';

/**
 * GET  /api/v1/admin/pages/:id/translations/:translationId/revisions — list
 * POST /api/v1/admin/pages/:id/translations/:translationId/revisions/:revisionId/restore — restore
 * PUT  /api/v1/admin/pages/:id/translations/:translationId/revisions/:revisionId/pin — toggle keep
 *
 * Thin transport adapters over the `listRevisions`, `restoreRevision` and
 * `toggleRevision` endpoints of the {@link PagesResource}; the endpoint
 * declarations are executed by the shared REST pipeline.
 */
@inject()
export default class PageRevisionsApiController {
	constructor(protected pagesResource: PagesResource) {}

	async index(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.pagesResource.endpoints.listRevisions);
	}

	async restore(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.pagesResource.endpoints.restoreRevision);
	}

	async toggle(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.pagesResource.endpoints.toggleRevision);
	}
}
