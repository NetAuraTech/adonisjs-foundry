import { button, field, flex, form, grid, iframe, icon, image, kicker, para, section, title } from './helpers.js';
import type { PageContent } from '#cms/types/page';

/**
 * Contact page (EN). The form block is bound to `cms.contact.execute`
 * (Vine validation + per-IP rate limiting + transactional e-mail); the
 * linkless button inside it renders as the Inertia form submit.
 *
 * @param files - demo image filename → file id map (see `ensureDemoFiles`).
 */
export const contactEN = (files: Record<string, number>): PageContent => ({
	blocks: [
		// ── Header ─────────────────────────────────────────────────────────────
		section(
			'surface',
			'xl',
			'md',
			[
				flex(
					[
						kicker('Contact'),
						title('Talk to the foundry', 1),
						para(
							'This form is wired end to end: Vine validation, per-IP rate limiting, and a transactional e-mail on every submission.',
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

		// ── Form + aside ───────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				grid(
					{ default: 1, md: 2 },
					'lg',
					[
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
						flex(
							[
								section(
									'surface',
									'md',
									'md',
									[
										icon('pepicons-pencil:pin', 'primary', 'primary-light', 40),
										title('Where', 4),
										para('Paris, France — and remote everywhere else.', 'sm', 'muted'),
									],
									undefined,
									'card',
								),
								section(
									'surface',
									'md',
									'md',
									[
										icon('pepicons-pencil:clock', 'primary', 'primary-light', 40),
										title('Response', 4),
										para('Submissions land in the mail queue and the audit journal.', 'sm', 'muted'),
									],
									undefined,
									'card',
								),
								image(files['spark-burst.png'], 'Sparks from the forge', 'w-full'),
							],
							{ direction: 'col', gap: 'md' },
						),
					],
					'start',
				),
			],
			'form',
		),

		// ── Map ────────────────────────────────────────────────────────────────
		section(
			'surface',
			'xl',
			'md',
			[
				iframe(
					'https://maps.google.com/maps?q=Paris&z=13&output=embed',
					'Map — Paris (Google Maps embed, allowlist-enforced)',
				),
			],
			'map',
		),
	],
});
