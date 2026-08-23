import emitter from '@adonisjs/core/services/emitter';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { PageFactory } from '#cms/factories/page_factory';
import PageRevision from '#cms/models/page/page_revision';
import PageTranslation from '#cms/models/page/page_translation';
import Template from '#cms/models/template/template';
import { createAdminUser, CMS_PERMISSIONS } from '#tests/helpers/create_admin_user';
import { resetSharedState } from '#tests/helpers/shared_state';

const templateContent: any = {
	blocks: [
		{
			id: 'tpl-block-1',
			type: 'paragraph',
			props: { text: 'TemplateApplyFlow marker text' },
		},
	],
};

/**
 * Creates a page with a draft translation and returns both models.
 */
async function createPageWithTranslation(overrides: Partial<{ slug: string }> = {}) {
	const slug = overrides.slug ?? `template-apply-target-${Date.now()}`;
	const page = await PageFactory.with('translations', 1, (translation) =>
		translation.merge({ locale: 'en', slug, status: 'draft' }),
	).create();
	const translation = await PageTranslation.findByOrFail({ pageId: page.id, locale: 'en' });
	return { page, translation };
}

/**
 * Functional seam for the admin "apply a page template" endpoint
 * (`POST /admin/templates/:id/apply`). Replaces the Playwright E2E (drive the
 * editor, open the picker, confirm) with the HTTP contract the action
 * observes: applying a page template replaces the translation content and
 * records a prior revision; applying a block template is rejected with
 * `E_INVALID_TEMPLATE_TYPE`; and the route is gated by `templates.update`.
 */
test.group('Template apply', (group) => {
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(resetSharedState);
	group.each.setup(() => {
		emitter.fake();
		return () => emitter.restore();
	});

	test('applying a page template replaces content and saves a revision', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'template-apply@example.com',
			permissionSlugs: CMS_PERMISSIONS,
		});
		const { page, translation } = await createPageWithTranslation();

		await Template.create({
			name: 'ApplyFlow Template',
			type: 'page',
			blockType: null,
			content: templateContent,
			createdBy: admin.id,
		});

		const template = (await Template.query().where('name', 'ApplyFlow Template').firstOrFail()) as Template;
		const revisionsBefore = await PageRevision.query().where('pageTranslationId', translation.id);

		const res = await client
			.post(`/admin/templates/${template.id}/apply`)
			.redirects(0)
			.loginAs(admin)
			.withCsrfToken()
			.header('referer', `/admin/pages/${page.id}/edit`)
			.json({ pageId: page.id, locale: 'en' })
			.send();

		res.assertStatus(302);

		await translation.refresh();
		const appliedBlocks: any[] = translation.content.blocks;
		assert.lengthOf(appliedBlocks, 1);
		assert.equal(appliedBlocks[0].type, 'paragraph');

		const revisionsAfter = await PageRevision.query().where('pageTranslationId', translation.id);
		assert.lengthOf(revisionsAfter, revisionsBefore.length + 1);
	});

	test('applying a block template to a page is rejected', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'template-apply-block@example.com',
			permissionSlugs: CMS_PERMISSIONS,
		});
		const { page, translation } = await createPageWithTranslation({
			slug: `template-apply-block-${Date.now()}`,
		});

		const template = await Template.create({
			name: 'Block Template To Apply',
			type: 'block',
			blockType: 'section',
			content: templateContent,
			createdBy: admin.id,
		});

		const res = await client
			.post(`/admin/templates/${template.id}/apply`)
			.loginAs(admin)
			.withCsrfToken()
			.header('referer', `/admin/pages/${page.id}/edit`)
			.accept('json')
			.json({ pageId: page.id, locale: 'en' })
			.send();

		res.assertStatus(422);
		assert.equal(res.body().error.code, 'E_INVALID_TEMPLATE_TYPE');

		// The rejected apply must not have touched the translation content.
		await translation.refresh();
		assert.isEmpty(translation.content.blocks);
	});

	test('apply returns 403 without templates.update permission', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'template-apply-noperm@example.com',
			permissionSlugs: ['templates.view'],
		});
		const { page } = await createPageWithTranslation({
			slug: `template-apply-noperm-${Date.now()}`,
		});

		const template = await Template.create({
			name: 'NoPerm Apply Template',
			type: 'page',
			blockType: null,
			content: templateContent,
			createdBy: admin.id,
		});

		const res = await client
			.post(`/admin/templates/${template.id}/apply`)
			.loginAs(admin)
			.withCsrfToken()
			.header('referer', `/admin/pages/${page.id}/edit`)
			.accept('json')
			.json({ pageId: page.id, locale: 'en' })
			.send();

		res.assertStatus(403);
	});
});
