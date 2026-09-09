import { renderInertiaPage } from '#transport/core/helpers/inertia_render';
import type { HttpContext } from '@adonisjs/core/http';
import type { Inertia } from '@adonisjs/inertia';
import type { InertiaPages } from '@adonisjs/inertia/types';

/**
 * Minimal shape of the Inertia view context the `@adonisjs/inertia`
 * middleware injects into `HttpContext`. Declared locally (rather than
 * relying on the package's type augmentation) so the helper reads
 * `ctx.inertia` without the global augmentation in scope — its presence is
 * detected at runtime instead.
 */
interface InertiaViewContext {
	inertia?: Inertia<InertiaPages>;
}

/**
 * Render the 404 response for a request that matched a route whose target
 * resource does not exist (a page slug with no published translation, ...).
 *
 * `ctx.response.notFound()` would answer a bare, body-less 404 and let the
 * raw error leak through; this instead renders the Inertia `errors/not_found`
 * page for browser/Inertia requests — so both initial loads and in-place XHR
 * visits show the error page — and a JSON body for JSON and headless requests.
 * The status is set explicitly because `Inertia#render` only resolves the body
 * and the `X-Inertia` header, never the status code.
 *
 * @param ctx - The request context (reads `request`, `response`, `inertia`).
 * @returns The 404 response body (HTML, Inertia page object, or JSON).
 */
export async function renderNotFound(ctx: HttpContext) {
	const { request, response } = ctx;
	const inertia = (ctx as unknown as InertiaViewContext).inertia;

	response.status(404);

	if (request.wantsJSON() || !inertia) {
		return { error: { code: 'E_NOT_FOUND', message: 'Not found' } };
	}

	return renderInertiaPage(inertia, 'errors/not_found', {});
}
