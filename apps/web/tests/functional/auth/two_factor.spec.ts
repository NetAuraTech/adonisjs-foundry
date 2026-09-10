import testUtils from '@adonisjs/core/services/test_utils';
import limiter from '@adonisjs/limiter/services/main';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';
import { Totp } from '#auth/domain/totp';
import { createTwoFactorCipher } from '#auth/domain/two_factor_cipher';
import User from '#identity/models/user';
import env from '#start/env';
import { createVerifiedUser } from '#tests/helpers/create_verified_user';
import { resetSharedState } from '#tests/helpers/shared_state';

const cipher = createTwoFactorCipher(env.get('APP_KEY').release());

/**
 * Creates a verified user that already has TOTP 2FA enabled for `secret`.
 * The secret is encrypted at rest with the same application key the
 * {@link TwoFactorService} uses, so a valid code for it is accepted at login.
 */
async function createTwoFactorUser(email: string, secret: string) {
	return User.create({
		username: email.split('@')[0],
		email,
		password: 'TestPassword123!',
		emailVerifiedAt: DateTime.now(),
		twoFactorEnabled: true,
		twoFactorSecret: cipher.encrypt(secret),
	});
}

/**
 * Functional seam for two-factor (TOTP) authentication.
 *
 * Covers the login-time challenge — a 2FA-enabled user is parked at
 * `/two-factor` after the password (never authenticated), only a valid code
 * opens a session, and a wrong code is rejected with a coded 401 — plus the
 * enrollment self-service endpoints on the account settings page. The verify
 * steps seed the pending challenge via `withSession`, mirroring what the login
 * POST stores, since the api-client does not carry app-written session state
 * across a follow-up CSRF'd request.
 */
test.group('Two-factor (TOTP) authentication', (group) => {
	group.each.setup(() => testUtils.db().truncate());
	group.each.setup(resetSharedState);
	group.each.setup(() => limiter.clear());
	group.each.teardown(() => limiter.clear());

	test('login: a 2FA user is redirected to the challenge and is not yet authenticated', async ({ client }) => {
		const user = await createTwoFactorUser('2fa-redirect@example.com', Totp.generateSecret());

		const res = await client
			.post('/login')
			.redirects(0)
			.withCsrfToken()
			.form({ email: user.email, password: 'TestPassword123!' })
			.send();

		res.assertStatus(302);
		res.assertHeader('location', '/two-factor');

		// The password alone must not open a session.
		const guarded = await client.get('/settings/profile').redirects(0);
		guarded.assertStatus(302);
	});

	test('verify: a pending 2FA user with a valid code is authenticated', async ({ client }) => {
		const secret = Totp.generateSecret();
		const user = await createTwoFactorUser('2fa-valid@example.com', secret);

		// Seed the pending challenge exactly as the login POST parks it, then
		// submit the code. A valid code opens a session; a wrong one cannot.
		const res = await client
			.post('/two-factor')
			.redirects(0)
			.withSession({ twoFactorUserId: user.id })
			.withCsrfToken()
			.form({ code: Totp.code(secret) })
			.send();

		res.assertStatus(302);
		res.assertHeader('location', '/settings/profile');

		const guarded = await client.get('/settings/profile');
		guarded.assertStatus(200);
	});

	test('verify: a pending 2FA user with a wrong code is rejected with a coded 401', async ({ client, assert }) => {
		const secret = Totp.generateSecret();
		const user = await createTwoFactorUser('2fa-wrong@example.com', secret);

		// Flip the current code's leading digit so it is guaranteed to be wrong.
		const current = Totp.code(secret);
		const wrong = String((Number(current[0]) + 1) % 10) + current.slice(1);

		const res = await client
			.post('/two-factor')
			.redirects(0)
			.withSession({ twoFactorUserId: user.id })
			.withCsrfToken()
			.accept('json')
			.form({ code: wrong })
			.send();

		res.assertStatus(401);
		assert.equal(res.body().error.code, 'E_INVALID_TWO_FACTOR_CODE');

		const guarded = await client.get('/settings/profile').redirects(0);
		guarded.assertStatus(302);
	});

	test('enrollment: begin_2fa starts a pending enrollment for an authenticated user', async ({ client }) => {
		const user = await createVerifiedUser({
			email: 'enroll-begin@example.com',
			password: 'TestPassword123!',
		});

		const res = await client
			.post('/settings/account')
			.redirects(0)
			.withCsrfToken()
			.loginAs(user)
			.form({ _action: 'begin_2fa' })
			.send();

		res.assertStatus(302);
		res.assertHeader('location', '/settings/account');
	});

	test('enrollment: confirm_2fa without a pending secret is rejected', async ({ client }) => {
		const user = await createVerifiedUser({
			email: 'enroll-no-pending@example.com',
			password: 'TestPassword123!',
		});

		const res = await client
			.post('/settings/account')
			.redirects(0)
			.withCsrfToken()
			.loginAs(user)
			.accept('json')
			.form({ _action: 'confirm_2fa', code: '123456' })
			.send();

		res.assertStatus(400);
	});
});
