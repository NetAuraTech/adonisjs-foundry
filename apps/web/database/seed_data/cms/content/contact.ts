import {
	button,
	externalButton,
	field,
	flex,
	form,
	grid,
	iframe,
	icon,
	image,
	kicker,
	para,
	section,
	title,
} from './helpers.js';
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
							'This is the real form — the same block a CMS editor drops on any page: Vine validation, per-IP rate limiting, and a transactional e-mail on every submission.',
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
										icon('pepicons-pencil:pin', 'primary', 'none', 40),
										title('Where', 4),
										para('NetAuraTech — Paris, France, and remote everywhere else.', 'sm', 'muted'),
									],
									undefined,
									'card',
								),
								section(
									'surface',
									'md',
									'md',
									[
										icon('pepicons-pencil:clock', 'primary', 'none', 40),
										title('Response', 4),
										para(
											'Submissions land in the mail queue and the audit journal; a transactional e-mail goes to the configured recipient.',
											'sm',
											'muted',
										),
									],
									undefined,
									'card',
								),
								section(
									'surface',
									'md',
									'md',
									[
										icon('pepicons-pencil:chain', 'primary', 'none', 40),
										title('Support', 4),
										para('Issues live on GitHub — open one and it gets triaged.', 'sm', 'muted'),
										externalButton(
											'Open the repo',
											'https://github.com/NetAuraTech/adonisjs-foundry',
											'link_muted',
											'sm',
										),
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

/**
 * Contact page (FR). The form block is bound to `cms.contact.execute`
 * (Vine validation + per-IP rate limiting + transactional e-mail); the
 * linkless button inside it renders as the Inertia form submit.
 *
 * @param files - demo image filename → file id map (see `ensureDemoFiles`).
 */
export const contactFR = (files: Record<string, number>): PageContent => ({
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
						title('Parlez à la fonderie', 1),
						para(
							'C’est le vrai formulaire — le même bloc qu’un éditeur CMS dépose sur n’importe quelle page : validation Vine, limitation de débit par IP, et un e-mail transactionnel à chaque envoi.',
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
							field('Nom', 'name', 'text', { placeholder: 'Jane Doe' }),
							field('E-mail', 'email', 'email', { placeholder: 'jane@example.com' }),
							field('Sujet', 'subject', 'select', {
								options: [
									{ value: 'question', label: 'Une question' },
									{ value: 'demo', label: 'Demander une démo' },
									{ value: 'support', label: 'Support' },
								],
							}),
							field('Message', 'message', 'textarea', { placeholder: 'Dites-nous ce que vous forgez.' }),
							button('Envoyer le message', 'primary', 'md', { linkType: 'page' }),
						]),
						flex(
							[
								section(
									'surface',
									'md',
									'md',
									[
										icon('pepicons-pencil:pin', 'primary', 'none', 40),
										title('Où', 4),
										para('NetAuraTech — Paris, France, et à distance partout ailleurs.', 'sm', 'muted'),
									],
									undefined,
									'card',
								),
								section(
									'surface',
									'md',
									'md',
									[
										icon('pepicons-pencil:clock', 'primary', 'none', 40),
										title('Réponse', 4),
										para(
											'Les envois atterrissent dans la file e-mail et le journal d’audit ; un e-mail transactionnel part vers le destinataire configuré.',
											'sm',
											'muted',
										),
									],
									undefined,
									'card',
								),
								section(
									'surface',
									'md',
									'md',
									[
										icon('pepicons-pencil:chain', 'primary', 'none', 40),
										title('Support', 4),
										para('Les issues vivent sur GitHub — ouvrez-en une et elle est triée.', 'sm', 'muted'),
										externalButton(
											'Ouvrir le repo',
											'https://github.com/NetAuraTech/adonisjs-foundry',
											'link_muted',
											'sm',
										),
									],
									undefined,
									'card',
								),
								image(files['spark-burst.png'], 'Étincelles de la forge', 'w-full'),
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
					'Carte — Paris (intégration Google Maps, allowlist appliquée)',
				),
			],
			'map',
		),
	],
});
