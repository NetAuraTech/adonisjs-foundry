import router from '@adonisjs/core/services/router';
import { test } from '@japa/runner';
import { Validator } from '@seriousme/openapi-schema-validator';
import { accountApiDocs } from '#transport/account/rest/account_resource';
import { profileEndpointsDocs } from '#transport/account/rest/profile_resource';
import { updateValidator as preferencesValidator } from '#transport/account/validators/preference';
import {
	loginValidator,
	registerValidator,
	forgotPasswordValidator,
	resetPasswordValidator,
} from '#transport/auth/validators/auth';
import { builderOperationValidator, builderPresenceValidator } from '#transport/cms/validators/builder';
import {
	listPageValidator,
	showPageValidator,
	searchPagesValidator,
	createPageValidator,
} from '#transport/cms/validators/page';
import {
	listTemplateValidator,
	showTemplateValidator,
	createBlockTemplateValidator,
	createFromPageValidator,
} from '#transport/cms/validators/template';
import { maintenanceEndpointsDocs } from '#transport/core/rest/maintenance_resource';
import { allApiDocs, getApiDoc, registerApiDoc } from '#transport/core/openapi/api_docs_registry';
import { buildOpenApiSpec, type ApiRouteSummary } from '#transport/core/openapi/openapi_generator';
import { paginationValidator } from '#transport/core/validators/pagination';
import { permissionsEndpointsDocs } from '#transport/identity/rest/permissions_resource';
import { rolesEndpointsDocs } from '#transport/identity/rest/roles_resource';
import { usersEndpointsDocs } from '#transport/identity/rest/users_resource';
import { logsEndpointsDocs } from '#transport/log/rest/logs_resource';
import { filesEndpointsDocs } from '#transport/file/rest/files_resource';
import { foldersEndpointsDocs } from '#transport/file/rest/folders_resource';
import { deliveriesEndpointsDocs } from '#transport/webhook/rest/deliveries_resource';

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
		registerApiDoc('api.v1.admin.identity.users.index', usersEndpointsDocs.index);
		registerApiDoc('api.v1.admin.identity.users.store', usersEndpointsDocs.store);
		registerApiDoc('api.v1.admin.identity.users.show', usersEndpointsDocs.show);
		registerApiDoc('api.v1.admin.identity.users.update', usersEndpointsDocs.update);
		registerApiDoc('api.v1.admin.identity.users.destroy', usersEndpointsDocs.destroy);
		registerApiDoc('api.v1.admin.identity.roles.index', rolesEndpointsDocs.index);
		registerApiDoc('api.v1.admin.identity.roles.store', rolesEndpointsDocs.store);
		registerApiDoc('api.v1.admin.identity.roles.show', rolesEndpointsDocs.show);
		registerApiDoc('api.v1.admin.identity.roles.update', rolesEndpointsDocs.update);
		registerApiDoc('api.v1.admin.identity.roles.destroy', rolesEndpointsDocs.destroy);
		registerApiDoc('api.v1.admin.identity.permissions.index', permissionsEndpointsDocs.index);
		registerApiDoc('api.v1.auth.login.execute', {
			summary: 'Log in',
			tags: ['Auth'],
			request: [{ validator: loginValidator, in: 'body' }],
		});
		registerApiDoc('api.v1.auth.register.store', {
			summary: 'Register a new account',
			tags: ['Auth'],
			request: [{ validator: registerValidator, in: 'body' }],
		});
		registerApiDoc('api.v1.auth.forgot_password.store', {
			summary: 'Request a password-reset email',
			tags: ['Auth'],
			request: [{ validator: forgotPasswordValidator, in: 'body' }],
		});
		registerApiDoc('api.v1.auth.reset_password.store', {
			summary: 'Reset the password with a token',
			tags: ['Auth'],
			request: [{ validator: resetPasswordValidator, in: 'body' }],
		});
		registerApiDoc('api.v1.auth.email_verification.store', { summary: 'Verify the email address with a token', tags: ['Auth'] });
		registerApiDoc('api.v1.auth.accept_invitation.store', { summary: 'Accept an invitation and set a password', tags: ['Auth'] });
		registerApiDoc('api.v1.auth.logout.destroy', { summary: 'Log out', tags: ['Auth'] });
		registerApiDoc('api.v1.auth.me.show', { summary: 'Show the authenticated user', tags: ['Auth'] });
		registerApiDoc('api.v1.account.profile.show', profileEndpointsDocs.show);
		registerApiDoc('api.v1.account.profile.update', profileEndpointsDocs.update);
		registerApiDoc('api.v1.account.account.update', accountApiDocs.update);
		registerApiDoc('api.v1.account.account.destroy', accountApiDocs.destroy);
		registerApiDoc('api.v1.admin.account.preferences.execute', {
			summary: "Update the current user's preferences",
			tags: ['Account'],
			request: [{ validator: preferencesValidator, in: 'body' }],
		});
		registerApiDoc('api.v1.admin.core.maintenance.index', maintenanceEndpointsDocs.index);
		registerApiDoc('api.v1.admin.core.maintenance.update', maintenanceEndpointsDocs.update);
		registerApiDoc('api.v1.admin.core.maintenance.toggle', maintenanceEndpointsDocs.toggle);
		registerApiDoc('api.v1.admin.log.logs.index', logsEndpointsDocs.index);
		registerApiDoc('api.v1.admin.cms.pages.index', {
			summary: 'List pages',
			tags: ['Pages'],
			request: [{ validator: listPageValidator, in: 'query' }],
		});
		registerApiDoc('api.v1.admin.cms.pages.store', {
			summary: 'Create a page',
			tags: ['Pages'],
			request: [{ validator: createPageValidator, in: 'body' }],
		});
		registerApiDoc('api.v1.admin.cms.pages.search', {
			summary: 'Search pages (full-text)',
			tags: ['Pages'],
			request: [{ validator: searchPagesValidator, in: 'query' }],
		});
		registerApiDoc('api.v1.admin.cms.pages.show', {
			summary: 'Show a page',
			tags: ['Pages'],
			request: [{ validator: showPageValidator, in: 'path' }],
		});
		registerApiDoc('api.v1.admin.cms.pages.update', {
			summary: 'Update a page translation',
			tags: ['Pages'],
			request: [{ validator: showPageValidator, in: 'path' }],
		});
		registerApiDoc('api.v1.admin.cms.pages.destroy', {
			summary: 'Delete a page',
			tags: ['Pages'],
			request: [{ validator: showPageValidator, in: 'path' }],
		});
		registerApiDoc('api.v1.admin.cms.pages.publish', {
			summary: 'Publish a page translation',
			tags: ['Pages'],
			request: [{ validator: showPageValidator, in: 'path' }],
		});
		registerApiDoc('api.v1.admin.cms.pages.unpublish', {
			summary: 'Unpublish a page translation',
			tags: ['Pages'],
			request: [{ validator: showPageValidator, in: 'path' }],
		});
		registerApiDoc('api.v1.admin.cms.pages.set_homepage', {
			summary: 'Set a page as the homepage',
			tags: ['Pages'],
			request: [{ validator: showPageValidator, in: 'path' }],
		});
		registerApiDoc('api.v1.admin.cms.page_translations.store', {
			summary: 'Create a page translation',
			tags: ['Pages'],
			request: [{ validator: showPageValidator, in: 'path' }],
		});
		registerApiDoc('api.v1.admin.cms.page_revisions.index', { summary: "List a page translation's revisions", tags: ['Pages'] });
		registerApiDoc('api.v1.admin.cms.page_revisions.restore', { summary: 'Restore a page revision', tags: ['Pages'] });
		registerApiDoc('api.v1.admin.cms.page_revisions.toggle', { summary: "Toggle a page revision's keep flag", tags: ['Pages'] });
		registerApiDoc('api.v1.admin.cms.pages_preview.token', { summary: 'Issue a page preview token', tags: ['Pages'] });
		registerApiDoc('api.v1.admin.cms.templates.index', {
			summary: 'List templates',
			tags: ['Templates'],
			request: [{ validator: listTemplateValidator, in: 'query' }],
		});
		registerApiDoc('api.v1.admin.cms.templates.store', {
			summary: 'Create a block template',
			tags: ['Templates'],
			request: [{ validator: createBlockTemplateValidator, in: 'body' }],
		});
		registerApiDoc('api.v1.admin.cms.templates.update', {
			summary: 'Update a template',
			tags: ['Templates'],
			request: [{ validator: showTemplateValidator, in: 'path' }],
		});
		registerApiDoc('api.v1.admin.cms.templates.destroy', {
			summary: 'Delete a template',
			tags: ['Templates'],
			request: [{ validator: showTemplateValidator, in: 'path' }],
		});
		registerApiDoc('api.v1.admin.cms.templates.create_from_page', {
			summary: 'Create a template from a page',
			tags: ['Templates'],
			request: [{ validator: createFromPageValidator, in: 'body' }],
		});
		registerApiDoc('api.v1.admin.cms.templates_preview.token', { summary: 'Issue a template preview token', tags: ['Templates'] });
		registerApiDoc('api.v1.admin.cms.builder_operations.execute', {
			summary: 'Execute a builder operation',
			tags: ['Builder'],
			request: [{ validator: builderOperationValidator, in: 'body' }],
		});
		registerApiDoc('api.v1.admin.cms.builder_operations.presence', {
			summary: 'Show the builder presence of a translation',
			tags: ['Builder'],
			request: [{ validator: builderPresenceValidator, in: 'path' }],
		});
		registerApiDoc('api.v1.admin.cms.builder_operations.save_draft', { summary: 'Save a builder draft', tags: ['Builder'] });
		registerApiDoc('api.v1.admin.webhook.deliveries.index', deliveriesEndpointsDocs.index);
		registerApiDoc('api.v1.admin.file.files.index', filesEndpointsDocs.index);
		registerApiDoc('api.v1.admin.file.files.store', { summary: 'Upload a file', tags: ['Files'] });
		registerApiDoc('api.v1.admin.file.files.show', filesEndpointsDocs.show);
		registerApiDoc('api.v1.admin.file.files.move', filesEndpointsDocs.move);
		registerApiDoc('api.v1.admin.file.files.destroy', filesEndpointsDocs.destroy);
		registerApiDoc('api.v1.admin.file.files.upsert_alt', filesEndpointsDocs.upsertAlt);
		registerApiDoc('api.v1.admin.file.files.delete_alt', filesEndpointsDocs.deleteAlt);
		registerApiDoc('api.v1.admin.file.folders.index', foldersEndpointsDocs.index);
		registerApiDoc('api.v1.admin.file.folders.store', foldersEndpointsDocs.store);
		registerApiDoc('api.v1.admin.file.folders.show', foldersEndpointsDocs.show);
		registerApiDoc('api.v1.admin.file.folders.children', foldersEndpointsDocs.children);
		registerApiDoc('api.v1.admin.file.folders.update', foldersEndpointsDocs.update);
		registerApiDoc('api.v1.admin.file.folders.destroy', foldersEndpointsDocs.destroy);
		registerApiDoc('api.v1.admin.core.dashboard.index', {
			summary: 'Show the dashboard statistics',
			tags: ['Dashboard'],
		});
		registerApiDoc('core.openapi.spec', { summary: 'Show the generated OpenAPI document', tags: ['OpenAPI'] });
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
