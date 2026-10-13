import {
	button,
	carousel,
	field,
	flex,
	form,
	grid,
	iframe,
	icon,
	image,
	htmltext,
	kicker,
	list,
	pageButton,
	para,
	quote,
	separator,
	section,
	title,
	video,
} from './helpers.js';
import type { PageContent } from '#cms/types/page';

/**
 * Showcase page (EN). Renders every one of the 17 block types with realistic
 * content, grouped by family, so a screenshot of this page doubles as block
 * documentation.
 *
 * @param files - demo image filename → file id map (see `ensureDemoFiles`).
 */
export const showcaseEN = (files: Record<string, number>): PageContent => ({
	blocks: [
		// ── Header ─────────────────────────────────────────────────────────────
		section(
			'surface',
			'xl',
			'md',
			[
				flex(
					[
						kicker('Showcase — all 17 blocks'),
						title('Every block, on display', 1),
						para(
							'This page renders each of the 17 block types with realistic content. Edit it in the builder to see how the trees are shaped.',
							'base',
							'muted',
							'base',
							'max-w-2xl',
						),
					],
					{ direction: 'col', gap: 'md' },
				),
			],
			'header',
		),

		// ── 01 Typography ──────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				kicker('01 — Typography'),
				title('Heading one — the anvil', 1),
				title('Heading two — the forge', 2),
				title('Heading three — the tongs', 3),
				title('Heading four — the trowel', 4),
				separator('md', 'primary'),
				para(
					'Default paragraph (ink). The quick brown fox jumps over the lazy dog. 0123456789 ?!@# — body set in IBM Plex Sans on a bone canvas.',
				),
				para('Muted paragraph — the secondary weight for supporting copy, captions and meta lines.', 'base', 'muted'),
				para(
					'Kicker style — mono, uppercase, tracked, in molten orange. Use it for section stamps.',
					'sm',
					'primary',
					'base',
					'font-mono uppercase tracking-[0.25em] text-sm',
				),
				quote(
					'A highlighted quote — brass on sunken, for pull quotes and principles.',
					'Highlight variant',
					'highlight',
				),
				quote('A plain quote — no chrome, just the words and the attribution.', 'Plain variant', 'plain'),
				list(
					[
						'Section — the layout container',
						'Grid — responsive columns',
						'Flex — directional flow',
						'Title — headings 1 to 4',
						'Paragraph — body copy',
					],
					true,
				),
				list(['Button', 'Separator', 'Icon', 'Form + Field', 'HTML / Markdown']),
			],
			'typography',
		),

		// ── 02 Layouts ─────────────────────────────────────────────────────────
		section(
			'surface',
			'xl',
			'md',
			[
				kicker('02 — Layouts'),
				title('Section, grid and flex', 2),
				grid({ default: 1, lg: 3 }, 'md', [
					section(
						'canvas',
						'md',
						'md',
						[
							title('Three columns', 4),
							para('lg:3 in the grid block — one column below the lg breakpoint.', 'sm', 'muted'),
						],
						undefined,
						'card',
					),
					section(
						'canvas',
						'md',
						'md',
						[
							title('Equal heights', 4),
							para('Grid items stretch by default; short cards still fill their row.', 'sm', 'muted'),
						],
						undefined,
						'card',
					),
					section(
						'canvas',
						'md',
						'md',
						[
							title('Nested sections', 4),
							para('Sections nest freely — this one is a card inside a grid inside a section.', 'sm', 'muted'),
						],
						undefined,
						'card',
					),
				]),
				flex(
					[
						flex([para('row / 1', 'sm', 'ink', 'base', 'font-mono uppercase tracking-[0.2em]')], {
							direction: 'col',
							gap: 'xs',
							background: 'primary-light',
							className: 'flex-1 p-6',
						}),
						flex([para('row / 2', 'sm', 'ink', 'base', 'font-mono uppercase tracking-[0.2em]')], {
							direction: 'col',
							gap: 'xs',
							background: 'secondary-light',
							className: 'flex-1 p-6',
						}),
						flex([para('row / 3', 'sm', 'ink', 'base', 'font-mono uppercase tracking-[0.2em]')], {
							direction: 'col',
							gap: 'xs',
							background: 'tertiary-light',
							className: 'flex-1 p-6',
						}),
					],
					{ direction: 'row', gap: 'md', wrap: true },
				),
				grid({ default: 1, md: 2 }, 'md', [
					section(
						'sunken',
						'md',
						'md',
						[
							title('Half width', 4),
							para('md:2 — two up from the md breakpoint, one column on phones.', 'sm', 'muted'),
						],
						undefined,
						'card',
					),
					section(
						'sunken',
						'md',
						'md',
						[
							title('Sunken background', 4),
							para('The section background scale goes from canvas to sunken to the full palette.', 'sm', 'muted'),
						],
						undefined,
						'card',
					),
				]),
			],
			'layouts',
		),

		// ── 03 Media ───────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				kicker('03 — Media'),
				title('Image, video, carousel and iframe', 2),
				image(files['steel-plates.png'], 'Riveted steel plates, brass column', 'w-full'),
				carousel(
					[
						image(files['specimen-grid.png'], 'Specimen grid — riveted plates'),
						image(files['molten-flow.png'], 'Molten flow along the channel'),
						image(files['spark-burst.png'], 'Sparks from the forge'),
						image(files['brass-gauge.png'], 'Brass gauge at the red line'),
					],
					'16:9',
				),
				video(
					'https://www.youtube.com/watch?v=SONvkc3D-o0',
					'Big Buck Bunny — Blender Foundation. The video block handles provider URLs and direct media files inside a CLS-safe aspect box.',
				),
				iframe(
					'https://maps.google.com/maps?q=Paris&z=13&output=embed',
					'Map — Paris (Google Maps embed, allowlist-enforced)',
				),
			],
			'media',
		),

		// ── 04 Controls ────────────────────────────────────────────────────────
		section(
			'surface',
			'xl',
			'md',
			[
				kicker('04 — Controls'),
				title('Buttons, icons and a working form', 2),
				flex(
					[
						button('Primary', 'primary', 'md', {
							linkType: 'external',
							url: 'https://github.com/NetAuraTech/adonisjs-foundry',
						}),
						button('Secondary', 'secondary', 'md', {
							linkType: 'external',
							url: 'https://github.com/NetAuraTech/adonisjs-foundry',
						}),
						button('Outline', 'outline', 'md', {
							linkType: 'external',
							url: 'https://github.com/NetAuraTech/adonisjs-foundry',
						}),
						button('Danger', 'danger', 'md', {
							linkType: 'external',
							url: 'https://github.com/NetAuraTech/adonisjs-foundry',
						}),
						button('Success', 'success', 'md', {
							linkType: 'external',
							url: 'https://github.com/NetAuraTech/adonisjs-foundry',
						}),
						button('Link muted', 'link_muted', 'md', {
							linkType: 'external',
							url: 'https://github.com/NetAuraTech/adonisjs-foundry',
						}),
						button('Link secondary', 'link_secondary', 'md', {
							linkType: 'external',
							url: 'https://github.com/NetAuraTech/adonisjs-foundry',
						}),
					],
					{ direction: 'row', gap: 'sm', wrap: true },
				),
				flex(
					[
						icon('mdi:shield-lock-outline', 'primary', 'primary-light', 48),
						icon('mdi:hammer-wrench-outline', 'secondary', 'secondary-light', 48),
						icon('mdi:cog-outline', 'tertiary', 'tertiary-light', 48),
						icon('mdi:account-key-outline', 'primary-deep', 'primary-light', 48),
					],
					{ direction: 'row', gap: 'lg', align: 'center' },
				),
				form([
					field('Name', 'name', 'text', { placeholder: 'Jane Doe' }),
					field('E-mail', 'email', 'email', { placeholder: 'jane@example.com' }),
					field('Subject', 'subject', 'select', {
						options: [
							{ value: 'question', label: 'A question' },
							{ value: 'demo', label: 'Request a demo' },
							{ value: 'support', label: 'Support' },
						],
					}),
					field('Message', 'message', 'textarea', { placeholder: 'Tell us what you are forging.' }),
					button('Send message', 'primary', 'md', { linkType: 'page' }),
				]),
			],
			'controls',
		),

		// ── 05 Raw HTML ────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				kicker('05 — Raw'),
				title('HTML / Markdown text', 2),
				htmltext(
					'Inline **markdown** works — `code`, *emphasis* rendered in steel blue.\n\n<pre class="bg-ink text-ink-inverted p-4 rounded-sm overflow-x-auto text-sm"><code>const block = { id: "html-001", type: "htmltext" }</code></pre>',
				),
			],
			'raw',
		),

		// ── Outro ──────────────────────────────────────────────────────────────
		section(
			'secondary-deep',
			'xl',
			'md',
			[
				flex(
					[
						title('That is all 17.', 2, 'ink-inverted'),
						para(
							'Every block above is editable in the builder — this page is seeded JSON, not hand-written JSX.',
							'base',
							'ink-inverted',
							'base',
							'max-w-2xl',
						),
						pageButton('Back to the features', 'features', 'secondary', 'md', 'center'),
					],
					{ direction: 'col', gap: 'md', align: 'center' },
				),
			],
			'outro',
		),
	],
});
