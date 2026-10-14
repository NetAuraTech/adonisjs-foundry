import { button, flex, grid, htmltext, icon, image, kicker, list, para, quote, section, title } from './helpers.js';
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
