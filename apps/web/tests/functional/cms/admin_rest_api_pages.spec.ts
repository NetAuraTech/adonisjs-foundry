import emitter from '@adonisjs/core/services/emitter';
import testUtils from '@adonisjs/core/services/test_utils';
import limiter from '@adonisjs/limiter/services/main';
import { test } from '@japa/runner';
import Page from '#cms/models/page/page';
import PageTranslation from '#cms/models/page/page_translation';
import User from '#identity/models/user';
import { createAdminUser } from '#tests/helpers/create_admin_user';
import { resetSharedState } from '#tests/helpers/shared_state';

/**
 * Helper: creates a page with a draft translation and returns both.
 */
async function createPageWithTranslation(
	overrides: Partial<{
		defaultLocale: string;
		locale: string;
		slug: string;
		title: string;
		content: { blocks: any[] };
		status: 'draft' | 'published';
		isHomepage: boolean;
	}> = {},
) {
	const defaultLocale = overrides.defaultLocale ?? 'en';
	const locale = overrides.locale ?? 'en';
	const slug = overrides.slug ?? `test-page-${Date.now()}`;
	const title = overrides.title ?? 'Test Page';
	const content = overrides.content ?? { blocks: [] };
	const status = overrides.status ?? 'draft';
	const isHomepage = overrides.isHomepage ?? false;

	const page = await Page.create({ defaultLocale, createdBy: null, isHomepage });
	const translation = await PageTranslation.create({
		pageId: page.id,
		locale,
		slug,
		title,
		content,
		status: status as any,
	});

	return { page, translation };
}

/**
 * Admin REST API v1 — Pages resource (`/api/v1/admin/pages`).
 *
 * Functional coverage of all 12 endpoints:
 * list, create, show, update, delete, publish, unpublish, setHomepage,
 * create translation, list/restore/toggle revisions.
 */
test.group('Admin REST API v1 — Pages', (group) => {
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(resetSharedState);
	group.each.setup(() => limiter.clear());
	group.each.setup(() => {
		emitter.fake();
		return () => emitter.restore();
	});
	group.each.teardown(() => limiter.clear());

	// ── List ──────────────────────────────────────────────────────

	test('lists pages as a paginated payload', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-list@example.com',
			permissionSlugs: ['pages.view'],
		});
		const token = await User.accessTokens.create(admin);

		await createPageWithTranslation({ slug: 'page-alpha', title: 'Alpha' });
		await createPageWithTranslation({ slug: 'page-beta', title: 'Beta' });
		await createPageWithTranslation({ slug: 'page-gamma', title: 'Gamma' });

		const res = await client
			.get('/api/v1/admin/pages?page=1&perPage=2')
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(200);
		const body = res.body();
		assert.isArray(body.data);
		assert.isAtMost(body.data.length, 2);
		assert.exists(body.metadata);
		assert.exists(body.metadata.total);
		assert.equal(body.metadata.perPage, 2);
		assert.equal(body.metadata.currentPage, 1);
	});

	test('list filters by status', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-status@example.com',
			permissionSlugs: ['pages.view'],
		});
		const token = await User.accessTokens.create(admin);

		await createPageWithTranslation({ slug: 'draft-page', status: 'draft' });
		await createPageWithTranslation({ slug: 'published-page', status: 'published' });

		const res = await client
			.get('/api/v1/admin/pages?status=published')
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(200);
		const slugs = res.body().data.map((p: any) => p.translations?.[0]?.slug);
		assert.isTrue(slugs.includes('published-page'));
	});

	test('list filters by locale', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-locale@example.com',
			permissionSlugs: ['pages.view'],
		});
		const token = await User.accessTokens.create(admin);

		await createPageWithTranslation({ slug: 'en-page', locale: 'en' });
		await createPageWithTranslation({ slug: 'fr-page', locale: 'fr', defaultLocale: 'fr' });

		const res = await client.get('/api/v1/admin/pages?locale=fr').accept('json').bearerToken(token.value!.release());

		res.assertStatus(200);
		const slugs = res.body().data.map((p: any) => p.translations?.[0]?.slug);
		assert.isTrue(slugs.includes('fr-page'));
	});

	test('list filters by search term', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-search@example.com',
			permissionSlugs: ['pages.view'],
		});
		const token = await User.accessTokens.create(admin);

		await createPageWithTranslation({ slug: 'unique-search', title: 'Unique Searchable Title' });
		await createPageWithTranslation({ slug: 'another-page', title: 'Another Page' });

		const res = await client
			.get('/api/v1/admin/pages?search=Unique+Searchable')
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(200);
		const titles = res.body().data.map((p: any) => p.translations?.[0]?.title);
		assert.isTrue(titles.includes('Unique Searchable Title'));
	});

	test('list returns 401 without a token', async ({ client }) => {
		const res = await client.get('/api/v1/admin/pages').accept('json');
		res.assertStatus(401);
	});

	test('list returns 403 without pages.view permission', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'noperm-pages-list@example.com',
			permissionSlugs: [],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client.get('/api/v1/admin/pages').accept('json').bearerToken(token.value!.release());

		res.assertStatus(403);
	});

	// ── Create ────────────────────────────────────────────────────

	test('creates a page and returns it with 201', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-create@example.com',
			permissionSlugs: ['pages.create'],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client
			.post('/api/v1/admin/pages')
			.accept('json')
			.bearerToken(token.value!.release())
			.json({
				locale: 'en',
				slug: 'created-api-page',
				title: 'Created via API',
				content: { blocks: [] },
			});

		res.assertStatus(201);
		const data = res.body().data;
		assert.equal(data.defaultLocale, 'en');
		assert.isArray(data.translations);
		assert.equal(data.translations[0].slug, 'created-api-page');
	});

	test('create returns 422 on invalid payload', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-create-invalid@example.com',
			permissionSlugs: ['pages.create'],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client
			.post('/api/v1/admin/pages')
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ title: 'No locale or slug' });

		res.assertStatus(422);
	});

	test('create returns 403 without pages.create permission', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'noperm-pages-create@example.com',
			permissionSlugs: [],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client
			.post('/api/v1/admin/pages')
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ locale: 'en', slug: 'forbidden', title: 'Forbidden' });

		res.assertStatus(403);
	});

	// ── Show ──────────────────────────────────────────────────────

	test('shows a page by id', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-show@example.com',
			permissionSlugs: ['pages.view'],
		});
		const token = await User.accessTokens.create(admin);

		const { page } = await createPageWithTranslation({ slug: 'shown-page', title: 'Shown Page' });

		const res = await client.get(`/api/v1/admin/pages/${page.id}`).accept('json').bearerToken(token.value!.release());

		res.assertStatus(200);
		assert.equal(res.body().data.id, page.id);
		assert.equal(res.body().data.defaultLocale, 'en');
	});

	test('show returns 404 for an unknown id', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-show-404@example.com',
			permissionSlugs: ['pages.view'],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client.get('/api/v1/admin/pages/999999').accept('json').bearerToken(token.value!.release());

		res.assertStatus(404);
	});

	test('show returns 401 without a token', async ({ client }) => {
		const res = await client.get('/api/v1/admin/pages/1').accept('json');
		res.assertStatus(401);
	});

	// ── Update ────────────────────────────────────────────────────

	test('updates a page translation', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-update@example.com',
			permissionSlugs: ['pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		const { page } = await createPageWithTranslation({ slug: 'before-update', title: 'Before' });

		const res = await client
			.put(`/api/v1/admin/pages/${page.id}`)
			.accept('json')
			.bearerToken(token.value!.release())
			.json({
				locale: 'en',
				slug: 'after-update',
				title: 'After Update',
				content: { blocks: [] },
			});

		res.assertStatus(200);
		const updated = res.body().data.translations.find((t: any) => t.locale === 'en');
		assert.equal(updated.slug, 'after-update');
		assert.equal(updated.title, 'After Update');
	});

	test('update returns 409 on a duplicate slug', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-update-dupe@example.com',
			permissionSlugs: ['pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		await createPageWithTranslation({ slug: 'taken-slug', title: 'Taken' });
		const { page } = await createPageWithTranslation({ slug: 'my-slug', title: 'My Page' });

		const res = await client
			.put(`/api/v1/admin/pages/${page.id}`)
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ locale: 'en', slug: 'taken-slug', title: 'Conflict' });

		res.assertStatus(409);
	});

	test('update returns 404 for an unknown id', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-update-404@example.com',
			permissionSlugs: ['pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client
			.put('/api/v1/admin/pages/999999')
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ locale: 'en', slug: 'no-page', title: 'No Page' });

		res.assertStatus(404);
	});

	// ── Delete ────────────────────────────────────────────────────

	test('deletes a page and returns 204', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-delete@example.com',
			permissionSlugs: ['pages.delete'],
		});
		const token = await User.accessTokens.create(admin);

		const { page } = await createPageWithTranslation({ slug: 'deletable-page' });

		const res = await client
			.delete(`/api/v1/admin/pages/${page.id}`)
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(204);
	});

	test('delete returns 404 for an unknown id', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-delete-404@example.com',
			permissionSlugs: ['pages.delete'],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client.delete('/api/v1/admin/pages/999999').accept('json').bearerToken(token.value!.release());

		res.assertStatus(404);
	});

	test('delete returns 403 without pages.delete permission', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'noperm-pages-delete@example.com',
			permissionSlugs: ['pages.view'],
		});
		const token = await User.accessTokens.create(admin);
		const { page } = await createPageWithTranslation({ slug: 'delete-forbidden' });

		const res = await client
			.delete(`/api/v1/admin/pages/${page.id}`)
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(403);
	});

	// ── Publish / Unpublish ───────────────────────────────────────

	test('publishes a page translation', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-publish@example.com',
			permissionSlugs: ['pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		const { page } = await createPageWithTranslation({ slug: 'publish-me', status: 'draft' });

		const res = await client
			.put(`/api/v1/admin/pages/${page.id}/publish`)
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ locale: 'en' });

		res.assertStatus(200);
		const translation = res.body().data.translations.find((t: any) => t.locale === 'en');
		assert.equal(translation.status, 'published');
	});

	test('publish returns 404 for unknown page', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-publish-404@example.com',
			permissionSlugs: ['pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client
			.put('/api/v1/admin/pages/999999/publish')
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ locale: 'en' });

		res.assertStatus(404);
	});

	test('unpublishes a page translation', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-unpublish@example.com',
			permissionSlugs: ['pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		const { page } = await createPageWithTranslation({ slug: 'unpublish-me', status: 'published' });

		const res = await client
			.put(`/api/v1/admin/pages/${page.id}/unpublish`)
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ locale: 'en' });

		res.assertStatus(200);
		const translation = res.body().data.translations.find((t: any) => t.locale === 'en');
		assert.equal(translation.status, 'draft');
	});

	// ── Set homepage ──────────────────────────────────────────────

	test('sets a page as homepage', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-homepage@example.com',
			permissionSlugs: ['pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		const { page } = await createPageWithTranslation({ slug: 'new-homepage' });

		const res = await client
			.put(`/api/v1/admin/pages/${page.id}/homepage`)
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(200);
		assert.isTrue(res.body().data.isHomepage);
	});

	test('setHomepage returns 404 for unknown page', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-homepage-404@example.com',
			permissionSlugs: ['pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client
			.put('/api/v1/admin/pages/999999/homepage')
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(404);
	});

	// ── Create translation ────────────────────────────────────────

	test('creates a translation for an existing page', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-translate@example.com',
			permissionSlugs: ['pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		const { page } = await createPageWithTranslation({ slug: 'en-only', locale: 'en' });

		const res = await client
			.post(`/api/v1/admin/pages/${page.id}/translations`)
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ locale: 'fr', slug: 'fr-slug', title: 'Titre FR' });

		res.assertStatus(201);
		const translations = res.body().data.translations;
		const fr = translations.find((t: any) => t.locale === 'fr');
		assert.isDefined(fr);
		assert.equal(fr.slug, 'fr-slug');
	});

	test('create translation returns 422 on invalid payload', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-translate-invalid@example.com',
			permissionSlugs: ['pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		const { page } = await createPageWithTranslation({ slug: 'en-only-2' });

		const res = await client
			.post(`/api/v1/admin/pages/${page.id}/translations`)
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ slug: 'missing-locale-and-title' });

		res.assertStatus(422);
	});

	test('create translation returns error for unknown page', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'admin-pages-translate-404@example.com',
			permissionSlugs: ['pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client
			.post('/api/v1/admin/pages/999999/translations')
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ locale: 'fr', slug: 'fr-slug', title: 'Titre' });

		res.assertStatus(500);
	});

	// ── Revisions ─────────────────────────────────────────────────

	test('lists revisions for a translation', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-revisions-list@example.com',
			permissionSlugs: ['pages.view', 'pages.create', 'pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		const createRes = await client
			.post('/api/v1/admin/pages')
			.accept('json')
			.bearerToken(token.value!.release())
			.json({
				locale: 'en',
				slug: `revision-page-${Date.now()}`,
				title: 'Revision Page',
				content: { blocks: [] },
			});
		createRes.assertStatus(201);
		const pageId = createRes.body().data.id;
		const translation = createRes.body().data.translations.find((t: any) => t.locale === 'en');

		await client
			.put(`/api/v1/admin/pages/${pageId}`)
			.accept('json')
			.bearerToken(token.value!.release())
			.json({
				locale: 'en',
				slug: `revision-page-${Date.now()}-updated`,
				title: 'Revision Page Updated',
				content: { blocks: [] },
			});

		const res = await client
			.get(`/api/v1/admin/pages/${pageId}/translations/${translation.id}/revisions`)
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(200);
		assert.isArray(res.body().data);
		assert.isNotEmpty(res.body().data);
	});

	test('list revisions returns empty for unknown translation', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-revisions-404-list@example.com',
			permissionSlugs: ['pages.view'],
		});
		const token = await User.accessTokens.create(admin);

		const { page } = await createPageWithTranslation({ slug: 'no-rev-page' });

		const res = await client
			.get(`/api/v1/admin/pages/${page.id}/translations/999999/revisions`)
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(200);
		assert.isEmpty(res.body().data);
	});

	test('restores a revision', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-revisions-restore@example.com',
			permissionSlugs: ['pages.view', 'pages.update', 'pages.create'],
		});
		const token = await User.accessTokens.create(admin);
		const slug = `restore-page-${Date.now()}`;

		const createRes = await client
			.post('/api/v1/admin/pages')
			.accept('json')
			.bearerToken(token.value!.release())
			.json({
				locale: 'en',
				slug,
				title: 'Original Title',
				content: { blocks: [] },
			});
		createRes.assertStatus(201);
		const pageId = createRes.body().data.id;
		const translation = createRes.body().data.translations.find((t: any) => t.locale === 'en');

		await client
			.put(`/api/v1/admin/pages/${pageId}`)
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ locale: 'en', slug: `${slug}-updated`, title: 'Updated', content: { blocks: [] } });

		const revisionsRes = await client
			.get(`/api/v1/admin/pages/${pageId}/translations/${translation.id}/revisions`)
			.accept('json')
			.bearerToken(token.value!.release());
		const revisionId = revisionsRes.body().data[0].id;

		const res = await client
			.post(`/api/v1/admin/pages/${pageId}/translations/${translation.id}/revisions/${revisionId}/restore`)
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(200);
		assert.isTrue(res.body().data.restored);
	});

	test('restore revision returns 404 for unknown revision', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'admin-revisions-restore-404@example.com',
			permissionSlugs: ['pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		const { page, translation } = await createPageWithTranslation({ slug: 'no-rev-restore' });

		const res = await client
			.post(`/api/v1/admin/pages/${page.id}/translations/${translation.id}/revisions/999999/restore`)
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(404);
	});

	test('toggles revision keep (pin) state', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-revisions-pin@example.com',
			permissionSlugs: ['pages.view', 'pages.update', 'pages.create'],
		});
		const token = await User.accessTokens.create(admin);
		const slug = `pin-page-${Date.now()}`;

		const createRes = await client
			.post('/api/v1/admin/pages')
			.accept('json')
			.bearerToken(token.value!.release())
			.json({
				locale: 'en',
				slug,
				title: 'Pin Page',
				content: { blocks: [] },
			});
		createRes.assertStatus(201);
		const pageId = createRes.body().data.id;
		const translation = createRes.body().data.translations.find((t: any) => t.locale === 'en');

		await client
			.put(`/api/v1/admin/pages/${pageId}`)
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ locale: 'en', slug: `${slug}-updated`, title: 'Updated', content: { blocks: [] } });

		const revisionsRes = await client
			.get(`/api/v1/admin/pages/${pageId}/translations/${translation.id}/revisions`)
			.accept('json')
			.bearerToken(token.value!.release());
		const revisionId = revisionsRes.body().data[0].id;

		const res = await client
			.put(`/api/v1/admin/pages/${pageId}/translations/${translation.id}/revisions/${revisionId}/pin`)
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(200);
		assert.exists(res.body().data.pinned);
	});

	test('toggle revision returns 404 for unknown revision', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'admin-revisions-pin-404@example.com',
			permissionSlugs: ['pages.update'],
		});
		const token = await User.accessTokens.create(admin);

		const { page, translation } = await createPageWithTranslation({ slug: 'no-pin-rev' });

		const res = await client
			.put(`/api/v1/admin/pages/${page.id}/translations/${translation.id}/revisions/999999/pin`)
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(404);
	});
});
