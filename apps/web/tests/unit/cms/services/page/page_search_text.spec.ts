import { test } from '@japa/runner';
import { extractPageText } from '#cms/services/page/page_search_text';
import type { PageContent } from '#cms/types/page';

/** Builds a minimal block for extraction tests, bypassing strict prop typing. */
function block(type: string, props: Record<string, any>, children?: any[]): any {
	return { id: `b-${type}-${Math.random().toString(36).slice(2)}`, type, props, ...(children ? { children } : {}) };
}

test.group('extractPageText', () => {
	test('collects text from textual blocks and joins with spaces', ({ assert }) => {
		const content: PageContent = {
			blocks: [
				block('title', { text: 'The Title' }),
				block('paragraph', { text: 'A body paragraph.' }),
				block('quote', { text: 'A quote', attribution: 'The Author' }),
			],
		} as unknown as PageContent;

		const text = extractPageText(content);

		assert.include(text, 'The Title');
		assert.include(text, 'A body paragraph.');
		assert.include(text, 'A quote');
		assert.include(text, 'The Author');
	});

	test('strips html tags from htmltext blocks', ({ assert }) => {
		const content: PageContent = {
			blocks: [block('htmltext', { content: '<p>Hello <b>world</b></p>' })],
		} as unknown as PageContent;

		const text = extractPageText(content);

		assert.include(text, 'Hello world');
		assert.isFalse(text.includes('<p>'));
		assert.isFalse(text.includes('<b>'));
	});

	test('collects list items, button labels and field labels', ({ assert }) => {
		const content: PageContent = {
			blocks: [
				block('list', { items: ['alpha', 'beta'] }),
				block('button', { children: 'Click me' }),
				block('field', { label: 'Your name', options: [{ label: 'Option A' }] }),
			],
		} as unknown as PageContent;

		const text = extractPageText(content);

		assert.include(text, 'alpha');
		assert.include(text, 'beta');
		assert.include(text, 'Click me');
		assert.include(text, 'Your name');
		assert.include(text, 'Option A');
	});

	test('recurses into container block children', ({ assert }) => {
		const content: PageContent = {
			blocks: [block('section', {}, [block('paragraph', { text: 'Nested content' })])],
		} as unknown as PageContent;

		const text = extractPageText(content);

		assert.include(text, 'Nested content');
	});

	test('returns an empty string for empty or layout-only content', ({ assert }) => {
		assert.equal(extractPageText({ blocks: [] }), '');

		const layoutOnly = { blocks: [block('section', {}, [block('separator', {})])] } as unknown as PageContent;
		assert.equal(extractPageText(layoutOnly), '');
	});

	test('collapses repeated whitespace into a single space', ({ assert }) => {
		const content: PageContent = {
			blocks: [block('paragraph', { text: 'multi   space\n\ttext' })],
		} as unknown as PageContent;

		const text = extractPageText(content);

		assert.equal(text, 'multi space text');
	});
});
