import testUtils from '@adonisjs/core/services/test_utils';
import limiter from '@adonisjs/limiter/services/main';
import { test } from '@japa/runner';
import { Validator } from '@seriousme/openapi-schema-validator';
import User from '#identity/models/user';
import { createAdminUser } from '#tests/helpers/create_admin_user';
import { createVerifiedUser } from '#tests/helpers/create_verified_user';
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
import { registerApiDoc } from '#transport/core/openapi/api_docs_registry';
import { maintenanceEndpointsDocs } from '#transport/core/rest/maintenance_resource';
import { filesEndpointsDocs } from '#transport/file/rest/files_resource';
import { foldersEndpointsDocs } from '#transport/file/rest/folders_resource';
import { permissionsEndpointsDocs } from '#transport/identity/rest/permissions_resource';
import { rolesEndpointsDocs } from '#transport/identity/rest/roles_resource';
import { usersEndpointsDocs } from '#transport/identity/rest/users_resource';
import { logsEndpointsDocs } from '#transport/log/rest/logs_resource';
import { deliveriesEndpointsDocs } from '#transport/webhook/rest/deliveries_resource';

/**
 * OpenAPI surface — the generated spec (`/api/v1/openapi.json`, served by the
 * core API) and the self-hosted interactive docs page (`/api/docs`, served by
 * the front). Both are gated by the `apiDocs` feature flag and require a
 * logged-in session; the spec is scoped to the user's permissions.
 */
test.group('OpenAPI surface', (group) => {
	// The docs registry is a process-wide singleton populated at import time by
	// the route modules, and a unit test in this same Japa process clears it;
	// re-register the whole documented surface before each test so these
	// assertions do not depend on test execution order.
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(() => {
		registerApiDoc('api.v1.account.profile.show', profileEndpointsDocs.show);
		registerApiDoc('api.v1.account.profile.update', profileEndpointsDocs.update);
		registerApiDoc('api.v1.account.account.update', accountApiDocs.update);
		registerApiDoc('api.v1.account.account.destroy', accountApiDocs.destroy);
		registerApiDoc('api.v1.admin.account.preferences.execute', {
			summary: "Update the current user's preferences",
			tags: ['Account'],
			request: [{ validator: preferencesValidator, in: 'body' }],
		});
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
		registerApiDoc('api.v1.auth.email_verification.store', {
			summary: 'Verify the email address with a token',
			tags: ['Auth'],
		});
		registerApiDoc('api.v1.auth.accept_invitation.store', {
			summary: 'Accept an invitation and set a password',
			tags: ['Auth'],
		});
		registerApiDoc('api.v1.auth.logout.destroy', { summary: 'Log out', tags: ['Auth'] });
		registerApiDoc('api.v1.auth.me.show', { summary: 'Show the authenticated user', tags: ['Auth'] });
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
		registerApiDoc('api.v1.admin.cms.page_revisions.index', {
			summary: "List a page translation's revisions",
			tags: ['Pages'],
		});
		registerApiDoc('api.v1.admin.cms.page_revisions.restore', { summary: 'Restore a page revision', tags: ['Pages'] });
		registerApiDoc('api.v1.admin.cms.page_revisions.toggle', {
			summary: "Toggle a page revision's keep flag",
			tags: ['Pages'],
		});
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
		registerApiDoc('api.v1.admin.cms.templates_preview.token', {
			summary: 'Issue a template preview token',
			tags: ['Templates'],
		});
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
		registerApiDoc('api.v1.admin.cms.builder_operations.save_draft', {
			summary: 'Save a builder draft',
			tags: ['Builder'],
		});
		registerApiDoc('api.v1.admin.core.maintenance.index', maintenanceEndpointsDocs.index);
		registerApiDoc('api.v1.admin.core.maintenance.update', maintenanceEndpointsDocs.update);
		registerApiDoc('api.v1.admin.core.maintenance.toggle', maintenanceEndpointsDocs.toggle);
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
		registerApiDoc('api.v1.admin.log.logs.index', logsEndpointsDocs.index);
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
	group.each.setup(() => limiter.clear());
	group.each.teardown(() => limiter.clear());

	test('rejects the spec and the docs page for anonymous visitors', async ({ client }) => {
		// The spec shares the admin API guards (web + api), so an anonymous
		// request surfaces as a JSON 401, like every other admin endpoint.
		const spec = await client.get('/api/v1/openapi.json').accept('json');
		spec.assertStatus(401);

		// The docs page is a browser surface guarded by the web guard only, so
		// an anonymous visitor is redirected to the login page.
		const page = await client.get('/api/docs').redirects(0);
		page.assertStatus(302);
		page.assertHeader('location', '/login');
	});

	test('serves a valid OpenAPI 3.0 document at /api/v1/openapi.json', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'spec-admin@example.com',
			permissionSlugs: [
				'settings.maintenance',
				'users.view',
				'users.create',
				'users.update',
				'users.delete',
				'roles.view',
				'roles.create',
				'roles.update',
				'roles.delete',
			],
		});

		const res = await client.get('/api/v1/openapi.json').accept('json').loginAs(admin);

		res.assertStatus(200);
		const spec = res.body();

		assert.equal(spec.openapi, '3.0.3');
		assert.equal(spec.info.title, 'AdonisJS Foundry API');
		assert.deepEqual(spec.servers, [{ url: '/' }]);
		assert.exists(spec.components.securitySchemes.apiToken);
		assert.exists(spec.components.securitySchemes.session);

		const result = await new Validator().validate(spec);
		assert.isTrue(result.valid, JSON.stringify(result.errors, null, 2));
	});

	test('documents the identity surface end to end', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'spec-identity@example.com',
			permissionSlugs: ['users.view', 'users.create', 'roles.view'],
		});

		const res = await client.get('/api/v1/openapi.json').accept('json').loginAs(admin);
		const spec = res.body();

		const listUsers = spec.paths['/api/v1/admin/users'].get;
		assert.equal(listUsers.operationId, 'api.v1.admin.identity.users.index');
		assert.equal(listUsers.summary, 'List users');
		assert.deepEqual(listUsers.tags, ['Users']);
		const listParams = listUsers.parameters.map((param: { name: string }) => param.name);
		for (const name of ['search', 'role', 'page', 'perPage']) {
			assert.include(listParams, name);
		}

		const createUser = spec.paths['/api/v1/admin/users'].post;
		assert.equal(createUser.operationId, 'api.v1.admin.identity.users.store');
		assert.equal(createUser.requestBody.required, true);
		assert.exists(createUser.requestBody.content['application/json'].schema.properties.email);
		assert.exists(createUser.responses['201']);

		const showUser = spec.paths['/api/v1/admin/users/{id}'].get;
		assert.equal(showUser.operationId, 'api.v1.admin.identity.users.show');
		assert.equal(showUser.parameters[0].name, 'id');
		assert.equal(showUser.parameters[0].in, 'path');
		assert.isTrue(showUser.parameters[0].required);
		assert.equal(showUser.parameters[0].schema.type, 'number');

		assert.exists(spec.paths['/api/v1/admin/roles'].get);
		assert.exists(spec.paths['/api/v1/admin/permissions'].get);
		// Every route without a permission requirement is visible to any
		// authenticated user, so the tag list spans all documented domains,
		// not just the admin surfaces this user can reach.
		assert.deepEqual(spec.tags, [
			{ name: 'Account' },
			{ name: 'Auth' },
			{ name: 'Dashboard' },
			{ name: 'OpenAPI' },
			{ name: 'Permissions' },
			{ name: 'Roles' },
			{ name: 'Users' },
		]);
	});

	test('scopes the spec to the permissions of the requesting user', async ({ client, assert }) => {
		const viewer = await createAdminUser({
			email: 'spec-viewer@example.com',
			permissionSlugs: ['users.view'],
		});

		const res = await client.get('/api/v1/openapi.json').accept('json').loginAs(viewer);
		const spec = res.body();

		// users.view grants the read endpoints…
		assert.exists(spec.paths['/api/v1/admin/users'].get);
		assert.exists(spec.paths['/api/v1/admin/users/{id}'].get);
		// …but not the write ones nor the other admin surfaces.
		assert.isUndefined(spec.paths['/api/v1/admin/users'].post);
		assert.isUndefined(spec.paths['/api/v1/admin/users/{id}'].put);
		assert.isUndefined(spec.paths['/api/v1/admin/roles']);
		assert.isUndefined(spec.paths['/api/v1/admin/permissions']);
		// admin.access (granted by default on the admin role) keeps the
		// dashboard documented.
		assert.exists(spec.paths['/api/v1/admin/dashboard'].get);
	});

	test('keeps only the routes a user without permissions can call', async ({ client, assert }) => {
		const user = await createVerifiedUser({ email: 'spec-noperm@example.com' });

		const res = await client.get('/api/v1/openapi.json').accept('json').loginAs(user);
		const spec = res.body();

		assert.isUndefined(spec.paths['/api/v1/admin/users']);
		assert.isUndefined(spec.paths['/api/v1/admin/roles']);
		assert.isUndefined(spec.paths['/api/v1/admin/dashboard']);
		// Auth-only endpoints (no permission middleware) stay documented.
		assert.exists(spec.paths['/api/v1/profile'].get);
	});

	test('applies the default security to admin routes only', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'spec-security@example.com',
			permissionSlugs: ['users.view'],
		});

		const res = await client.get('/api/v1/openapi.json').accept('json').loginAs(admin);
		const spec = res.body();

		assert.deepEqual(spec.paths['/api/v1/admin/users'].get.security, [{ apiToken: [] }, { session: [] }]);
		assert.deepEqual(spec.components.securitySchemes.session, {
			type: 'apiKey',
			in: 'cookie',
			name: 'adonis-session',
			description: 'Session cookie (adonis-session), set after login (web guard).',
		});
		// Non-admin routes carry no default security; the token-only profile
		// route documents its `api` guard explicitly instead.
		assert.deepEqual(spec.paths['/api/v1/profile'].get.security, [{ apiToken: [] }]);
	});

	test('only documents routes under /api/v1', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'spec-paths@example.com',
			permissionSlugs: ['users.view', 'roles.view'],
		});

		const res = await client.get('/api/v1/openapi.json').accept('json').loginAs(admin);
		const spec = res.body();

		for (const path of Object.keys(spec.paths)) {
			assert.isTrue(path.startsWith('/api/v1/'), `unexpected path ${path} in the spec`);
		}
	});

	test('serves the self-hosted docs page at /api/docs', async ({ client, assert }) => {
		const admin = await createAdminUser({ email: 'spec-page@example.com' });

		const res = await client.get('/api/docs').loginAs(admin);

		res.assertStatus(200);
		assert.include(res.header('content-type') ?? '', 'text/html');
		// The page is a standalone shell: a mount point for the Scalar viewer
		// and the Vite entry point that loads it (the viewer and the spec URL
		// live in the bundled JS, not in the HTML).
		assert.include(res.text(), 'id="scalar-app"');
		assert.include(res.text(), '<script');
	});

	test('throttles the spec per client', async ({ client, assert }) => {
		// Spec generation is comparatively heavy, so the endpoint shares the
		// per-client budget like the rest of the API surface: a user with a
		// budget of 1 gets the spec once, then a 429.
		const user = await createVerifiedUser({ email: 'spec-rate@example.com', apiRateLimit: 1 });
		const token = await User.accessTokens.create(user);
		const release = () => token.value!.release();

		const first = await client.get('/api/v1/openapi.json').accept('json').bearerToken(release());
		first.assertStatus(200);

		const second = await client.get('/api/v1/openapi.json').accept('json').bearerToken(release());
		second.assertStatus(429);
		assert.equal(second.body().error.code, 'E_TOO_MANY_REQUESTS');
	});
});
