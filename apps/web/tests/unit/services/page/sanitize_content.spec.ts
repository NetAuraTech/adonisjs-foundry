import { test } from '@japa/runner';
import { sanitizePageContent } from '#cms/domain/services/page/sanitize_content';
import type { PageContent, Block } from '#cms/types/page';

/**
 * Unit tests for `sanitizePageContent`.
 *
 * No mocks needed — this is a pure function operating on plain objects.
 * Tests verify that:
 * - dangerous HTML is stripped from `htmltext` blocks
 * - safe HTML is preserved
 * - non-htmltext blocks are left untouched
 * - the function is non-mutating (returns a new object)
 * - recursion works for nested blocks inside `section` / `grid`
 */
test.group('sanitizePageContent', () => {
	// ─── Helpers ──────────────────────────────────────────────────────────────

	function makeHtmlText(content: string): Block {
		return {
			id: 'ht1',
			type: 'htmltext',
			props: { content, align: 'left' },
		} as Block;
	}

	function makeTitle(): Block {
		return {
			id: 'title1',
			type: 'title',
			props: { text: 'Hello', level: 1, align: 'left', color: null },
		} as Block;
	}

	function makeSection(children: Block[]): Block {
		return {
			id: 'section1',
			type: 'section',
			props: {
				background: 'canvas',
				paddingY: { default: 'md' },
				paddingX: { default: 'md' },
				maxWidth: 'xl',
				rounded: false,
			},
			children,
		} as Block;
	}

	// ─── Non-mutating ─────────────────────────────────────────────────────────

	test('returns a new object — does not mutate the input', ({ assert }) => {
		const content: PageContent = { blocks: [makeTitle()] };
		const result = sanitizePageContent(content);
		assert.notStrictEqual(result, content);
		assert.notStrictEqual(result.blocks, content.blocks);
	});

	// ─── Script injection ─────────────────────────────────────────────────────

	test('strips <script> tags from htmltext content', ({ assert }) => {
		const content: PageContent = {
			blocks: [makeHtmlText('<p>Hello</p><script>alert("xss")</script>')],
		};
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { content: string };
		assert.isFalse(props.content.includes('<script>'));
		assert.isFalse(props.content.includes('alert'));
	});

	test('strips inline event handlers (onclick, onerror, onload)', ({ assert }) => {
		const content: PageContent = {
			blocks: [makeHtmlText('<p onclick="evil()">Click me</p><img src="x" onerror="evil()">')],
		};
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { content: string };
		assert.isFalse(props.content.includes('onclick'));
		assert.isFalse(props.content.includes('onerror'));
		assert.isFalse(props.content.includes('evil()'));
	});

	test('strips <iframe> tags', ({ assert }) => {
		const content: PageContent = {
			blocks: [makeHtmlText('<p>Text</p><iframe src="https://evil.com"></iframe>')],
		};
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { content: string };
		assert.isFalse(props.content.includes('<iframe'));
	});

	test('strips <style> tags', ({ assert }) => {
		const content: PageContent = {
			blocks: [makeHtmlText('<style>body { display: none }</style><p>Hello</p>')],
		};
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { content: string };
		assert.isFalse(props.content.includes('<style>'));
	});

	test('strips javascript: href from anchor tags', ({ assert }) => {
		const content: PageContent = {
			blocks: [makeHtmlText('<a href="javascript:alert(1)">Click</a>')],
		};
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { content: string };
		assert.isFalse(props.content.includes('javascript:'));
	});

	// ─── Safe HTML preservation ───────────────────────────────────────────────

	test('preserves safe paragraph and formatting tags', ({ assert }) => {
		const html = '<p><strong>Bold</strong> and <em>italic</em> text.</p>';
		const content: PageContent = { blocks: [makeHtmlText(html)] };
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { content: string };
		assert.isTrue(props.content.includes('<strong>'));
		assert.isTrue(props.content.includes('<em>'));
		assert.isTrue(props.content.includes('Bold'));
	});

	test('preserves safe anchor tags with href and target', ({ assert }) => {
		const html = '<a href="https://example.com" target="_blank">Link</a>';
		const content: PageContent = { blocks: [makeHtmlText(html)] };
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { content: string };
		assert.isTrue(props.content.includes('href="https://example.com"'));
	});

	test('preserves lists (ul, ol, li)', ({ assert }) => {
		const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
		const content: PageContent = { blocks: [makeHtmlText(html)] };
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { content: string };
		assert.isTrue(props.content.includes('<ul>'));
		assert.isTrue(props.content.includes('<li>'));
	});

	test('preserves headings (h1–h4)', ({ assert }) => {
		const html = '<h2>Section title</h2>';
		const content: PageContent = { blocks: [makeHtmlText(html)] };
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { content: string };
		assert.isTrue(props.content.includes('<h2>'));
	});

	test('preserves blockquote and code tags', ({ assert }) => {
		const html = '<blockquote><p>Quote</p></blockquote><pre><code>const x = 1</code></pre>';
		const content: PageContent = { blocks: [makeHtmlText(html)] };
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { content: string };
		assert.isTrue(props.content.includes('<blockquote>'));
		assert.isTrue(props.content.includes('<code>'));
	});

	// ─── Non-htmltext blocks left untouched ─────────────────────────────────

	test('does not modify non-htmltext blocks', ({ assert }) => {
		const titleBlock = makeTitle();
		const content: PageContent = { blocks: [titleBlock] };
		const result = sanitizePageContent(content);
		assert.deepEqual(result.blocks[0].props, titleBlock.props);
	});

	test('handles empty blocks array', ({ assert }) => {
		const content: PageContent = { blocks: [] };
		const result = sanitizePageContent(content);
		assert.deepEqual(result.blocks, []);
	});

	// ─── Recursion ────────────────────────────────────────────────────────────

	test('sanitises htmltext blocks nested inside a section', ({ assert }) => {
		const content: PageContent = {
			blocks: [makeSection([makeHtmlText('<p>Safe</p><script>evil()</script>')])],
		};
		const result = sanitizePageContent(content);
		const nested = result.blocks[0].children![0].props as { content: string };
		assert.isFalse(nested.content.includes('<script>'));
		assert.isTrue(nested.content.includes('<p>Safe</p>'));
	});

	test('sanitises deeply nested htmltext blocks', ({ assert }) => {
		const content: PageContent = {
			blocks: [makeSection([makeSection([makeHtmlText('<p>Deep</p><iframe src="x"></iframe>')])])],
		};
		const result = sanitizePageContent(content);
		const deep = result.blocks[0].children![0].children![0].props as { content: string };
		assert.isFalse(deep.content.includes('<iframe'));
		assert.isTrue(deep.content.includes('<p>Deep</p>'));
	});

	// ─── Mixed content ────────────────────────────────────────────────────────

	test('processes multiple htmltext blocks in the same array', ({ assert }) => {
		const content: PageContent = {
			blocks: [
				makeHtmlText('<p>First</p><script>x()</script>'),
				makeTitle(),
				makeHtmlText('<p>Second</p><script>y()</script>'),
			],
		};
		const result = sanitizePageContent(content);

		const first = result.blocks[0].props as { content: string };
		const second = result.blocks[2].props as { content: string };

		assert.isFalse(first.content.includes('<script>'));
		assert.isFalse(second.content.includes('<script>'));
		assert.isTrue(first.content.includes('First'));
		assert.isTrue(second.content.includes('Second'));
	});

	// ─── Video blocks ─────────────────────────────────────────────────────────

	test('video: keeps provider URLs from enabled providers unchanged', ({ assert }) => {
		const content: PageContent = {
			blocks: [
				{
					id: 'v1',
					type: 'video',
					props: {
						url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
						poster: null,
						caption: '',
						aspect: { default: '16:9' },
					},
				} as Block,
			],
		};
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { url: string | null };
		assert.equal(props.url, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
	});

	test('video: strips XSS from captions and nulls non-renderable URLs', ({ assert }) => {
		const content: PageContent = {
			blocks: [
				{
					id: 'v2',
					type: 'video',
					props: {
						url: 'https://www.dailymotion.com/video/x123',
						caption: 'Nice <strong>video</strong><script>alert(1)</script>',
						aspect: { default: '16:9' },
					},
				} as Block,
			],
		};
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { url: string | null; caption: string };
		assert.isNull(props.url);
		assert.isFalse(props.caption.includes('<script>'));
		assert.isTrue(props.caption.includes('<strong>'));
	});

	// ─── Iframe blocks ────────────────────────────────────────────────────────

	test('iframe: nulls the URL when the host is not on the allowlist', ({ assert }) => {
		const content: PageContent = {
			blocks: [
				{
					id: 'if1',
					type: 'iframe',
					props: {
						url: 'https://evil.example.com/widget',
						title: 'X',
						aspect: { default: '16:9' },
					},
				} as Block,
			],
		};
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { url: string | null };
		assert.isNull(props.url);
	});

	test('iframe: keeps the URL when the host is on the allowlist', ({ assert }) => {
		const content: PageContent = {
			blocks: [
				{
					id: 'if2',
					type: 'iframe',
					props: {
						url: 'https://www.google.com/maps/embed?pb=abc',
						title: 'Map',
						aspect: { default: '16:9' },
					},
				} as Block,
			],
		};
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { url: string | null };
		assert.equal(props.url, 'https://www.google.com/maps/embed?pb=abc');
	});

	// ─── List blocks ──────────────────────────────────────────────────────────

	test('list: sanitizes each item and drops non-string entries', ({ assert }) => {
		const content: PageContent = {
			blocks: [
				{
					id: 'l1',
					type: 'list',
					props: {
						ordered: false,
						items: ['<em>Safe</em>', '<script>alert(1)</script>Item', 42],
					},
				} as Block,
			],
		};
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { items: string[] };
		assert.lengthOf(props.items, 2);
		assert.equal(props.items[0], '<em>Safe</em>');
		assert.isFalse(props.items[1].includes('<script>'));
		assert.isTrue(props.items[1].includes('Item'));
	});

	// ─── Quote blocks ─────────────────────────────────────────────────────────

	test('quote: strips XSS from text while keeping safe markup', ({ assert }) => {
		const content: PageContent = {
			blocks: [
				{
					id: 'q1',
					type: 'quote',
					props: {
						text: 'To be <em>or not</em><script>alert(1)</script>',
						variant: 'default',
					},
				} as Block,
			],
		};
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { text: string };
		assert.isFalse(props.text.includes('<script>'));
		assert.isTrue(props.text.includes('<em>'));
	});

	test('quote: strips XSS from attribution', ({ assert }) => {
		const content: PageContent = {
			blocks: [
				{
					id: 'q2',
					type: 'quote',
					props: {
						text: 'Quote',
						attribution: '<strong>Hamlet</strong><script>alert(1)</script>',
						variant: 'default',
					},
				} as Block,
			],
		};
		const result = sanitizePageContent(content);
		const props = result.blocks[0].props as { attribution: string };
		assert.isFalse(props.attribution.includes('<script>'));
		assert.isTrue(props.attribution.includes('<strong>'));
	});

	// ─── Carousel blocks ──────────────────────────────────────────────────────

	test('carousel: recurses into slide children', ({ assert }) => {
		const content: PageContent = {
			blocks: [
				{
					id: 'c1',
					type: 'carousel',
					props: { aspect: { default: '16:9' }, showArrows: true, showDots: true },
					children: [makeHtmlText('<p>Slide</p><script>alert(1)</script>')],
				} as Block,
			],
		};
		const result = sanitizePageContent(content);
		const child = result.blocks[0].children![0].props as { content: string };
		assert.isFalse(child.content.includes('<script>'));
		assert.isTrue(child.content.includes('<p>Slide</p>'));
	});
});
