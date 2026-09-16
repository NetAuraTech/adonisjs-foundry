import { test } from '@japa/runner';
import { CacheService } from '#shared/services/cache_service';
import type { CacheDriver } from '#core/contracts/cache_driver';

/**
 * Shared contract suite that every {@link CacheDriver} implementation must
 * pass. The operations are exercised through the {@link CacheService} facade
 * so namespacing behaviour is covered alongside the raw driver operations
 * (get / set / has / delete / remember / increment / pattern operations /
 * flush, TTL expiry semantics).
 *
 * Each test works inside a unique namespace, so driver-backed stores shared
 * across suites (Redis) are not disturbed beyond the `flush()` test itself.
 * When the driver's backing store is unreachable, the whole group is skipped.
 *
 * @param name - Driver display name, used in the test group label.
 * @param createDriver - Builds a fresh driver instance for the group.
 *
 * @example
 * cacheDriverContractTests('in-memory', () => new InMemoryCacheDriver())
 */
export function cacheDriverContractTests(name: string, createDriver: () => CacheDriver): void {
	test.group(`CacheDriver contract (${name})`, (group) => {
		let ns: CacheService;
		let nsName: string;

		let available = true;

		group.setup(async () => {
			const probe = createDriver();
			try {
				await probe.has('contract:probe');
			} catch {
				available = false;
			}
		});

		group.each.skip(() => !available, 'driver backing store unavailable');

		group.each.setup(() => {
			nsName = `contract_${Math.random().toString(36).slice(2)}`;
			ns = new CacheService(createDriver()).namespace(nsName);
		});

		group.each.teardown(async () => {
			await ns.deletePattern('*');
		});

		test('set() and get() round-trip JSON-serializable data', async ({ assert }) => {
			const payload = { foo: 'bar', age: 42, nested: [1, 2, 3] };
			await ns.set('data', payload);

			const retrieved = await ns.get<typeof payload>('data');
			assert.deepEqual(retrieved, payload);
		});

		test('get() returns null for a missing key', async ({ assert }) => {
			assert.isNull(await ns.get('missing'));
		});

		test('set() without a TTL keeps the value', async ({ assert }) => {
			await ns.set('persistent', 'value');

			assert.isTrue(await ns.has('persistent'));
			assert.equal(await ns.get('persistent'), 'value');
		});

		test('set() with a TTL expires the value', async ({ assert }) => {
			await ns.set('expiring', 'value', 1);
			assert.isTrue(await ns.has('expiring'));

			await new Promise((resolve) => setTimeout(resolve, 1100));

			assert.isFalse(await ns.has('expiring'));
			assert.isNull(await ns.get('expiring'));
		}).timeout(3000);

		test('has() reflects existence', async ({ assert }) => {
			assert.isFalse(await ns.has('present'));
			await ns.set('present', 'value');
			assert.isTrue(await ns.has('present'));
		});

		test('delete() removes a key and is a no-op for a missing key', async ({ assert }) => {
			await ns.set('deletable', 'value');
			await ns.delete('deletable');
			assert.isFalse(await ns.has('deletable'));

			await ns.delete('deletable');
			await ns.delete('never-existed');
		});

		test('remember() returns the cached value without calling the factory on a hit', async ({ assert }) => {
			await ns.set('remembered', 'cached-value');

			let factoryCalled = false;
			const value = await ns.remember('remembered', async () => {
				factoryCalled = true;
				return 'factory-value';
			});

			assert.equal(value, 'cached-value');
			assert.isFalse(factoryCalled);
		});

		test('remember() calls the factory on a miss and caches the result', async ({ assert }) => {
			let factoryCalled = false;
			const value = await ns.remember(
				'remembered-miss',
				async () => {
					factoryCalled = true;
					return 'factory-value';
				},
				60,
			);

			assert.equal(value, 'factory-value');
			assert.isTrue(factoryCalled);
			assert.equal(await ns.get('remembered-miss'), 'factory-value');
		});

		test('increment() starts at the step and accumulates', async ({ assert }) => {
			let value = await ns.increment('counter');
			assert.equal(value, 1);

			value = await ns.increment('counter');
			assert.equal(value, 2);

			value = await ns.increment('counter', 5);
			assert.equal(value, 7);
		});

		test('keys() returns the full keys matching the pattern', async ({ assert }) => {
			await ns.set('sub:1', 'a');
			await ns.set('sub:2', 'b');
			await ns.set('other:3', 'c');

			const keys = await ns.keys('sub:*');
			assert.lengthOf(keys, 2);
			assert.includeMembers(keys, [`${nsName}:sub:1`, `${nsName}:sub:2`]);
		});

		test('deletePattern() removes matching keys only', async ({ assert }) => {
			await ns.set('sub:1', 'a');
			await ns.set('sub:2', 'b');
			await ns.set('other:3', 'c');

			await ns.deletePattern('sub:*');

			assert.isFalse(await ns.has('sub:1'));
			assert.isFalse(await ns.has('sub:2'));
			assert.isTrue(await ns.has('other:3'));
		});

		test('flush() removes every key', async ({ assert }) => {
			await ns.set('flush:1', 'a');
			await ns.set('flush:2', 'b');

			await ns.flush();

			assert.isFalse(await ns.has('flush:1'));
			assert.isFalse(await ns.has('flush:2'));
		});

		test('namespaces prefix keys and stay visible from the parent', async ({ assert }) => {
			const child = ns.namespace('child');
			await child.set('k', 'v');

			assert.isTrue(await ns.has('child:k'));
			assert.equal(await ns.get('child:k'), 'v');
			assert.includeMembers(await ns.keys('child:*'), [`${nsName}:child:k`]);
		});
	});
}
