import router from '@adonisjs/core/services/router';
import { test } from '@japa/runner';

/**
 * Routes structure integration test — CMS-specific route names.
 *
 * Split out of `tests/integration/routes_structure.spec.ts` so the `inertia`
 * flavor can prune these assertions alongside the CMS route modules.
 */
test.group('Routes structure (CMS)', (group) => {
	group.each.setup(() => {
		router.commit();
	});

	test('CMS admin and public routes are registered on main', ({ assert }) => {
		const json = router.toJSON();
		const routes = json['root'];
		const names = routes.map((r) => r.name).filter(Boolean) as string[];

		const expectedNames = [
			// Admin CMS (page + template)
			'admin.pages.render',
			'admin.pages_create.render',
			'admin.pages_show.render',
			'admin.pages_update.render',
			'admin.templates.render',

			// Public pages
			'page.home',
			'page.localised.render',
			'page.render',
		];

		for (const expectedName of expectedNames) {
			assert.include(names, expectedName, `Expected route "${expectedName}" to be registered`);
		}
	});

	test('public page routes have correct patterns', ({ assert }) => {
		const json = router.toJSON();
		const routes = json['root'];
		const byName = new Map(routes.filter((r) => r.name).map((r) => [r.name!, r]));

		// Home route
		assert.equal(byName.get('page.home')?.pattern, '/');

		// Localised page render
		assert.ok(
			byName.get('page.localised.render')?.pattern.includes(':locale'),
			'Localised render should have :locale param',
		);
	});

	test('CMS REST API resources are registered on main', ({ assert }) => {
		const json = router.toJSON();
		const routes = json['root'].map((r) => r.pattern);

		const expectedPatterns = ['/api/v1/admin/pages', '/api/v1/admin/templates', '/api/v1/admin/builder/operations'];

		for (const pattern of expectedPatterns) {
			assert.include(routes, pattern, `Expected CMS REST API route "${pattern}" to be registered`);
		}
	});
});
