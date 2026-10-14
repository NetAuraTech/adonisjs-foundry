import { button, flex, grid, icon, kicker, para, quote, section, title } from './helpers.js';
import type { PageContent } from '#cms/types/page';

/**
 * Home page, FR translation (primary locale).
 *
 * The page presents the boilerplate itself: typographic hero, stats band,
 * three-pillar features teaser, manifesto quote, contact CTA.
 */
export const homeFR = (): PageContent => ({
	blocks: [
		// ── Hero ───────────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				flex(
					[
						kicker('Boilerplate de production · AdonisJS v7 — Inertia — React', 'primary'),
						title('La fonderie de vos applications', 1),
						para(
							"Foundry est un starter prêt à livrer : architecture domain-driven, builder visuel à 17 blocs, authentification avec 2FA, RBAC, journaux d'audit et contenu multilingue. Vous ne rebâtissez rien — vous forgez.",
							'lg',
							'muted',
							'xl',
						),
						flex(
							[
								button(
									'Voir les fonctionnalités',
									'primary',
									'md',
									{ linkType: 'route', route: 'cms.page.render', routeParams: { slug: 'features' } },
									'center',
								),
								button(
									'Explorer la vitrine',
									'secondary',
									'md',
									{ linkType: 'route', route: 'cms.page.render', routeParams: { slug: 'showcase' } },
									'center',
								),
							],
							{ direction: 'row', gap: 'sm', align: 'center', justify: 'center', wrap: true },
						),
					],
					{ direction: 'col', gap: 'md', align: 'center', className: 'max-w-3xl mx-auto' },
				),
			],
			'hero',
		),

		// ── Stats band ─────────────────────────────────────────────────────────
		section(
			'secondary-deep',
			'lg',
			'md',
			[
				grid(
					{ default: 2, lg: 4 },
					'md',
					[
						flex(
							[
								title('17', 2, 'tertiary'),
								para('types de blocs', 'sm', 'subtle', 'base', 'font-mono uppercase tracking-[0.2em]'),
							],
							{ direction: 'col', gap: 'xs', align: 'center' },
						),
						flex(
							[
								title('3', 2, 'tertiary'),
								para('flavors générés par CI', 'sm', 'subtle', 'base', 'font-mono uppercase tracking-[0.2em]'),
							],
							{ direction: 'col', gap: 'xs', align: 'center' },
						),
						flex(
							[
								title('4', 2, 'tertiary'),
								para('couches domain-driven', 'sm', 'subtle', 'base', 'font-mono uppercase tracking-[0.2em]'),
							],
							{ direction: 'col', gap: 'xs', align: 'center' },
						),
						flex(
							[
								title('2FA', 2, 'tertiary'),
								para('TOTP + RBAC + audit', 'sm', 'subtle', 'base', 'font-mono uppercase tracking-[0.2em]'),
							],
							{ direction: 'col', gap: 'xs', align: 'center' },
						),
					],
					'center',
				),
			],
			'stats',
		),

		// ── Features teaser ────────────────────────────────────────────────────
		section(
			'surface',
			'xl',
			'md',
			[
				title('Ce que la fonderie livre', 2),
				para(
					'Trois piliers, un même objectif : que chaque heure passée sur Foundry aboutisse au produit, pas au socle.',
					'base',
					'muted',
					'base',
					'max-w-2xl mb-10',
				),
				grid({ default: 1, lg: 3 }, 'lg', [
					section(
						'canvas',
						'md',
						'md',
						[
							icon('pepicons-pencil:duplicate', 'default', 'none'),
							title('Domain-driven', 3),
							para(
								'Controllers minces, actions de domaine, services, repositories, modèles. Chaque couche a son contrat, ses tests et sa documentation.',
								'sm',
								'muted',
							),
						],
						undefined,
						'card',
					),
					section(
						'canvas',
						'md',
						'md',
						[
							icon('pepicons-pencil:grid', 'default', 'none'),
							title('Builder visuel', 3),
							para(
								'17 blocs, grilles et flex responsives, révisions, templates réutilisables. Le contenu se modélise — il ne se code plus.',
								'sm',
								'muted',
							),
						],
						undefined,
						'card',
					),
					section(
						'canvas',
						'md',
						'md',
						[
							icon('pepicons-pencil:shield', 'default', 'none'),
							title('Sécurisé par défaut', 3),
							para(
								"Sessions ou tokens, 2FA TOTP, RBAC granulaire, rate-limiting, journaux d'audit immuables.",
								'sm',
								'muted',
							),
						],
						undefined,
						'card',
					),
				]),
				flex(
					[
						button('Toutes les fonctionnalités', 'secondary', 'md', {
							linkType: 'route',
							route: 'cms.page.render',
							routeParams: { slug: 'features' },
						}),
					],
					{ direction: 'row', gap: 'sm', justify: 'end' },
				),
			],
			'features',
		),

		// ── Manifesto ──────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				quote(
					"Un boilerplate n'est pas un cadre : c'est une équipe invisible qui livre avec vous — migrations, tests, CI, sécurité.",
					'Foundry — architecture 2.2',
					'highlight',
				),
			],
			'manifesto',
		),

		// ── CTA ────────────────────────────────────────────────────────────────
		section(
			'secondary-deep',
			'xl',
			'md',
			[
				flex(
					[
						title('Prêt à forger ?', 2, 'ink-inverted'),
						para(
							'Le formulaire de contact est câblé de bout en bout : validation Vine, rate-limit par IP, e-mail transactionnel.',
							'base',
							'ink-inverted',
							'base',
							'max-w-2xl',
						),
						button(
							'Nous contacter',
							'primary',
							'lg',
							{ linkType: 'route', route: 'cms.page.render', routeParams: { slug: 'contact' } },
							'center',
						),
					],
					{ direction: 'col', gap: 'md', align: 'center' },
				),
			],
			'cta',
		),
	],
});

/**
 * Home page, EN translation.
 *
 * @param files - demo image filename → file id map (see `ensureDemoFiles`).
 */
export const homeEN = (): PageContent => ({
	blocks: [
		// ── Hero ───────────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				flex(
					[
						kicker('Production boilerplate · AdonisJS v7 — Inertia — React', 'primary'),
						title('Where applications get forged', 1),
						para(
							'Foundry is a production-ready starter: domain-driven architecture, a 17-block visual builder, 2FA auth, RBAC, immutable audit logs and multilingual content. You stop rebuilding — you forge.',
							'lg',
							'muted',
							'xl',
						),
						flex(
							[
								button(
									'See the features',
									'primary',
									'md',
									{ linkType: 'route', route: 'cms.page.render', routeParams: { slug: 'features' } },
									'center',
								),
								button(
									'Open the showcase',
									'secondary',
									'md',
									{ linkType: 'route', route: 'cms.page.render', routeParams: { slug: 'showcase' } },
									'center',
								),
							],
							{ direction: 'row', gap: 'sm', align: 'center', justify: 'center', wrap: true },
						),
					],
					{ direction: 'col', gap: 'md', align: 'center', className: 'max-w-3xl mx-auto' },
				),
			],
			'hero',
		),

		// ── Stats band ─────────────────────────────────────────────────────────
		section(
			'secondary-deep',
			'lg',
			'md',
			[
				grid(
					{ default: 2, lg: 4 },
					'md',
					[
						flex(
							[
								title('17', 2, 'tertiary'),
								para('block types', 'sm', 'subtle', 'base', 'font-mono uppercase tracking-[0.2em]'),
							],
							{ direction: 'col', gap: 'xs', align: 'center' },
						),
						flex(
							[
								title('3', 2, 'tertiary'),
								para('flavors generated by CI', 'sm', 'subtle', 'base', 'font-mono uppercase tracking-[0.2em]'),
							],
							{ direction: 'col', gap: 'xs', align: 'center' },
						),
						flex(
							[
								title('4', 2, 'tertiary'),
								para('domain-driven layers', 'sm', 'subtle', 'base', 'font-mono uppercase tracking-[0.2em]'),
							],
							{ direction: 'col', gap: 'xs', align: 'center' },
						),
						flex(
							[
								title('2FA', 2, 'tertiary'),
								para('TOTP + RBAC + audit', 'sm', 'subtle', 'base', 'font-mono uppercase tracking-[0.2em]'),
							],
							{ direction: 'col', gap: 'xs', align: 'center' },
						),
					],
					'center',
				),
			],
			'stats',
		),

		// ── Features teaser ────────────────────────────────────────────────────
		section(
			'surface',
			'xl',
			'md',
			[
				title('What the foundry ships', 2),
				para(
					'Three pillars, one goal: every hour spent on Foundry goes to the product, not the foundation.',
					'base',
					'muted',
					'base',
					'max-w-2xl mb-10',
				),
				grid({ default: 1, lg: 3 }, 'lg', [
					section(
						'canvas',
						'md',
						'md',
						[
							icon('pepicons-pencil:duplicate', 'default', 'none'),
							title('Domain-driven', 3),
							para(
								'Thin controllers, domain actions, services, repositories, models. Every layer has its contract, its tests and its docs.',
								'sm',
								'muted',
							),
						],
						undefined,
						'card',
					),
					section(
						'canvas',
						'md',
						'md',
						[
							icon('pepicons-pencil:grid', 'default', 'none'),
							title('Visual builder', 3),
							para(
								'17 blocks, responsive grids and flex, revisions, reusable templates. Content is modeled — not coded.',
								'sm',
								'muted',
							),
						],
						undefined,
						'card',
					),
					section(
						'canvas',
						'md',
						'md',
						[
							icon('pepicons-pencil:shield', 'default', 'none'),
							title('Secure by default', 3),
							para(
								'Sessions or tokens, TOTP 2FA, granular RBAC, rate limiting, immutable audit journals.',
								'sm',
								'muted',
							),
						],
						undefined,
						'card',
					),
				]),
				flex(
					[
						button('All the features', 'secondary', 'md', {
							linkType: 'route',
							route: 'cms.page.render',
							routeParams: { slug: 'features' },
						}),
					],
					{ direction: 'row', gap: 'sm', justify: 'end' },
				),
			],
			'features',
		),

		// ── Manifesto ──────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				quote(
					'A boilerplate is not a framework: it is an invisible team that ships with you — migrations, tests, CI, security.',
					'Foundry — architecture 2.2',
					'highlight',
				),
			],
			'manifesto',
		),

		// ── CTA ────────────────────────────────────────────────────────────────
		section(
			'secondary-deep',
			'xl',
			'md',
			[
				flex(
					[
						title('Ready to forge?', 2, 'ink-inverted'),
						para(
							'The contact form is wired end to end: Vine validation, per-IP rate limiting, transactional e-mail.',
							'base',
							'ink-inverted',
							'base',
							'max-w-2xl',
						),
						button(
							'Contact us',
							'primary',
							'lg',
							{ linkType: 'route', route: 'cms.page.render', routeParams: { slug: 'contact' } },
							'center',
						),
					],
					{ direction: 'col', gap: 'md', align: 'center' },
				),
			],
			'cta',
		),
	],
});
