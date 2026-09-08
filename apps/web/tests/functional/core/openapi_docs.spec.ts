import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { Validator } from '@seriousme/openapi-schema-validator';
import { createAdminUser } from '#tests/helpers/create_admin_user';
import { createVerifiedUser } from '#tests/helpers/create_verified_user';
import { registerIdentityApiDocs } from '#transport/identity/api_docs';

/**
 * OpenAPI surface — the generated spec (`/api/v1/openapi.json`, served by the
 * core API) and the self-hosted interactive docs page (`/api/docs`, served by
 * the front). Both are gated by the `apiDocs` feature flag and require a
 * logged-in session; the spec is scoped to the user's permissions.
 */
test.group('OpenAPI surface', (group) => {
	// The docs registry is a process-wide singleton populated at import time by
	// the route modules, and a unit test in this same Japa process clears it;
	// re-register the identity surface before each test so these assertions do
	// not depend on test execution order.
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(() => registerIdentityApiDocs());

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
		assert.deepEqual(spec.tags, [{ name: 'Permissions' }, { name: 'Roles' }, { name: 'Users' }]);
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
		assert.isUndefined(spec.paths['/api/v1/profile'].get.security);
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
});
