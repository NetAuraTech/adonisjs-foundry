import { test } from '@japa/runner';
import { adminRestApiEnabled } from '#start/routes/admin_rest_api.routes';

/**
 * Feature-flag gating of the `/api/v1` admin surface.
 *
 * The admin REST entry point (`registerAdminRestApiRoutes`) short-circuits
 * before registering any route when the `adminApi` feature flag is off. The
 * `adminRestApiEnabled` predicate makes that gate testable without booting an
 * app per flag state.
 */
test.group('REST API feature-flag gating', () => {
	test('admin REST surface is enabled when adminApi is on', ({ assert }) => {
		assert.isTrue(adminRestApiEnabled({ adminApi: true }));
	});

	test('admin REST surface is disabled when adminApi is off', ({ assert }) => {
		assert.isFalse(adminRestApiEnabled({ adminApi: false }));
	});
});
