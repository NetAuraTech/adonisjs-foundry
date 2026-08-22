import app from '@adonisjs/core/services/app';
import emitter from '@adonisjs/core/services/emitter';
import testUtils from '@adonisjs/core/services/test_utils';
import limiter from '@adonisjs/limiter/services/main';
import { test } from '@japa/runner';
import User from '#models/auth/user';
import LogEntry from '#models/core/log_entry';
import { MaintenanceService } from '#services/maintenance/maintenance_service';
import { createAdminUser } from '#tests/helpers/create_admin_user';
import { createVerifiedUser } from '#tests/helpers/create_verified_user';
import { resetSharedState } from '#tests/helpers/shared_state';

test.group('Admin REST API v1 — Dashboard', (group) => {
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(resetSharedState);
	group.each.setup(() => limiter.clear());
	group.each.setup(() => {
		emitter.fake();
		return () => emitter.restore();
	});
	group.each.teardown(() => limiter.clear());

	test('returns aggregated dashboard stats', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-dashboard@example.com',
			permissionSlugs: [],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client.get('/api/v1/admin/dashboard').accept('json').bearerToken(token.value!.release());

		res.assertStatus(200);
		assert.exists(res.body());
	});

	test('dashboard returns 401 without token', async ({ client }) => {
		const res = await client.get('/api/v1/admin/dashboard').accept('json');
		res.assertStatus(401);
	});

	test('dashboard returns 403 without admin.access', async ({ client }) => {
		const user = await createVerifiedUser({ email: 'noperm-dashboard@example.com' });
		const token = await User.accessTokens.create(user);

		const res = await client.get('/api/v1/admin/dashboard').accept('json').bearerToken(token.value!.release());

		res.assertStatus(403);
	});
});

test.group('Admin REST API v1 — Logs', (group) => {
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(resetSharedState);
	group.each.setup(() => limiter.clear());
	group.each.setup(() => {
		emitter.fake();
		return () => emitter.restore();
	});
	group.each.teardown(() => limiter.clear());

	test('lists log entries as a paginated payload', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-logs@example.com',
			permissionSlugs: ['logs.view'],
		});
		const token = await User.accessTokens.create(admin);

		await LogEntry.create({
			message: 'Test log entry',
			level: 'info' as any,
			category: 'system' as any,
		});

		const res = await client
			.get('/api/v1/admin/logs?page=1&perPage=20')
			.accept('json')
			.bearerToken(token.value!.release());

		res.assertStatus(200);
		assert.isArray(res.body().data);
		assert.exists(res.body().metadata);
	});

	test('logs returns 401 without token', async ({ client }) => {
		const res = await client.get('/api/v1/admin/logs').accept('json');
		res.assertStatus(401);
	});

	test('logs returns 403 without logs.view', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'noperm-logs@example.com',
			permissionSlugs: [],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client.get('/api/v1/admin/logs').accept('json').bearerToken(token.value!.release());

		res.assertStatus(403);
	});
});

test.group('Admin REST API v1 — Maintenance', (group) => {
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(resetSharedState);
	group.each.setup(() => limiter.clear());
	group.each.setup(() => {
		emitter.fake();
		return () => emitter.restore();
	});
	group.each.teardown(() => limiter.clear());

	test('returns the maintenance configuration', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-maintenance@example.com',
			permissionSlugs: ['settings.maintenance'],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client.get('/api/v1/admin/maintenance').accept('json').bearerToken(token.value!.release());

		res.assertStatus(200);
		assert.isFalse(res.body().data.config.enabled);
	});

	test('updates the maintenance configuration', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-maintenance-update@example.com',
			permissionSlugs: ['settings.maintenance'],
		});
		const token = await User.accessTokens.create(admin);

		const service = await app.container.make(MaintenanceService);
		await service.setConfig({ enabled: false });

		const res = await client
			.put('/api/v1/admin/maintenance')
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ message: 'Scheduled maintenance', allowedIps: ['127.0.0.1'] });

		res.assertStatus(200);
		assert.equal(res.body().data.config.allowedIps[0], '127.0.0.1');

		const config = await service.getConfig();
		assert.equal(config.allowedIps[0], '127.0.0.1');
	});

	test('toggles maintenance mode', async ({ client, assert }) => {
		const admin = await createAdminUser({
			email: 'admin-maintenance-toggle@example.com',
			permissionSlugs: ['settings.maintenance'],
		});
		const token = await User.accessTokens.create(admin);

		const service = await app.container.make(MaintenanceService);
		await service.setConfig({ enabled: false });

		const res = await client
			.put('/api/v1/admin/maintenance/toggle')
			.accept('json')
			.bearerToken(token.value!.release())
			.json({ enabled: true });

		res.assertStatus(200);
		assert.isTrue(res.body().data.enabled);

		const config = await service.getConfig();
		assert.isTrue(config.enabled);
	});

	test('maintenance returns 401 without token', async ({ client }) => {
		const res = await client.get('/api/v1/admin/maintenance').accept('json');
		res.assertStatus(401);
	});

	test('maintenance returns 403 without settings.maintenance', async ({ client }) => {
		const admin = await createAdminUser({
			email: 'noperm-maintenance@example.com',
			permissionSlugs: [],
		});
		const token = await User.accessTokens.create(admin);

		const res = await client.get('/api/v1/admin/maintenance').accept('json').bearerToken(token.value!.release());

		res.assertStatus(403);
	});
});
