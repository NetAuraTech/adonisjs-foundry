import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { parseInertiaPage } from '#tests/helpers/inertia_page';
import { resetSharedState } from '#tests/helpers/shared_state';

/**
 * Functional seam for the CMS public page-render 404 path: requesting a slug
 * that matches the route pattern but has no page (or only an unpublished
 * translation) must answer 404 with the Inertia `errors/not_found` page for
 * both initial loads and Inertia XHR visits — never a raw body that leaks
 * request internals.
 */
test.group('CMS page render 404', (group) => {
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(resetSharedState);

	test('renders the not-found Inertia page for an unknown slug', async ({ client, assert }) => {
		const res = await client.get('/definitely-not-a-page').send();

		res.assertStatus(404);
		const page = parseInertiaPage(res.text());
		assert.equal(page.component, 'errors/not_found');
		assert.notInclude(res.text(), 'SELECT');
	});

	test('renders the not-found Inertia page for an unknown localised slug', async ({ client, assert }) => {
		const res = await client.get('/en/definitely-not-a-page').send();

		res.assertStatus(404);
		const page = parseInertiaPage(res.text());
		assert.equal(page.component, 'errors/not_found');
	});

	test('answers Inertia XHR visits with the not-found Inertia page', async ({ client, assert }) => {
		const res = await client
			.get('/definitely-not-a-page')
			.header('X-Inertia', 'true')
			.header('X-Inertia-Version', '1')
			.send();

		res.assertStatus(404);
		assert.equal(res.header('x-inertia'), 'true');
		const page = res.body();
		assert.equal(page.component, 'errors/not_found');
		assert.notInclude(res.text(), 'SELECT');
	});
});
