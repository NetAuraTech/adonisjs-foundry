import { test } from '@japa/runner';
import { DashboardRegistry } from '#services/core/dashboard_registry';
import type { DashboardCollector, DashboardCollectorPayload } from '#types/dashboard';

const payload: DashboardCollectorPayload = { recentLimit: 5 };

test.group('DashboardRegistry — CMS sections', () => {
	test('entries() lists template section in registration order', ({ assert }) => {
		const registry = new DashboardRegistry();
		const collector: DashboardCollector<'template'> = {
			collect: async () => ({ templates: 0 }),
		};

		registry.register('template', async () => collector);

		assert.deepEqual(
			registry.entries().map(([section]) => section),
			['template'],
		);
	});

	test('register() does not invoke the factory', async ({ assert }) => {
		const registry = new DashboardRegistry();
		let invoked = false;

		registry.register('template', async () => {
			invoked = true;
			return { collect: async () => ({ templates: 0 }) };
		});

		assert.isFalse(invoked);
	});

	test('registering the same section twice replaces the previous factory', async ({ assert }) => {
		const registry = new DashboardRegistry();
		const replacement: DashboardCollector<'template'> = {
			collect: async () => ({ templates: 42 }),
		};

		registry.register('template', async () => ({ collect: async () => ({ templates: 0 }) }));
		registry.register('template', async () => replacement);

		const entries = registry.entries();
		assert.lengthOf(entries, 1);
		const factory = entries[0][1];
		const collector = await factory();
		assert.deepEqual(await collector.collect(payload), { templates: 42 });
	});
});
