import type { Block, PageContent } from '#cms/types/page';

/**
 * Recursively collects the human-readable text of a page content tree.
 *
 * Only blocks carrying textual content contribute (titles, paragraphs,
 * lists, quotes, buttons, form fields, raw HTML, media captions, image
 * alt text); pure layout blocks (`section`, `grid`, `flex`, `separator`,
 * `icon`) add nothing. Children of container blocks are always visited.
 */
export function extractPageText(content: PageContent): string {
	const parts: string[] = [];
	content.blocks.forEach((block) => extractBlockText(block, parts));
	return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function extractBlockText(block: Block, parts: string[]): void {
	const props = block.props as Record<string, any>;

	switch (block.type) {
		case 'title':
		case 'paragraph':
		case 'quote':
			if (typeof props.text === 'string' && props.text) parts.push(props.text);
			if (typeof props.attribution === 'string' && props.attribution) parts.push(props.attribution);
			break;
		case 'htmltext':
			if (typeof props.content === 'string' && props.content) parts.push(stripHtml(props.content));
			break;
		case 'button':
			if (typeof props.children === 'string' && props.children) parts.push(props.children);
			break;
		case 'list':
			if (Array.isArray(props.items)) {
				props.items.forEach((item) => {
					if (typeof item === 'string' && item) parts.push(item);
				});
			}
			break;
		case 'field':
			if (typeof props.label === 'string' && props.label) parts.push(props.label);
			if (typeof props.helpText === 'string' && props.helpText) parts.push(props.helpText);
			if (Array.isArray(props.options)) {
				props.options.forEach((option: { label?: string }) => {
					if (option && typeof option.label === 'string' && option.label) parts.push(option.label);
				});
			}
			break;
		case 'image':
			if (props.file && typeof props.file.altOverride === 'string' && props.file.altOverride) {
				parts.push(props.file.altOverride);
			}
			break;
		case 'video':
			if (typeof props.caption === 'string' && props.caption) parts.push(props.caption);
			break;
		case 'iframe':
			if (typeof props.title === 'string' && props.title) parts.push(props.title);
			break;
		default:
			break;
	}

	if (block.children?.length) {
		block.children.forEach((child) => extractBlockText(child, parts));
	}
}

/**
 * Strips HTML tags down to their text content, collapsing the removed markup
 * into single spaces.
 */
function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, ' ');
}
