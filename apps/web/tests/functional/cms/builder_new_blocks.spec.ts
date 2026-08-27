import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';
import PageTranslation from '#cms/models/page/page_translation';
import { PageFactory } from '#factories/cms/page_factory';
import { createAdminUser, CMS_PERMISSIONS } from '#tests/helpers/create_admin_user';
import { parseInertiaPage } from '#tests/helpers/inertia_page';
import { resetSharedState } from '#tests/helpers/shared_state';

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const IFRAME_URL = 'https://www.google.com/maps/embed?pb=abc';

const newBlocksContent: any = {
	blocks: [
		{
			id: 'b-video',
			type: 'video',
			props: { url: YOUTUBE_URL, caption: 'Intro video', aspect: { default: '16:9' } },
		},
		{
			id: 'b-carousel',
			type: 'carousel',
			props: { aspect: { default: '16:9' }, showArrows: true, showDots: true },
			children: [
				{ id: 'b-slide-1', type: 'paragraph', props: { text: 'Slide one body' } },
				{ id: 'b-slide-2', type: 'paragraph', props: { text: 'Slide two body' } },
			],
		},
	],
};

/**
 * Functional seam for the five newer builder block types (video, carousel,
 * list, quote, iframe). Replaces the Playwright E2E which drove the React
 * picker and asserted the rendered DOM. We instead assert the two backend
 * contracts the frontend depends on:
 *   1. the editor save endpoint persists the block tree, and
 *   2. the public page route resolves the block tree through the embed policy
 *      (video → provider embed URL, iframe → allowlisted URL) and serves it
 *      in the Inertia payload the renderer consumes.
 * The React rendering of those blocks (iframe DOM, carousel dots) is a
 * frontend concern with no HTTP seam — it is intentionally not asserted here.
 */
test.group('Builder — new block types', (group) => {
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(resetSharedState);

	test('video and carousel blocks are saved through the editor save endpoint', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'new-blocks-save@example.com',
			permissionSlugs: CMS_PERMISSIONS,
		});
		const page = await PageFactory.with('translations', 1, (translation) =>
			translation.merge({
				locale: 'en',
				slug: 'new-blocks-save-target',
				status: 'draft',
			}),
		).create();
		const translation = await PageTranslation.findByOrFail({ pageId: page.id, locale: 'en' });

		const res = await client
			.post(`/admin/pages/${page.id}/edit`)
			.redirects(0)
			.loginAs(admin)
			.withCsrfToken()
			.header('referer', `/admin/pages/${page.id}/edit`)
			.json({
				locale: 'en',
				slug: 'new-blocks-save-target',
				title: 'New Blocks Save',
				content: newBlocksContent,
			})
			.send();

		res.assertStatus(302);

		await translation.refresh();
		const blocks: any[] = translation.content.blocks;
		const types = blocks.map((b) => b.type);
		assert.includeMembers(types, ['video', 'carousel']);

		const video = blocks.find((b) => b.type === 'video');
		assert.equal(video.props.url, YOUTUBE_URL);
	});

	test('the five new block types resolve and are served on the public page', async ({ client, assert }) => {
		const slug = 'new-blocks-public';
		const content: any = {
			blocks: [
				{
					id: 'b-video',
					type: 'video',
					props: { url: YOUTUBE_URL, caption: 'Intro video', aspect: { default: '16:9' } },
				},
				{
					id: 'b-carousel',
					type: 'carousel',
					props: { aspect: { default: '16:9' }, showArrows: true, showDots: true },
					children: [
						{ id: 'b-slide-1', type: 'paragraph', props: { text: 'Slide one body' } },
						{ id: 'b-slide-2', type: 'paragraph', props: { text: 'Slide two body' } },
					],
				},
				{
					id: 'b-list',
					type: 'list',
					props: { ordered: false, items: ['First bullet', 'Second bullet'] },
				},
				{
					id: 'b-quote',
					type: 'quote',
					props: { text: 'To be or not to be', attribution: 'Shakespeare', variant: 'default' },
				},
				{
					id: 'b-iframe',
					type: 'iframe',
					props: { url: IFRAME_URL, title: 'Office map' },
				},
			],
		};

		await PageFactory.with('translations', 1, (translation) =>
			translation.merge({
				locale: 'en',
				slug,
				status: 'published',
				publishedAt: DateTime.now(),
				content,
			}),
		).create();

		const res = await client.get(`/en/${slug}`).send();

		res.assertStatus(200);
		const pageData = parseInertiaPage(res.text());
		const blocks: any[] = pageData.props.content.blocks;

		const video = blocks.find((b) => b.type === 'video');
		assert.equal(video.props.kind, 'embed');
		assert.include(video.props.embedUrl, 'youtube-nocookie.com/embed/dQw4w9WgXcQ');

		const carousel = blocks.find((b) => b.type === 'carousel');
		assert.lengthOf(carousel.children, 2);

		const list = blocks.find((b) => b.type === 'list');
		assert.deepEqual(list.props.items, ['First bullet', 'Second bullet']);

		const quote = blocks.find((b) => b.type === 'quote');
		assert.equal(quote.props.text, 'To be or not to be');
		assert.equal(quote.props.attribution, 'Shakespeare');

		const iframe = blocks.find((b) => b.type === 'iframe');
		assert.equal(iframe.props.url, IFRAME_URL);
	});
});
