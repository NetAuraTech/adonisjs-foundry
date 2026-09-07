import { inject } from '@adonisjs/core';
import router from '@adonisjs/core/services/router';
import { enabledAuthGuards } from '#config/auth';
import { sessionCookieName } from '#config/session';
import { allApiDocs } from '#transport/core/openapi/api_docs_registry';
import { buildOpenApiSpec, type ApiRouteSummary, type SecurityScheme } from '#transport/core/openapi/openapi_generator';
import { paginationValidator } from '#transport/core/validators/pagination';

/**
 * Security schemes declared in the generated spec. Where the session guard
 * is enabled, admin routes document both schemes as alternatives: external
 * clients authenticate with an opaque API bearer token, in-repo clients with
 * the session cookie. Flavors without the web guard declare `apiToken` only,
 * and the generator's default security follows the declared schemes.
 */
const securitySchemes: Record<string, SecurityScheme> = {
	apiToken: {
		type: 'http',
		scheme: 'bearer',
		bearerFormat: 'opaque',
		description: 'Opaque API access token, sent as a bearer token (API guard).',
	},
	...(enabledAuthGuards.web && {
		session: {
			type: 'apiKey',
			in: 'cookie',
			name: sessionCookieName,
			description: `Session cookie (${sessionCookieName}), set after login (web guard).`,
		},
	}),
};

/** The `info` block identifying the documented API. */
const info = {
	title: 'AdonisJS Foundry API',
	version: 'v1',
	description: 'Versioned REST API of the Foundry admin surface (users, roles, permissions, dashboard, maintenance).',
};

/**
 * GET /api/v1/openapi.json — the OpenAPI document, generated on request from
 * the live route registry and the docs registered by each transport module.
 *
 * The route is public but feature-flag gated (`apiDocs`), so the spec never
 * leaks on instances that disable the admin API surface. The interactive
 * reference UI over this document lives on the front (`/docs`, see
 * `controllers/front/docs_controller.ts`), not here: it is a self-hosted
 * Vite/Edge page, not a view of the generated data.
 */
@inject()
export default class OpenApiController {
	/**
	 * Flatten the framework's route registry into the plain route summaries
	 * the generator consumes: one summary per (route, method) pair.
	 */
	private collectRoutes(): ApiRouteSummary[] {
		return Object.values(router.toJSON())
			.flat()
			.flatMap((route) => route.methods.map((method) => ({ name: route.name, pattern: route.pattern, method })));
	}

	/** GET /api/v1/openapi.json — the generated OpenAPI 3.0 document. */
	spec() {
		return buildOpenApiSpec({
			routes: this.collectRoutes(),
			docs: allApiDocs(),
			info,
			securitySchemes,
			pagination: paginationValidator,
		});
	}
}
