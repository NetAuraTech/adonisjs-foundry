import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { Validator } from '@seriousme/openapi-schema-validator';
import { registerIdentityApiDocs } from '#transport/identity/api_docs';

/**
 * OpenAPI surface — the generated spec (`/api/v1/openapi.json`) and the
 * interactive docs page (`/api/v1/docs`). Both are public and gated by the
 * `apiDocs` feature flag.
 */
test.group('OpenAPI surface', (group) => {
	// The docs registry is a process-wide singleton populated at import time by
	// the route modules, and a unit test in this same Japa process clears it;
	// re-register the identity surface before each test so these assertions do
	// not depend on test execution order.
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(() => registerIdentityApiDocs());

	test('serves a valid OpenAPI 3.0 document at /api/v1/openapi.json', async ({ client, assert }) => {
		const res = await client.get('/api/v1/openapi.json').accept('json');

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
		const res = await client.get('/api/v1/openapi.json').accept('json');
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
		assert.exists(spec.paths['/api/v1/admin/roles'].post);
		assert.exists(spec.paths['/api/v1/admin/roles/{id}'].put);
		assert.exists(spec.paths['/api/v1/admin/permissions'].get);
		assert.deepEqual(spec.tags, [{ name: 'Permissions' }, { name: 'Roles' }, { name: 'Users' }]);
	});

	test('applies the default security to admin routes only', async ({ client, assert }) => {
		const res = await client.get('/api/v1/openapi.json').accept('json');
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
		const res = await client.get('/api/v1/openapi.json').accept('json');
		const spec = res.body();

		for (const path of Object.keys(spec.paths)) {
			assert.isTrue(path.startsWith('/api/v1/'), `unexpected path ${path} in the spec`);
		}
	});

	test('serves the interactive docs page at /api/v1/docs', async ({ client, assert }) => {
		const res = await client.get('/api/v1/docs');

		res.assertStatus(200);
		assert.include(res.header('content-type') ?? '', 'text/html');
		assert.include(res.text(), '@scalar/api-reference');
		assert.include(res.text(), '/api/v1/openapi.json');
	});
});
