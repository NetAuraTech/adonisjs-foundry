import { type HttpContext } from '@adonisjs/core/http';
import { test } from '@japa/runner';
import { handle } from '#rest/page_adapter';
import { type AnyRestEndpoint } from '#rest/rest_adapter';

interface RecordedCall {
	method: string;
	args: unknown[];
}

/**
 * Builds a minimal `HttpContext` double for the page transport: fake request
 * method and body, route params, an Inertia render and a session flash that
 * record their calls, and a redirect that records its target.
 */
function createFakePageContext(
	method: string = 'GET',
	body: Record<string, unknown> = {},
	params: Record<string, string> = {},
) {
	const calls: RecordedCall[] = [];

	const ctx = {
		request: {
			method: () => method,
			all: () => ({ ...body }),
		},
		params: { ...params },
		session: {
			flash(key: string, value: unknown) {
				calls.push({ method: 'flash', args: [key, value] });
			},
		},
		inertia: {
			render(component: string, props: unknown) {
				calls.push({ method: 'inertia.render', args: [component, props] });
				return { rendered: true, component, props };
			},
		},
		response: {
			redirect: () => ({
				toRoute(route: string, routeParams: unknown) {
					calls.push({ method: 'toRoute', args: [route, routeParams] });
					return { redirected: true, route, routeParams };
				},
			}),
		},
	};

	return { ctx: ctx as unknown as HttpContext, calls };
}

test.group('handle', () => {
	test('renders the Inertia page with the props built by `page.render` on display methods', async ({ assert }) => {
		const { ctx, calls } = createFakePageContext('GET', { search: 'ada' }, {});
		let seen: { prepared?: unknown; payload?: unknown; result?: unknown } | undefined;

		const endpoint: AnyRestEndpoint = {
			validator: () => ({ validate: async (data) => data }),
			execute: async (_context, _prepared, payload) => {
				seen = { ...(seen ?? {}), payload };
				return { id: 7 };
			},
			prepare: async () => {
				seen = { ...(seen ?? {}), prepared: { allowed: ['admin'] } };
				return { allowed: ['admin'] };
			},
			page: {
				component: 'auth/admin/index',
				render: async (_context, prepared, payload, result) => ({
					prepared,
					payload,
					result,
				}),
			},
		};

		const response = await handle(ctx, endpoint);

		assert.deepEqual(calls, [
			{
				method: 'inertia.render',
				args: [
					'auth/admin/index',
					{
						prepared: { allowed: ['admin'] },
						payload: { search: 'ada' },
						result: { id: 7 },
					},
				],
			},
		]);
		assert.deepEqual(seen?.prepared, { allowed: ['admin'] });
		assert.deepEqual(seen?.payload, { search: 'ada' });
		assert.deepEqual(response, {
			rendered: true,
			component: 'auth/admin/index',
			props: {
				prepared: { allowed: ['admin'] },
				payload: { search: 'ada' },
				result: { id: 7 },
			},
		});
	});

	test('flashes the success message and redirects to the named route on mutating methods', async ({ assert }) => {
		const { ctx, calls } = createFakePageContext('POST', { email: 'ada@example.com' }, { id: '7' });
		let seen: { prepared?: unknown; payload?: unknown; result?: unknown } | undefined;

		const endpoint: AnyRestEndpoint = {
			input: (context) => context.params,
			validator: () => ({ validate: async () => 'ok' }),
			execute: async (_context, _prepared, payload) => {
				seen = { ...(seen ?? {}), payload, result: { pendingEmail: 'ada@example.com' } };
				return { pendingEmail: 'ada@example.com' };
			},
			prepare: async (context) => {
				seen = { ...(seen ?? {}), prepared: context.params };
				return context.params;
			},
			page: {
				flash: (_context, _prepared, payload, result) =>
					payload === 'ok' && result.pendingEmail ? 'user updated' : 'noop',
				redirect: (_context, prepared) => ({
					route: 'admin.identity.users_show.render',
					params: { id: prepared.id },
				}),
			},
		};

		const response = await handle(ctx, endpoint);

		assert.deepEqual(calls, [
			{ method: 'flash', args: ['success', 'user updated'] },
			{ method: 'toRoute', args: ['admin.identity.users_show.render', { id: '7' }] },
		]);
		assert.deepEqual(seen?.prepared, { id: '7' });
		assert.equal(seen?.payload, 'ok');
		assert.deepEqual(seen?.result, { pendingEmail: 'ada@example.com' });
		assert.deepEqual(response, {
			redirected: true,
			route: 'admin.identity.users_show.render',
			routeParams: { id: '7' },
		});
	});

	test('treats HEAD like GET', async ({ assert }) => {
		const { ctx, calls } = createFakePageContext('HEAD');

		const endpoint: AnyRestEndpoint = {
			execute: async () => 'ok',
			page: {
				component: 'auth/admin/index',
				render: async () => ({}),
			},
		};

		await handle(ctx, endpoint);

		assert.deepEqual(calls, [{ method: 'inertia.render', args: ['auth/admin/index', {}] }]);
	});

	test('propagates validation errors without rendering or flashing', async ({ assert }) => {
		const { ctx, calls } = createFakePageContext('GET');

		const endpoint: AnyRestEndpoint = {
			validator: () => ({
				validate: async () => {
					throw new Error('validation failed');
				},
			}),
			execute: async () => 'ok',
			page: {
				component: 'auth/admin/index',
				render: async () => ({}),
			},
		};

		await assert.rejects(() => handle(ctx, endpoint), /validation failed/);

		assert.isEmpty(calls);
	});

	test('propagates domain exceptions thrown by the action', async ({ assert }) => {
		const { ctx, calls } = createFakePageContext('POST');

		const endpoint: AnyRestEndpoint = {
			execute: async () => {
				throw new Error('row not found');
			},
			page: {
				flash: () => 'ok',
				redirect: () => ({ route: 'admin.identity.users.render' }),
			},
		};

		await assert.rejects(() => handle(ctx, endpoint), /row not found/);

		assert.isEmpty(calls);
	});

	test('throws a developer error when a display endpoint lacks its render declaration', async ({ assert }) => {
		const { ctx } = createFakePageContext('GET');

		const endpoint: AnyRestEndpoint = {
			execute: async () => 'ok',
			page: {
				flash: () => 'ok',
				redirect: () => ({ route: 'admin.identity.users.render' }),
			},
		};

		await assert.rejects(() => handle(ctx, endpoint), /page render declaration/);
	});

	test('throws a developer error when a mutating endpoint lacks its flash and redirect', async ({ assert }) => {
		const { ctx } = createFakePageContext('POST');

		const endpoint: AnyRestEndpoint = {
			execute: async () => 'ok',
			page: {
				component: 'auth/admin/index',
				render: async () => ({}),
			},
		};

		await assert.rejects(() => handle(ctx, endpoint), /flash and redirect declarations/);
	});
});
