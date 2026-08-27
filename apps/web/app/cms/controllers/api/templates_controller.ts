import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';
import TemplatesResource from '#app/cms/rest/templates_resource';
import { handle } from '#app/core/rest/rest_adapter';

/**
 * JSON API consumed by the page builder and admin Templates library.
 *
 * Thin transport adapters over the endpoints of the
 * {@link TemplatesResource}; the endpoint declarations are executed by the
 * shared REST pipeline.
 */
@inject()
export default class TemplatesApiController {
	constructor(protected templatesResource: TemplatesResource) {}

	async index(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.templatesResource.endpoints.index);
	}

	async store(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.templatesResource.endpoints.store);
	}

	async createFromPage(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.templatesResource.endpoints.createFromPage);
	}

	async update(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.templatesResource.endpoints.update);
	}

	async destroy(ctx: HttpContext): Promise<void> {
		await handle(ctx, this.templatesResource.endpoints.destroy);
	}
}
