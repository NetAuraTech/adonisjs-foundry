import { inject } from '@adonisjs/core';
import router from '@adonisjs/core/services/router';
import { enabledAuthGuards } from '#config/auth';
import { sessionCookieName } from '#config/session';
import { allApiDocs } from '#transport/core/openapi/api_docs_registry';
import { buildOpenApiSpec, type ApiRouteSummary, type SecurityScheme } from '#transport/core/openapi/openapi_generator';
import { paginationValidator } from '#transport/core/validators/pagination';
import type { HttpContext } from '@adonisjs/core/http';

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
 * Interactive reference page for the generated spec: a minimal shell that
 * loads Scalar from a CDN and points it at the OpenAPI document. No build
 * step, no bundled assets — the page is an inline string served by the
 * controller.
 */
const DOCS_PAGE = /* html */ `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>AdonisJS Foundry API Documentation</title>
		<style>
			html,
			body {
				height: 100%;
				margin: 0;
			}
			#scalar-app {
				height: 100%;
			}
		</style>
	</head>
	<body>
		<div id="scalar-app"></div>
		<script
			src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1"
			data-configuration='{ "theme": "gnu", "data": { "url": "/api/v1/openapi.json" } }'
		></script>
	</body>
</html>`;

/**
 * GET /api/v1/openapi.json — the OpenAPI document, generated on request from
 * the live route registry and the docs registered by each transport module.
 *
 * GET /api/v1/docs — an interactive reference (Scalar) over that document.
 *
 * Both routes are public but feature-flag gated (`apiDocs`), so the spec
 * never leaks on instances that disable the admin API surface.
 *
 * This is an intentional one-off surface (an "intentional exemption" from the
 * one-controller-one-action rule): the spec document and its interactive UI
 * are two views of the same generated data, so they live in one controller.
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

	/** GET /api/v1/docs — the interactive reference page. */
	docs({ response }: HttpContext) {
		return response.type('html').send(DOCS_PAGE);
	}
}
