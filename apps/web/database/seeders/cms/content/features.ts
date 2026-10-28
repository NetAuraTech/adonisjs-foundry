import {
	button,
	flex,
	grid,
	htmltext,
	icon,
	image,
	kicker,
	list,
	pageButton,
	para,
	quote,
	section,
	title,
} from './helpers.js';
import type { PageContent } from '#cms/types/page';

/**
 * Features page (EN). Presents the boilerplate: architecture, auth, content
 * modeling, operational defaults — each section maps to a documented feature
 * in the repository README.
 *
 * @param files - demo image filename → file id map (see `ensureDemoFiles`).
 */
export const featuresEN = (files: Record<string, number>): PageContent => ({
	blocks: [
		// ── Header ─────────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				flex(
					[
						kicker('Features — what ships in the box'),
						title('Everything is wired. Nothing left to glue.', 1),
						para(
							'Foundry is a production-grade starter, not a skeleton: complete authentication, a CMS with a visual page builder, file management, templates, job queues, backups and API docs. Every item below is implemented, tested and documented in this repository.',
							'lg',
							'muted',
							'xl',
							'max-w-2xl',
						),
					],
					{ direction: 'col', gap: 'md' },
				),
			],
			'header',
		),

		// ── Architecture ───────────────────────────────────────────────────────
		section(
			'surface',
			'xl',
			'md',
			[
				kicker('Architecture'),
				title('Domain-driven, down to the file names', 2),
				para(
					'The application is split in two trees, organized per domain — account, auth, cms, core, file, identity, log, webhook. app/ holds the transport: thin controllers, REST adapters, middleware, validators and self-registering routes. src/ holds the business: actions for use cases, services for rules, repositories for data access. Nothing crosses the line without a typed exception.',
					'base',
					'muted',
					'base',
					'max-w-2xl',
				),
				grid(
					{ default: 1, lg: 2 },
					'lg',
					[
						list([
							'Thin controllers — HTTP concerns only',
							'Actions — use cases with transactional boundaries',
							'Domain — entities, value objects, pure rules',
							'Services — cross-cutting, log the significant events',
							'Repositories & queries — all data access, no logic',
							'Typed exceptions — status + i18n-ready error codes',
						]),
						htmltext(
							'<pre class="bg-ink text-ink-inverted p-4 rounded-sm overflow-x-auto text-sm"><code>app/&lt;domain&gt;        →        src/&lt;domain&gt;\ncontrollers              actions\nrest · validators    services · repositories\nmiddleware               models (Lucid)\n                     typed exceptions</code></pre>',
						),
					],
					'start',
				),
				para(
					'Routes are self-registering per domain and gated by feature flags; src/core/ is the kernel every domain shares — base classes, value-object primitives, transaction helpers and the dashboard, nav and sitemap registries.',
					'base',
					'muted',
					'base',
					'max-w-2xl mt-8',
				),
			],
			'architecture',
		),

		// ── Auth ───────────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				kicker('Security'),
				title('Auth & access control', 2),
				para(
					'Ten standard flows — registration, login, logout, password reset, the TOTP challenge, email verification, OAuth, OAuth linking, define password and invitations — all built on the selector/validator token pattern with attempt tracking.',
					'base',
					'muted',
					'base',
					'max-w-2xl mb-10',
				),
				grid({ default: 1, lg: 3 }, 'lg', [
					section(
						'surface',
						'md',
						'md',
						[
							icon('pepicons-pencil:key', 'primary', 'none'),
							title('Sessions & tokens', 3),
							para(
								'Session guard for the browser; opt-in opaque-token guard for the REST surface (AUTH_GUARD_API) — the two never overlap by accident.',
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
							icon('pepicons-pencil:shield-check', 'primary', 'none'),
							title('2FA TOTP', 3),
							para(
								'Enrollment from Settings with one-time recovery codes shown once, a code challenge at login, and a code-gated disable flow.',
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
							icon('pepicons-pencil:people', 'primary', 'none'),
							title('RBAC', 3),
							para(
								'Custom roles & permissions on a many-to-many pivot, system-role protection, and frontend guards: Authenticated, HasRole, CanAccess.',
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
							icon('pepicons-pencil:earth-americas', 'primary', 'none'),
							title('OAuth & invitations', 3),
							para(
								'GitHub, Google and Facebook with account linking and unlinking; admin-driven invitations accepted through a token link.',
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
							icon('pepicons-pencil:clock', 'primary', 'none'),
							title('Rate limiting', 3),
							para(
								'Per-route throttles for guests, a per-client budget on /api/v1/* keyed by the authenticated user — 429 with rate-limit headers when it runs out.',
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
							icon('pepicons-pencil:heart', 'primary', 'none'),
							title('Email workflows', 3),
							para(
								'Email change with dual confirmation (new + old address), password-change notices, invitation and contact mails — transactional end to end.',
								'sm',
								'muted',
							),
						],
						undefined,
						'card',
					),
				]),
				quote(
					'Every sensitive action lands in a persisted audit journal — who, what, when, from where — under the categories AUTH, SECURITY, API, DATABASE, PERFORMANCE and BUSINESS.',
					'Log entries',
				),
			],
			'auth',
		),

		// ── Content, modeled ───────────────────────────────────────────────────
		section(
			'surface',
			'xl',
			'md',
			[
				kicker('Content'),
				title('Content, modeled', 2),
				grid({ default: 1, lg: 3 }, 'lg', [
					section(
						'canvas',
						'md',
						'md',
						[
							icon('pepicons-pencil:grid', 'primary', 'none'),
							title('Visual builder', 3),
							para(
								'17 typed blocks with responsive props, real-time collaboration over SSE: presence, 5-second field locks, Redis-synced drafts and a token-authenticated live preview.',
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
							icon('pepicons-pencil:rewind-time', 'primary', 'none'),
							title('Revisions', 3),
							para(
								'A snapshot is saved before every update; restore or pin it from the admin history, auto-purge takes care of the rest.',
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
							icon('pepicons-pencil:earth-americas', 'primary', 'none'),
							title('Multilingual', 3),
							para(
								'Per-locale translations with unique slugs, content seeding between locales, and backend i18n in English and French.',
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
							icon('pepicons-pencil:square', 'primary', 'none'),
							title('Files & images', 3),
							para(
								'Uploads on local, S3 or R2 disks with folders and per-locale named alt text; Sharp generates WebP variants at 400/800/1200w with CLS-safe dimensions.',
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
							icon('pepicons-pencil:book', 'primary', 'none'),
							title('Templates', 3),
							para(
								'Save a full page or a single block as a template, create one from an existing page, apply it to a translation — a revision is saved before the overwrite.',
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
							title('SEO & safety', 3),
							para(
								'Dynamic sitemap.xml and robots.txt, per-page meta title, description and image, DOMPurify sanitization and an iframe hostname allowlist.',
								'sm',
								'muted',
							),
						],
						undefined,
						'card',
					),
				]),
				image(files['blueprint-gears.png'], 'Blueprint — gears and mounting marks', 'w-full mt-10'),
			],
			'content',
		),

		// ── Operational by default ─────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				kicker('Operations'),
				title('Operational by default', 2),
				para(
					'A Redis job queue with a worker process, full and differential backups with encryption and retention, HMAC-signed webhooks, a runtime-generated OpenAPI reference at /api/docs scoped to the caller’s permissions, Sentry on the Node runtime and in the browser, Docker for dev and prod — and health probes that stay reachable even in maintenance mode.',
					'base',
					'muted',
					'base',
					'max-w-2xl mb-10',
				),
				grid(
					{ default: 1, md: 2, lg: 4 },
					'md',
					[
						['pepicons-pencil:clock', 'Queues'],
						['pepicons-pencil:database', 'Backups'],
						['pepicons-pencil:hourglass', 'Rate limiting'],
						['pepicons-pencil:chain', 'Webhooks'],
						['pepicons-pencil:book', 'OpenAPI docs'],
						['pepicons-pencil:heart', 'Health checks'],
						['pepicons-pencil:wrench', 'Maintenance mode'],
						['pepicons-pencil:wifi', 'SSE real-time'],
					].map(([name, label]) =>
						flex([icon(name, 'primary', 'none', 36), title(label, 4)], { direction: 'col', gap: 'xs' }),
					),
				),
			],
			'operations',
		),

		// ── CTA ────────────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				flex(
					[
						title('See the blocks in action', 2),
						para('The showcase renders all 17 block types on a single page.', 'base', 'muted', 'base', 'max-w-2xl'),
						button(
							'Open the showcase',
							'primary',
							'md',
							{ linkType: 'route', route: 'cms.page.render', routeParams: { slug: 'showcase' } },
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
 * Features page (FR). Presents the boilerplate: architecture, auth, content
 * modeling, operational defaults — each section maps to a documented feature
 * in the repository README.
 *
 * @param files - demo image filename → file id map (see `ensureDemoFiles`).
 */
export const featuresFR = (files: Record<string, number>): PageContent => ({
	blocks: [
		// ── Header ─────────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				flex(
					[
						kicker('Fonctionnalités — ce qui est dans la boîte'),
						title('Tout est câblé. Rien à coller.', 1),
						para(
							'Foundry est un starter de production, pas un squelette : authentification complète, CMS avec builder visuel, gestion des fichiers, templates, files de jobs, sauvegardes et documentation d’API. Chaque élément ci-dessous est implémenté, testé et documenté dans ce dépôt.',
							'lg',
							'muted',
							'xl',
							'max-w-2xl',
						),
					],
					{ direction: 'col', gap: 'md' },
				),
			],
			'header',
		),

		// ── Architecture ───────────────────────────────────────────────────────
		section(
			'surface',
			'xl',
			'md',
			[
				kicker('Architecture'),
				title('Domaine-driven, jusqu’aux noms de fichiers', 2),
				para(
					'L’application est découpée en deux arbres, organisés par domaine — account, auth, cms, core, file, identity, log, webhook. app/ porte le transport : contrôleurs minces, adaptateurs REST, middleware, validateurs et routes auto-enregistrées. src/ porte le métier : des actions pour les cas d’usage, des services pour les règles, des repositories pour l’accès aux données. Rien ne franchit la ligne sans une exception typée.',
					'base',
					'muted',
					'base',
					'max-w-2xl',
				),
				grid(
					{ default: 1, lg: 2 },
					'lg',
					[
						list([
							'Contrôleurs minces — uniquement des soucis HTTP',
							'Actions — cas d’usage aux frontières transactionnelles',
							'Domaine — entités, value objects, règles pures',
							'Services — transversaux, ils loguent les événements significatifs',
							'Repositories & requêtes — tout l’accès aux données, sans logique',
							'Exceptions typées — statut + codes d’erreur prêts pour l’i18n',
						]),
						htmltext(
							'<pre class="bg-ink text-ink-inverted p-4 rounded-sm overflow-x-auto text-sm"><code>app/&lt;domain&gt;        →        src/&lt;domain&gt;\ncontrollers              actions\nrest · validators    services · repositories\nmiddleware               models (Lucid)\n                     typed exceptions</code></pre>',
						),
					],
					'start',
				),
				para(
					'Les routes s’auto-enregistrent par domaine et sont pilotées par des feature flags ; src/core/ est le noyau partagé par tous les domaines — classes de base, primitives de value objects, helpers transactionnels et les registres dashboard, navigation et sitemap.',
					'base',
					'muted',
					'base',
					'max-w-2xl mt-8',
				),
			],
			'architecture',
		),

		// ── Auth ───────────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				kicker('Sécurité'),
				title('Authentification & contrôle d’accès', 2),
				para(
					'Dix flux standards — inscription, connexion, déconnexion, réinitialisation du mot de passe, le défi TOTP, vérification d’e-mail, OAuth, liaison OAuth, définition du mot de passe et invitations — tous construits sur le modèle token sélecteur/validateur avec suivi des tentatives.',
					'base',
					'muted',
					'base',
					'max-w-2xl mb-10',
				),
				grid({ default: 1, lg: 3 }, 'lg', [
					section(
						'surface',
						'md',
						'md',
						[
							icon('pepicons-pencil:key', 'primary', 'none'),
							title('Sessions & tokens', 3),
							para(
								'Garde de session pour le navigateur ; garde de tokens opaques optionnelle pour la surface REST (AUTH_GUARD_API) — les deux ne se chevauchent jamais par accident.',
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
							icon('pepicons-pencil:shield-check', 'primary', 'none'),
							title('2FA TOTP', 3),
							para(
								'Inscription depuis les Réglages avec des codes de récupération à usage unique affichés une seule fois, un défi par code à la connexion, et une désactivation contrôlée par code.',
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
							icon('pepicons-pencil:people', 'primary', 'none'),
							title('RBAC', 3),
							para(
								'Rôles & permissions sur table pivot many-to-many, protection des rôles système, et garde-fous front : Authenticated, HasRole, CanAccess.',
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
							icon('pepicons-pencil:earth-americas', 'primary', 'none'),
							title('OAuth & invitations', 3),
							para(
								'GitHub, Google et Facebook avec liaison et déliaison de comptes ; invitations pilotées par l’admin, acceptées par un lien de token.',
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
							icon('pepicons-pencil:clock', 'primary', 'none'),
							title('Limitation de débit', 3),
							para(
								'Throttles par route pour les invités, un budget par client sur /api/v1/* indexé sur l’utilisateur authentifié — 429 avec les headers rate-limit quand il est épuisé.',
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
							icon('pepicons-pencil:heart', 'primary', 'none'),
							title('Workflows e-mail', 3),
							para(
								'Changement d’e-mail avec double confirmation (nouvelle + ancienne adresse), notifications de changement de mot de passe, e-mails d’invitation et de contact — transactionnel de bout en bout.',
								'sm',
								'muted',
							),
						],
						undefined,
						'card',
					),
				]),
				quote(
					'Chaque action sensible atterrit dans un journal d’audit persisté — qui, quoi, quand, d’où — sous les catégories AUTH, SECURITY, API, DATABASE, PERFORMANCE et BUSINESS.',
					'Entrées de log',
				),
			],
			'auth',
		),

		// ── Content, modeled ───────────────────────────────────────────────────
		section(
			'surface',
			'xl',
			'md',
			[
				kicker('Contenu'),
				title('Le contenu, modélisé', 2),
				grid({ default: 1, lg: 3 }, 'lg', [
					section(
						'canvas',
						'md',
						'md',
						[
							icon('pepicons-pencil:grid', 'primary', 'none'),
							title('Builder visuel', 3),
							para(
								'17 blocs typés aux props responsives, collaboration temps réel sur SSE : présence, verrous de champs de 5 secondes, brouillons synchronisés via Redis et aperçu live authentifié par token.',
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
							icon('pepicons-pencil:rewind-time', 'primary', 'none'),
							title('Révisions', 3),
							para(
								'Un snapshot est enregistré avant chaque mise à jour ; restaurez-le ou fixez-le depuis l’historique admin, la purge automatique s’occupe du reste.',
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
							icon('pepicons-pencil:earth-americas', 'primary', 'none'),
							title('Multilingue', 3),
							para(
								'Traductions par locale à slug unique, seedage de contenu entre locales, et i18n backend en anglais et en français.',
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
							icon('pepicons-pencil:square', 'primary', 'none'),
							title('Fichiers & images', 3),
							para(
								'Uploads sur disques local, S3 ou R2 avec dossiers et alt text nommé par locale ; Sharp génère des variantes WebP en 400/800/1200w aux dimensions sûres CLS.',
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
							icon('pepicons-pencil:book', 'primary', 'none'),
							title('Templates', 3),
							para(
								'Enregistrez une page entière ou un bloc seul en template, créez-en un depuis une page existante, appliquez-le à une traduction — une révision est enregistrée avant l’écrasement.',
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
							title('SEO & sécurité', 3),
							para(
								'sitemap.xml et robots.txt dynamiques, meta title, description et image par page, sanitization DOMPurify et une allowlist de hostname pour les iframes.',
								'sm',
								'muted',
							),
						],
						undefined,
						'card',
					),
				]),
				image(files['blueprint-gears.png'], 'Plan — engrenages et repères de fixation', 'w-full mt-10'),
			],
			'content',
		),

		// ── Operational by default ─────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				kicker('Exploitation'),
				title('Opérationnel par défaut', 2),
				para(
					'Une file de jobs Redis avec un process worker, des sauvegardes complètes et différentielles chiffrées avec rétention, des webhooks signés HMAC, une référence OpenAPI générée à l’exécution sur /api/docs bornée aux permissions de l’appelant, Sentry sur le runtime Node et dans le navigateur, Docker pour le dev et la prod — et des sondes de santé qui restent accessibles même en mode maintenance.',
					'base',
					'muted',
					'base',
					'max-w-2xl mb-10',
				),
				grid(
					{ default: 1, md: 2, lg: 4 },
					'md',
					[
						['pepicons-pencil:clock', 'Files de jobs'],
						['pepicons-pencil:database', 'Sauvegardes'],
						['pepicons-pencil:hourglass', 'Limitation de débit'],
						['pepicons-pencil:chain', 'Webhooks'],
						['pepicons-pencil:book', 'Docs OpenAPI'],
						['pepicons-pencil:heart', 'Sondes de santé'],
						['pepicons-pencil:wrench', 'Mode maintenance'],
						['pepicons-pencil:wifi', 'Temps réel SSE'],
					].map(([name, label]) =>
						flex([icon(name, 'primary', 'none', 36), title(label, 4)], { direction: 'col', gap: 'xs' }),
					),
				),
			],
			'operations',
		),

		// ── CTA ────────────────────────────────────────────────────────────────
		section(
			'canvas',
			'xl',
			'md',
			[
				flex(
					[
						title('Voyez les blocs en action', 2),
						para('La vitrine rend les 17 types de blocs sur une seule page.', 'base', 'muted', 'base', 'max-w-2xl'),
						pageButton('Ouvrir la vitrine', 'vitrine', 'primary', 'md', 'center'),
					],
					{ direction: 'col', gap: 'md', align: 'center' },
				),
			],
			'cta',
		),
	],
});
