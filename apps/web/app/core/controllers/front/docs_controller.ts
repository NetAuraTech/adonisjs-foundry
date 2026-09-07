import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

/**
 * Serves the self-hosted, interactive API reference at `/docs`.
 *
 * The page is a standalone Edge template (`resources/views/docs.edge`) that
 * loads the Scalar viewer as its own Vite entry point (`inertia/docs.tsx`),
 * pointed at the generated spec. It is the human-facing companion to the
 * `/api/v1/openapi.json` route: no Inertia context, no auth, no API data in
 * the HTML — the document is fetched client-side by the viewer.
 */
@inject()
export default class DocsController {
	/**
	 * `GET /docs` — renders the self-hosted API reference page.
	 *
	 * @returns The rendered `docs` Edge view with an HTML content type.
	 */
	async show({ view, response }: HttpContext) {
		const html = await view.render('docs');

		return response.type('html').send(html);
	}
}
