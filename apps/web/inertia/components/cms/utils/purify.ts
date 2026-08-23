import DOMPurify, { type Config } from 'dompurify';

/**
 * Client-side DOMPurify configuration matching the server-side PURIFY_CONFIG.
 * Used by React block components to sanitise user content at render time
 * as a defence-in-depth layer.
 */
export const PURIFY_CONFIG: Config = {
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
 * Sanitises HTML string using DOMPurify on the client.
 * Mirrors server-side sanitization in `sanitize_content.ts`.
 * Skips during SSR (no window) since content is already sanitized server-side.
 */
export function sanitizeHtml(html: string): string {
	// During SSR, window is not available - content already sanitized server-side
	if (typeof window === 'undefined') {
		return html;
	}
	return DOMPurify.sanitize(html, PURIFY_CONFIG);
}
