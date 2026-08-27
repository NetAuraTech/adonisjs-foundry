import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import Template from '#cms/models/template/template';
import { FileFactory } from '#factories/file/file_factory';
import { createAdminUser, CMS_PERMISSIONS } from '#tests/helpers/create_admin_user';
import { parseInertiaPage } from '#tests/helpers/inertia_page';
import { resetSharedState } from '#tests/helpers/shared_state';

const blockContent: any = { blocks: [] };

/**
 * Functional seam for Template thumbnail serialization. The admin templates
 * index renders each template's thumbnail through `TemplateTransformer`, which
 * exposes the preloaded thumbnail as `{ id, url }` (or `null`). Replaces the
 * Playwright E2E that asserted the rendered `<img>`: we assert the Inertia
 * payload the renderer consumes — `{ id, url }` pointing at the stored file
 * when a thumbnail is set, and `null` otherwise.
 */
test.group('Template thumbnail display', (group) => {
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(resetSharedState);

	test('serializes a thumbnail as { id, url } when set', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'tpl-thumb@example.com',
			permissionSlugs: CMS_PERMISSIONS,
		});
		const file = await FileFactory.create();
		const template = await Template.create({
			name: 'Thumbnail Template',
			type: 'page',
			blockType: null,
			description: null,
			content: blockContent,
			thumbnailId: file.id,
			createdBy: admin.id,
		});

		const res = await client.get('/admin/templates').loginAs(admin).send();

		res.assertStatus(200);
		const page = parseInertiaPage(res.text());
		const tpl = (page.props.templates as any[]).find((t) => t.id === template.id);

		assert.isDefined(tpl);
		assert.equal(tpl.thumbnail.id, file.id);
		assert.include(tpl.thumbnail.url, file.filename);
	});

	test('serializes the thumbnail as null when unset', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'tpl-no-thumb@example.com',
			permissionSlugs: CMS_PERMISSIONS,
		});
		await Template.create({
			name: 'No Thumbnail Template',
			type: 'page',
			blockType: null,
			description: null,
			content: blockContent,
			thumbnailId: null,
			createdBy: admin.id,
		});

		const res = await client.get('/admin/templates').loginAs(admin).send();

		res.assertStatus(200);
		const page = parseInertiaPage(res.text());
		const tpl = (page.props.templates as any[]).find((t) => t.name === 'No Thumbnail Template');

		assert.isDefined(tpl);
		assert.isNull(tpl.thumbnail);
	});
});
