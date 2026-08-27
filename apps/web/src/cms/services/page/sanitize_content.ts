import DOMPurify, { type Config } from 'dompurify';
import { JSDOM } from 'jsdom';
import { classifyVideoUrl, isAllowedIframeUrl } from '#cms/services/page/embed_policy';
import type { Block, IframeProps, ListProps, PageContent, QuoteProps, VideoProps } from '#cms/types/page';

// isomorphic-dompurify requires a JSDOM window in a Node environment
const { window } = new JSDOM('');
const purify = DOMPurify(window as unknown as Window & typeof globalThis);

// Export for reuse in builder_sanitize.ts and client-side utilities
export { purify, PURIFY_CONFIG };

/**
 * DOMPurify configuration used for CMS rich-text content.
 *
 * Allows the full set of formatting tags produced by typical rich-text
 * editors (headings, lists, links, images, blockquotes, code) while
 * blocking anything that could execute arbitrary code.
 */
const PURIFY_CONFIG: Config = {
	USE_PROFILES: { html: true },
	ALLOWED_TAGS: [
		'p',
		'br',
		'strong',
		'em',
		'u',
		's',
		'del',
		'ins',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'ul',
		'ol',
		'li',
		'blockquote',
		'pre',
		'code',
		'a',
		'img',
		'table',
		'thead',
		'tbody',
		'tr',
		'th',
		'td',
		'figure',
		'figcaption',
		'hr',
		'br',
		'span',
		'div',
	],
	ALLOWED_ATTR: [
		'href',
		'src',
		'alt',
		'title',
		'target',
		'rel',
		'class',
		'id',
		'width',
		'height',
		'colspan',
		'rowspan',
		'data-*',
	],
	FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
	FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onsubmit'],
};

/**
 * Recursively walks the block tree and sanitises rich-text fields using
 * DOMPurify (server-side, via jsdom): the `content` field of `htmltext`
 * blocks, the `text` field of `paragraph`/`title` blocks, the `caption`
 * field of `video` blocks, the `items` of `list` blocks and the
 * `text`/`attribution` fields of `quote` blocks.
 *
 * Also enforces the embed policy (see `embed_policy`) at save time:
 * `video` URLs that are neither enabled-provider page URLs nor direct media
 * files, and `iframe` URLs outside the configured hostname allowlist, are
 * stored as `null` so the blocks render nothing.
 *
 * Called in `PageService` before any `create` or `update` that persists
 * `PageContent` to the database. `PageResolverService` re-enforces the
 * embed policy at render time.
 *
 * @param content - The `PageContent` to sanitise in-place
 * @returns The same `PageContent` object with all rich-text HTML cleaned
 */
export function sanitizePageContent(content: PageContent): PageContent {
	const sanitizeBlocks = (blocks: Block[]): Block[] =>
		blocks.map((block) => {
			if (block.type === 'htmltext') {
				return {
					...block,
					props: {
						...block.props,
						content: purify.sanitize(
							(block.props as { content: string }).content ?? '',
							PURIFY_CONFIG,
						) as unknown as string,
					},
				};
			}

			if (block.type === 'paragraph' || block.type === 'title') {
				return {
					...block,
					props: {
						...block.props,
						text: purify.sanitize((block.props as { text: string }).text ?? '', PURIFY_CONFIG) as unknown as string,
					},
				};
			}

			if (block.type === 'video') {
				const props = block.props as VideoProps;
				const url = typeof props.url === 'string' ? props.url : '';
				return {
					...block,
					props: {
						...props,
						// Embed policy enforcement at save time: anything that is neither
						// an enabled-provider page URL nor a direct media file is nulled.
						url: url && classifyVideoUrl(url) ? url : null,
						caption:
							typeof props.caption === 'string'
								? (purify.sanitize(props.caption, PURIFY_CONFIG) as unknown as string)
								: props.caption,
					},
				};
			}

			if (block.type === 'iframe') {
				const props = block.props as IframeProps;
				const url = typeof props.url === 'string' ? props.url : '';
				return {
					...block,
					props: {
						...props,
						// Allowlist enforcement at save time (see embed_policy).
						url: isAllowedIframeUrl(url) ? url : null,
					},
				};
			}

			if (block.type === 'list') {
				const props = block.props as ListProps;
				const items = Array.isArray(props.items) ? props.items : [];
				return {
					...block,
					props: {
						...props,
						items: items
							.filter((item): item is string => typeof item === 'string')
							.map((item) => purify.sanitize(item, PURIFY_CONFIG) as unknown as string),
					},
				};
			}

			if (block.type === 'quote') {
				const props = block.props as QuoteProps;
				return {
					...block,
					props: {
						...props,
						text:
							typeof props.text === 'string'
								? (purify.sanitize(props.text, PURIFY_CONFIG) as unknown as string)
								: props.text,
						attribution:
							typeof props.attribution === 'string'
								? (purify.sanitize(props.attribution, PURIFY_CONFIG) as unknown as string)
								: props.attribution,
					},
				};
			}

			if (block.children?.length) {
				return { ...block, children: sanitizeBlocks(block.children) };
			}

			return block;
		});

	return { ...content, blocks: sanitizeBlocks(content.blocks) };
}
