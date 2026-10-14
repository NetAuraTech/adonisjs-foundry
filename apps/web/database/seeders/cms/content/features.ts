import { button, flex, grid, htmltext, icon, image, kicker, list, para, quote, section, title } from './helpers.js';
import type { PageContent } from '#cms/types/page';

/**
 * Features page (EN). Presents the boilerplate: architecture, auth, content
 * modeling, operational defaults — each section maps to a documented feature.
 *
 * @param files - demo image filename → file id map (see `ensureDemoFiles`).
 */
export const featuresEN = (files: Record<string, number>): PageContent => ({
	blocks: [
		// ── Header ─────────────────────────────────────────────────────────────
		section(
			'secondary-deep',
			'xl',
			'md',
			[
				flex(
					[
						kicker('Features — what ships in the box', 'tertiary-light'),
						title('Everything is wired. Nothing left to glue.', 1, 'ink-inverted', 'tertiary-light'),
						para(
							'Foundry is a production-grade starter, not a skeleton. Every feature below is implemented, tested, and documented in the repository.',
							'lg',
							'primary-light',
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
					'Transport and business are separated by a hard boundary: thin controllers, domain actions for use cases, services for rules, repositories for queries.',
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
							'HTTP / Inertia controllers',
							'Domain actions (use cases)',
							'Services & repositories',
							'Lucid models + Vine validation',
							'Per-domain exceptions & logging',
						]),
						htmltext(
							'<pre class="bg-ink text-ink-inverted p-4 rounded-sm overflow-x-auto text-sm"><code>controllers&nbsp;&nbsp;→&nbsp;&nbsp;actions\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→&nbsp;&nbsp;services / repositories\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→&nbsp;&nbsp;models (Lucid)</code></pre>',
						),
					],
					'start',
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
				grid({ default: 1, lg: 3 }, 'lg', [
					section(
						'surface',
						'md',
						'md',
						[
							icon('pepicons-pencil:key', 'secondary', 'secondary-light'),
							title('Sessions & tokens', 3),
							para(
								'Session-based authentication out of the box; opt-in API tokens for integrations (AUTH_GUARD_API).',
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
							icon('pepicons-pencil:shield-check', 'secondary', 'secondary-light'),
							title('2FA TOTP', 3),
							para('Enrollment, verification and recovery flows, applied where they matter.', 'sm', 'muted'),
						],
						undefined,
						'card',
					),
					section(
						'surface',
						'md',
						'md',
						[
							icon('pepicons-pencil:people', 'secondary', 'secondary-light'),
							title('RBAC', 3),
							para('Roles, granular permissions and team invites — enforced at the transport layer.', 'sm', 'muted'),
						],
						undefined,
						'card',
					),
				]),
				quote(
					'Every sensitive action lands in an immutable audit journal — who, what, when, from where.',
					'Audit trail',
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
							icon('pepicons-pencil:grid', 'primary', 'primary-light'),
							title('Visual builder', 3),
							para(
								'17 blocks with responsive grids and flex, saved as typed JSON — edited in the browser, not in a diff.',
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
							icon('pepicons-pencil:rewind-time', 'primary', 'primary-light'),
							title('Revisions', 3),
							para('Every save is a revision; a page rolls back in one click, history stays intact.', 'sm', 'muted'),
						],
						undefined,
						'card',
					),
					section(
						'canvas',
						'md',
						'md',
						[
							icon('pepicons-pencil:earth-americas', 'primary', 'primary-light'),
							title('Multilingual', 3),
							para('Per-locale translations with unique slugs and locale-aware resolution at the edge.', 'sm', 'muted'),
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
						flex([icon(name, 'secondary', 'secondary-light', 36), title(label, 4)], { direction: 'col', gap: 'xs' }),
					),
				),
			],
			'operations',
		),

		// ── CTA ────────────────────────────────────────────────────────────────
		section(
			'secondary',
			'xl',
			'md',
			[
				flex(
					[
						title('See the blocks in action', 2, 'ink-inverted'),
						para(
							'The showcase renders all 17 block types on a single page.',
							'base',
							'ink-inverted',
							'base',
							'max-w-2xl',
						),
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
