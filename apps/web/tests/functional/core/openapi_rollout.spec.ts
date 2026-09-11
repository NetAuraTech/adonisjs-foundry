import router from '@adonisjs/core/services/router';
import { test } from '@japa/runner';
import { Validator } from '@seriousme/openapi-schema-validator';
import { registerAccountApiDocs } from '#transport/account/api_docs';
import { registerAuthApiDocs } from '#transport/auth/api_docs';
import { registerCmsApiDocs } from '#transport/cms/api_docs';
import { registerCoreApiDocs } from '#transport/core/api_docs';
import { allApiDocs, getApiDoc } from '#transport/core/openapi/api_docs_registry';
import { buildOpenApiSpec, type ApiRouteSummary } from '#transport/core/openapi/openapi_generator';
import { paginationValidator } from '#transport/core/validators/pagination';
import { registerFileApiDocs } from '#transport/file/api_docs';
import { registerIdentityApiDocs } from '#transport/identity/api_docs';
import { registerLogApiDocs } from '#transport/log/api_docs';

/** HTTP methods that carry JSON payloads and are documented (mirrors the generator). */
const JSON_METHODS: readonly string[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Flatten the framework's route registry into the plain route summaries the
 * generator consumes — one summary per (route, method) pair — without any
 * permission filtering, so the full API surface is covered.
 */
function allRouteSummaries(): ApiRouteSummary[] {
	const summaries: ApiRouteSummary[] = [];

	for (const route of Object.values(router.toJSON()).flat()) {
		if (!route.name) continue;
		for (const method of route.methods) {
			summaries.push({ name: route.name, pattern: route.pattern, method });
		}
	}

	return summaries;
}

/**
 * The route summaries the generator documents: named routes under `/api/v1`
 * on a JSON method (the same predicate the generator applies internally).
 */
function documentableSummaries(summaries: ApiRouteSummary[]): ApiRouteSummary[] {
	return summaries.filter((summary) => summary.pattern.startsWith('/api/v1') && JSON_METHODS.includes(summary.method));
}

/** The `info` / security block, mirroring the production spec. */
const info = { title: 'AdonisJS Foundry API', version: 'v1' };
const securitySchemes = {
	apiToken: { type: 'http', scheme: 'bearer', bearerFormat: 'opaque' },
	session: { type: 'apiKey', in: 'cookie', name: 'adonis-session' },
};

/** Build the full (unscoped) spec from every registered route and doc. */
function buildFullSpec() {
	return buildOpenApiSpec({
		routes: allRouteSummaries(),
		docs: allApiDocs(),
		info,
		securitySchemes,
		pagination: paginationValidator,
	});
}

/**
 * OpenAPI rollout — every registered API route is documented, and the full
 * generated spec passes the OpenAPI 3.0 validator. These tests guard against
 * drift: a new API route added without its docs entry, or a doc that produces
 * an invalid document, fails the suite.
 */
test.group('OpenAPI rollout', (group) => {
	// The docs registry is a process-wide singleton populated at import time
	// by the route modules, and a unit test in this same Japa process clears
	// it; re-register every surface before each test so these assertions do
	// not depend on test execution order.
	group.each.setup(() => {
		registerIdentityApiDocs();
		registerAuthApiDocs();
		registerAccountApiDocs();
		registerCoreApiDocs();
		registerFileApiDocs();
		registerLogApiDocs();
		registerCmsApiDocs();
	});

	test('documents every registered API route (drift guard)', ({ assert }) => {
		const documentable = documentableSummaries(allRouteSummaries());

		// Sanity: the rollout covers every domain, not just identity.
		assert.isAbove(documentable.length, 20, 'expected the full API surface to be registered');

		const missing = documentable.filter((summary) => getApiDoc(summary.name!) === undefined);

		assert.isEmpty(
			missing.map((summary) => `${summary.method} ${summary.pattern} (${summary.name})`),
			'API routes missing from the OpenAPI docs registry',
		);
	});

	test('gives every documented operation a summary', ({ assert }) => {
		const undocumented = [...allApiDocs().entries()].filter(([, doc]) => !doc.summary);

		assert.isEmpty(
			undocumented.map(([name]) => name),
			'docs registered without a summary',
		);
	});

	test('the full generated spec passes the OpenAPI 3.0 validator', async ({ assert }) => {
		const spec = buildFullSpec();

		// The rollout spans every REST domain, so the spec carries multiple tags.
		assert.isAbove(Object.keys(spec.paths).length, 10, 'expected the full API surface in the spec');

		const result = await new Validator().validate(spec);
		assert.isTrue(result.valid, JSON.stringify(result.errors, null, 2));
	});

	test('keeps operation ids unique across the full spec', ({ assert }) => {
		const spec = buildFullSpec();
		const seen = new Set<string>();
		const duplicates: string[] = [];

		for (const operations of Object.values(spec.paths)) {
			for (const operation of Object.values(operations)) {
				if (seen.has(operation.operationId)) {
					duplicates.push(operation.operationId);
				}
				seen.add(operation.operationId);
			}
		}

		assert.isEmpty(duplicates, `duplicate operation ids: ${[...new Set(duplicates)].join(', ')}`);
	});
});
