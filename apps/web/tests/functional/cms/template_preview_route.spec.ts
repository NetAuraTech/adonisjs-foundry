import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import Template from '#cms/models/template/template';
import { PreviewTokenHelper } from '#helpers/core/preview_token';
import env from '#start/env';
import { createAdminUser, CMS_PERMISSIONS } from '#tests/helpers/create_admin_user';
import { parseInertiaPage } from '#tests/helpers/inertia_page';
import { resetSharedState } from '#tests/helpers/shared_state';

const previewContent = {
	blocks: [{ id: 'b1', type: 'paragraph', props: { text: 'Preview pipeline marker' } }],
} as any;

/**
 * Functional seam for the token-protected Template preview route
 * (`GET /admin/templates/preview/:id?locale=en&token=xxx`) used for thumbnail
 * capture. Replaces the Playwright E2E: we assert the HTTP contract instead of
 * rasterising a real iframe — the 401 with a coded error for a bad token, the
 * 200 with the template content resolved through the page pipeline for a valid
 * token, and the 302 redirect to /login for an anonymous visitor. The HMAC
 * gate itself is exercised end-to-end (generate → validate).
 */
test.group('Template preview route', (group) => {
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(resetSharedState);

	test('rejects the render without a valid token', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'tpl-preview-deny@example.com',
			permissionSlugs: CMS_PERMISSIONS,
		});
		const template = await Template.create({
			name: 'Preview Deny',
			type: 'block',
			blockType: 'section',
			content: previewContent,
			createdBy: admin.id,
		});

		const res = await client
			.get(`/admin/templates/preview/${template.id}?locale=en&token=bad-token`)
			.loginAs(admin)
			.accept('json')
			.send();

		res.assertStatus(401);
		assert.equal(res.body().error.code, 'E_INVALID_TOKEN');
	});

	test('renders the template through the pipeline with a valid token', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'tpl-preview-allow@example.com',
			permissionSlugs: CMS_PERMISSIONS,
		});
		const template = await Template.create({
			name: 'Preview Allow',
			type: 'block',
			blockType: 'section',
			content: previewContent,
			createdBy: admin.id,
		});

		const helper = new PreviewTokenHelper(env.get('APP_KEY').release());
		const token = helper.generate(template.id, admin.id, 'en');

		const res = await client
			.get(`/admin/templates/preview/${template.id}?locale=en&token=${token}`)
			.loginAs(admin)
			.send();

		res.assertStatus(200);
		const page = parseInertiaPage(res.text());
		assert.equal(page.props.template.id, template.id);
		assert.equal(page.props.template.content.blocks[0].props.text, 'Preview pipeline marker');
	});

	test('requires authentication', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'tpl-preview-anon@example.com',
			permissionSlugs: CMS_PERMISSIONS,
		});
		const template = await Template.create({
			name: 'Preview Anon',
			type: 'block',
			blockType: 'section',
			content: previewContent,
			createdBy: admin.id,
		});

		const helper = new PreviewTokenHelper(env.get('APP_KEY').release());
		const token = helper.generate(template.id, admin.id, 'en');

		const res = await client
			.get(`/admin/templates/preview/${template.id}?locale=en&token=${token}`)
			.redirects(0)
			.send();

		res.assertStatus(302);
		assert.include(res.header('location'), '/login');
	});
});
