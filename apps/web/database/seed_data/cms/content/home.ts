import { button, flex, grid, htmltext, icon, kicker, para, quote, section, title } from './helpers.js';
import type { PageContent } from '#cms/types/page';

/**
 * One ledger row of the spec sheet: a display number on the left, a mono label
 * and a one-line explanation on the right. Stacks on mobile.
 */
const specRow = (num: string, label: string, description: string) =>
	flex(
		[
			grid({ default: 1, lg: 2 }, 'md', [
				flex([title(num, 2)], { direction: 'col', align: 'start' }),
				flex([kicker(label), para(description, 'sm', 'muted')], { direction: 'col', gap: 'xs' }),
			]),
		],
		{ direction: 'row', className: 'border-b border-ink/20 py-8' },
	);

/**
 * Home page, FR translation (primary locale).
 *
 * The page presents the boilerplate itself: typographic hero, stats band,
 * three-pillar features teaser, the flavor matrix, a quick start, the
 * manifesto quote and the contact CTA. Copy is drawn from the repository
 * README so the page stays in lockstep with the documented product.
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
						kicker('Boilerplate de production · CMS headless · AdonisJS v7 — Inertia — React', 'primary'),
						title('La fonderie de vos applications', 1),
						para(
							'Foundry est un boilerplate prêt à livrer et un CMS headless : architecture domain-driven, builder visuel temps réel, authentification complète avec 2FA, RBAC, journaux d’audit, fichiers, templates, files de jobs et sauvegardes. Le socle est déjà livré — vous forgez le produit.',
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
									{ linkType: 'route', route: 'cms.page.render', routeParams: { slug: 'fonctionnalites' } },
									'center',
								),
								button(
									'Explorer la vitrine',
									'secondary',
									'md',
									{ linkType: 'route', route: 'cms.page.render', routeParams: { slug: 'vitrine' } },
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

		// ── Spec sheet ─────────────────────────────────────────────────────────
		section(
			'canvas',
			'lg',
			'md',
			[
				kicker('Fiche technique'),
				title('Le socle, en chiffres', 2),
				para(
					'Ce qui suit est dans le code, pas dans la brochure. Les détails, page fonctionnalités.',
					'base',
					'muted',
					'base',
					'max-w-2xl mb-10',
				),
				flex(
					[
						specRow(
							'17',
							'Types de blocs',
							'Sections, grilles, titres, boutons, médias, code brut : tout ce que le builder assemble, sans écrire une ligne de code.',
						),
						specRow(
							'3',
							'Flavors',
							'Front complet avec CMS, front sans CMS, backend headless : un checkout de branche, jamais une porte à sens unique.',
						),
						specRow(
							'8',
							'Domaines',
							'Account, auth, cms, core, file, identity, log, webhook — le même contrat de couches pour chacun.',
						),
						specRow(
							'10',
							'Flows d’authentification',
							'De l’inscription à la 2FA TOTP, en passant par l’OAuth et les invitations : écrits, testés, documentés.',
						),
					],
					{ direction: 'col', gap: 'none' },
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
							icon('pepicons-pencil:duplicate', 'primary', 'none'),
							title('Domain-driven', 3),
							para(
								'app/ pour le transport, src/ pour le business — par domaine. Controllers minces, actions de cas d’usage, services, repositories, modèles Lucid, exceptions typées. Chaque couche a sa convention écrite et ses tests.',
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
							icon('pepicons-pencil:grid', 'primary', 'none'),
							title('Builder visuel', 3),
							para(
								'17 blocs typés à props responsives, collaboration temps réel par SSE, verrouillage de champs, révisions restaurables, aperçu en direct. Le contenu se modélise — il ne se code plus.',
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
							icon('pepicons-pencil:shield', 'primary', 'none'),
							title('Sécurisé par défaut', 3),
							para(
								'Sessions ou tokens opt-in, 2FA TOTP avec codes de récupération, RBAC granulaire, tokens selector/validator, rate-limit par client, journaux d’audit persistés.',
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
							routeParams: { slug: 'fonctionnalites' },
						}),
					],
					{ direction: 'row', gap: 'sm', justify: 'end', className: 'mt-5' },
				),
			],
			'features',
		),

		// ── Flavors ────────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				kicker('Flavors'),
				title('Un dépôt, trois surfaces', 2),
				para(
					'Le même codebase, taillé à trois surfaces par des manifests de prune déclaratives rejouées en CI — un checkout de branche, pas une installation en plus. Rien n’est une porte à sens unique : chaque flavor se remonte vers full.',
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
							icon('pepicons-pencil:duplicate', 'primary', 'none'),
							title('full — main', 3),
							para(
								'Front Inertia + admin, le module CMS et le builder visuel. La branche que les humains éditent — les deux autres en sont des artefacts régénérés.',
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
							icon('pepicons-pencil:grid', 'primary', 'none'),
							title('inertia', 3),
							para(
								'Front Inertia + admin, pages écrites à la main, sans CMS ni builder. Pour les équipes qui veulent leur propre front.',
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
							icon('pepicons-pencil:chain', 'primary', 'none'),
							title('api', 3),
							para(
								'Backend headless REST sous /api/v1/*, sans front. La spec OpenAPI s’adapte aux permissions de l’appelant — Next.js, mobile, scripts.',
								'sm',
								'muted',
							),
						],
						undefined,
						'card',
					),
				]),
			],
			'flavors',
		),

		// ── Quick start ────────────────────────────────────────────────────────
		section(
			'surface',
			'xl',
			'md',
			[
				kicker('Démarrage'),
				title('De zéro à localhost en quelques lignes', 2),
				para(
					'Foundry ne s’utilise pas tel quel : on crée son dépôt, on ajoute Foundry en remote upstream, et les mises à jour remontent par la suite — un merge, jamais une réécriture.',
					'base',
					'muted',
					'base',
					'max-w-2xl mb-10',
				),
				htmltext(
					'<pre class="bg-ink text-ink-inverted p-4 rounded-sm overflow-x-auto text-sm"><code># votre dépôt\nmkdir my-project &amp;&amp; cd my-project &amp;&amp; git init\n\n# foundry en upstream\ngit remote add foundry https://github.com/NetAuraTech/adonisjs-foundry.git\ngit fetch foundry &amp;&amp; git merge foundry/main --allow-unrelated-histories\n\n# et on lance\nnpm install\ndocker compose up -d\ncp apps/web/.env.example apps/web/.env\ncd apps/web &amp;&amp; node ace generate:key &amp;&amp; node ace migration:run\nnpm run dev        # → http://localhost:3333</code></pre>',
				),
			],
			'quickstart',
		),

		// ── Manifesto ──────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				quote(
					'Un point de départ solide et bien architecturé — pour que vous construisiez votre produit dès le premier jour.',
					'Foundry — README',
					'highlight',
				),
			],
			'manifesto',
		),

		// ── CTA ────────────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				flex(
					[
						title('Prêt à forger ?', 2, 'default'),
						para(
							'Votre dépôt, Foundry en upstream, et le premier merge fait le reste : migrations, tests, CI et sécurité voyagent avec vous. Une question avant de démarrer ?',
							'base',
							'muted',
							'base',
							'max-w-2xl',
						),
						button(
							'Nous contacter',
							'primary',
							'lg',
							{ linkType: 'route', route: 'cms.page.render', routeParams: { slug: 'nous-joindre' } },
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
						kicker('Production boilerplate · Headless CMS · AdonisJS v7 — Inertia — React', 'primary'),
						title('Where applications get forged', 1),
						para(
							'Foundry is a production-ready boilerplate and a headless CMS: domain-driven architecture, a real-time visual builder, complete authentication with 2FA, RBAC, audit journals, file management, templates, job queues and backups. The foundation is already shipped — you forge the product.',
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

		// ── Spec sheet ─────────────────────────────────────────────────────────
		section(
			'canvas',
			'lg',
			'md',
			[
				kicker('Spec sheet'),
				title('The foundation, in numbers', 2),
				para(
					'Everything below is in the code, not the brochure. The details live on the features page.',
					'base',
					'muted',
					'base',
					'max-w-2xl mb-10',
				),
				flex(
					[
						specRow(
							'17',
							'Block types',
							'Sections, grids, titles, buttons, media, raw HTML: everything the builder assembles without writing a line of code.',
						),
						specRow(
							'3',
							'Flavors',
							'Full front with the CMS, front without it, headless backend: a branch checkout, never a one-way door.',
						),
						specRow(
							'8',
							'Domains',
							'Account, auth, cms, core, file, identity, log, webhook — the same layer contract for each.',
						),
						specRow(
							'10',
							'Auth flows',
							'From registration to the TOTP challenge, through OAuth and invitations: written, tested, documented.',
						),
					],
					{ direction: 'col', gap: 'none' },
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
							icon('pepicons-pencil:duplicate', 'primary', 'none'),
							title('Domain-driven', 3),
							para(
								'app/ for transport, src/ for business — per domain. Thin controllers, use-case actions, services, repositories, Lucid models, typed exceptions. Every layer has its written convention and its tests.',
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
							icon('pepicons-pencil:grid', 'primary', 'none'),
							title('Visual builder', 3),
							para(
								'17 typed blocks with responsive props, real-time collaboration over SSE, field locking, restorable revisions and a live preview. Content is modeled — not coded.',
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
							icon('pepicons-pencil:shield', 'primary', 'none'),
							title('Secure by default', 3),
							para(
								'Sessions or opt-in tokens, TOTP 2FA with recovery codes, granular RBAC, selector/validator tokens, per-client rate limiting, persisted audit journals.',
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
					{ direction: 'row', gap: 'sm', justify: 'end', className: 'mt-5' },
				),
			],
			'features',
		),

		// ── Flavors ────────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				kicker('Flavors'),
				title('One repository, three surfaces', 2),
				para(
					'The same codebase, pruned to three surfaces by declarative manifests replayed in CI — a branch checkout, not an extra install. Nothing is a one-way door: every flavor upgrades back to full.',
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
							icon('pepicons-pencil:duplicate', 'primary', 'none'),
							title('full — main', 3),
							para(
								'Inertia front + admin, the CMS module and the visual page builder. The branch humans edit — the other two are regenerated artifacts.',
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
							icon('pepicons-pencil:grid', 'primary', 'none'),
							title('inertia', 3),
							para(
								'Inertia front + admin with hand-written pages, no CMS or builder. For teams that want to own their front end.',
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
							icon('pepicons-pencil:chain', 'primary', 'none'),
							title('api', 3),
							para(
								'Headless REST backend under /api/v1/*, no front end. The OpenAPI spec adapts to the caller’s permissions — Next.js, mobile, scripts.',
								'sm',
								'muted',
							),
						],
						undefined,
						'card',
					),
				]),
			],
			'flavors',
		),

		// ── Quick start ────────────────────────────────────────────────────────
		section(
			'surface',
			'xl',
			'md',
			[
				kicker('Quick start'),
				title('From zero to localhost in a few lines', 2),
				para(
					'Foundry is not meant to be used as-is: create your repository, add Foundry as an upstream remote, and pull future updates — a merge, never a rewrite.',
					'base',
					'muted',
					'base',
					'max-w-2xl mb-10',
				),
				htmltext(
					'<pre class="bg-ink text-ink-inverted p-4 rounded-sm overflow-x-auto text-sm"><code># your repo\nmkdir my-project &amp;&amp; cd my-project &amp;&amp; git init\n\n# foundry as upstream\ngit remote add foundry https://github.com/NetAuraTech/adonisjs-foundry.git\ngit fetch foundry &amp;&amp; git merge foundry/main --allow-unrelated-histories\n\n# and up you go\nnpm install\ndocker compose up -d\ncp apps/web/.env.example apps/web/.env\ncd apps/web &amp;&amp; node ace generate:key &amp;&amp; node ace migration:run\nnpm run dev        # → http://localhost:3333</code></pre>',
				),
			],
			'quickstart',
		),

		// ── Manifesto ──────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				quote(
					'A solid, well-architected starting point — so you can focus on building your product from day one.',
					'Foundry — README',
					'highlight',
				),
			],
			'manifesto',
		),

		// ── CTA ────────────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				flex(
					[
						title('Ready to forge?', 2, 'default'),
						para(
							'Your repo, Foundry as upstream, and the first merge does the rest: migrations, tests, CI and security ride along. A question before you start?',
							'base',
							'muted',
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
