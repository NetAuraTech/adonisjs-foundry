import type {
	Block,
	ButtonProps,
	FlexProps,
	GridProps,
	IconProps,
	MediaAspect,
	PageContent,
	ResponsiveValue,
	SectionProps,
	SeparatorProps,
	TitleProps,
} from '#cms/types/page';
import type { FontSize, ParagraphSpacing, ParagraphVariants } from '@foundry/design-system/tokens';

let seq = 0;

/** Deterministic per seed run: stable, unique block ids. */
const bid = (prefix: string): string => `${prefix}-${String(++seq).padStart(3, '0')}`;

/** Responsive-value shorthand: `default` plus an optional `lg` override. */
const r = <T>(def: T, lg?: T): { default: T; lg?: T } => (lg === undefined ? { default: def } : { default: def, lg });

type Pad = 'none' | 'sm' | 'md' | 'lg' | 'xl';
type Gap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** `section` container: background + uniform padding + children. */
export const section = (
	background: SectionProps['background'],
	paddingY: Pad,
	paddingX: Pad,
	children: Block[],
	id?: string,
	className?: string,
): Block<'section'> => ({
	id: id ?? bid('sec'),
	type: 'section',
	props: {
		background,
		paddingY: r(paddingY),
		paddingX: r(paddingX),
		...(id ? { id } : {}),
		...(className ? { className } : {}),
	},
	children,
});

/** `grid` container: responsive column count + gap. */
export const grid = (
	cols: 1 | 2 | 3 | 4 | 6 | ResponsiveValue<1 | 2 | 3 | 4 | 6>,
	gap: Gap,
	children: Block[],
	alignItems?: GridProps['alignItems'],
): Block<'grid'> => ({
	id: bid('grid'),
	type: 'grid',
	props: {
		cols: typeof cols === 'number' ? r(cols) : cols,
		gap: r(gap),
		...(alignItems ? { alignItems } : {}),
	},
	children,
});

/** `flex` container: direction, gap, alignment, optional background. */
export const flex = (
	children: Block[],
	opts: {
		direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
		gap?: Gap;
		align?: FlexProps['align'];
		justify?: FlexProps['justify'];
		wrap?: boolean;
		background?: FlexProps['background'];
		className?: string;
		as?: FlexProps['as'];
	} = {},
): Block<'flex'> => ({
	id: bid('flex'),
	type: 'flex',
	props: {
		background: opts.background ?? 'none',
		direction: r(opts.direction ?? 'col'),
		gap: r(opts.gap ?? 'sm'),
		align: opts.align ?? 'stretch',
		justify: opts.justify ?? 'start',
		...(opts.wrap !== undefined ? { wrap: opts.wrap } : {}),
		...(opts.as ? { as: opts.as } : {}),
		...(opts.className ? { className: opts.className } : {}),
	},
	children,
});

/** `title` heading, levels 1–4. */
export const title = (
	text: string,
	level: 1 | 2 | 3 | 4,
	color: TitleProps['color'] = 'default',
	highlightColor: TitleProps['highlightColor'] = 'default',
): Block<'title'> => ({
	id: bid('title'),
	type: 'title',
	props: { text, level, color, highlightColor },
});

/** `paragraph` body copy. */
export const para = (
	text: string,
	fs: FontSize = 'base',
	variant: ParagraphVariants = 'muted',
	spacing: ParagraphSpacing = 'base',
	className?: string,
): Block<'paragraph'> => ({
	id: bid('para'),
	type: 'paragraph',
	props: { text, fs, variant, spacing, ...(className ? { className } : {}) },
});

/** Mono, uppercase, tracked section kicker (industrial stamp). */
export const kicker = (text: string, variant: ParagraphVariants = 'primary'): Block<'paragraph'> =>
	para(text, 'sm', variant, 'base', 'font-mono uppercase tracking-[0.3em] text-sm');

/**
 * `button` block. Linkless buttons (`linkType: 'page'` with no route) render
 * as `type="submit"`, which is how a `button` inside a `form` submits it.
 */
export const button = (
	children: string,
	variant: ButtonProps['variant'],
	size: ButtonProps['size'] = 'md',
	link: {
		linkType: ButtonProps['linkType'];
		route?: string;
		routeParams?: Record<string, unknown>;
		url?: string;
		pageId?: number | string;
	} = { linkType: 'page' },
	align: ButtonProps['align'] = 'left',
): Block<'button'> => ({
	id: bid('btn'),
	type: 'button',
	props: {
		children,
		...link,
		variant,
		size,
		align,
		fitContent: true,
		icon: null,
	},
});

/** Route button to another seeded CMS page. */
export const pageButton = (
	children: string,
	slug: string,
	variant: ButtonProps['variant'],
	size: ButtonProps['size'] = 'md',
	align: ButtonProps['align'] = 'left',
): Block<'button'> =>
	button(children, variant, size, { linkType: 'route', route: 'cms.page.render', routeParams: { slug } }, align);

/** External button to a plain URL. */
export const externalButton = (
	children: string,
	url: string,
	variant: ButtonProps['variant'],
	size: ButtonProps['size'] = 'md',
): Block<'button'> => button(children, variant, size, { linkType: 'external', url });

/** `separator` rule. */
export const separator = (
	spacing: SeparatorProps['spacing'] = 'md',
	color: SeparatorProps['color'] = 'primary',
): Block<'separator'> => ({
	id: bid('sep'),
	type: 'separator',
	props: { spacing, color },
});

/** `icon` block (Iconify name + token colors). */
export const icon = (
	name: string,
	color: IconProps['color'] = 'primary',
	background: IconProps['background'] = 'primary-light',
	size = 44,
): Block<'icon'> => ({
	id: bid('icon'),
	type: 'icon',
	props: { name, color, background, size },
});

/** `image` block embedding a seeded demo file (inline alt override). */
export const image = (fileId: number, altOverride: string, className?: string): Block<'image'> => ({
	id: bid('img'),
	type: 'image',
	props: {
		file: { fileId, altKey: null, altOverride },
		...(className ? { className } : {}),
	},
});

/** `video` block (provider URL, CLS-safe aspect box). */
export const video = (url: string, caption: string, aspect: MediaAspect = '16:9'): Block<'video'> => ({
	id: bid('vid'),
	type: 'video',
	props: { url, caption, poster: null, aspect: r(aspect) },
});

/** `carousel` block — one child block per slide. */
export const carousel = (
	slides: Block[],
	aspect: MediaAspect = '16:9',
	showArrows = true,
	showDots = true,
): Block<'carousel'> => ({
	id: bid('crl'),
	type: 'carousel',
	props: { aspect: r(aspect), showArrows, showDots },
	children: slides,
});

/** `list` block. */
export const list = (items: string[], ordered = false): Block<'list'> => ({
	id: bid('list'),
	type: 'list',
	props: { ordered, items },
});

/** `quote` block. */
export const quote = (
	text: string,
	attribution: string,
	variant: 'default' | 'highlight' | 'plain' = 'default',
): Block<'quote'> => ({
	id: bid('quo'),
	type: 'quote',
	props: { text, attribution, variant },
});

/** `iframe` block (allowlist-enforced URL). */
export const iframe = (url: string, title: string, aspect: MediaAspect = '16:9'): Block<'iframe'> => ({
	id: bid('ifr'),
	type: 'iframe',
	props: { url, title, aspect: r(aspect) },
});

/** `form` block bound to the contact execution route. */
export const form = (children: Block[], route = 'cms.contact.execute'): Block<'form'> => ({
	id: bid('form'),
	type: 'form',
	props: { route },
	children,
});

/** `field` block (label + name + type, optional extras). */
export const field = (
	label: string,
	name: string,
	type: string,
	opts: {
		placeholder?: string;
		required?: boolean;
		helpText?: string;
		options?: { value: string; label: string }[];
	} = {},
): Block<'field'> => ({
	id: bid('fld'),
	type: 'field',
	props: {
		label,
		name,
		type,
		required: opts.required ?? true,
		...(opts.placeholder ? { placeholder: opts.placeholder } : {}),
		...(opts.helpText ? { helpText: opts.helpText } : {}),
		...(opts.options ? { options: opts.options } : {}),
	},
});

/** `htmltext` block (markdown, raw HTML allowed). */
export const htmltext = (content: string): Block<'htmltext'> => ({
	id: bid('html'),
	type: 'htmltext',
	props: { content },
});

/** Wrap top-level blocks into a `PageContent`. */
export const pageContent = (blocks: Block[]): PageContent => ({ blocks });
