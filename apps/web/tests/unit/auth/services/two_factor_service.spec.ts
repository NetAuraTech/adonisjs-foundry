import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';
import { Totp } from '#auth/domain/totp';
import InvalidTwoFactorCodeException from '#auth/exceptions/invalid_two_factor_code_exception';
import { TwoFactorService } from '#auth/services/two_factor_service';
import User from '#identity/models/user';

/**
 * Unit seam for the 2FA business service, exercised against the real container
 * and test database. The critical guarantee: the TOTP secret is stored
 * *encrypted* — the plaintext never reaches the database.
 */
test.group('TwoFactorService', () => {
	async function makeService(): Promise<TwoFactorService> {
		return app.container.make(TwoFactorService);
	}

	async function makeUser(email: string): Promise<User> {
		return User.create({ email, username: email.split('@')[0], password: 'password', emailVerifiedAt: DateTime.now() });
	}

	test('beginEnrollment: returns a secret and URI without persisting anything', async ({ assert }) => {
		const service = await makeService();
		const user = await makeUser('begin@test.com');

		const { secret, otpauthUri } = service.beginEnrollment(user);

		assert.isString(secret);
		assert.match(secret, /^[A-Z2-7]+$/);
		assert.isTrue(otpauthUri.startsWith('otpauth://totp/'));
		assert.isTrue(otpauthUri.includes('secret=' + encodeURIComponent(secret)));

		// Nothing persisted yet: the user is unchanged.
		const fresh = await User.find(user.id);
		assert.isFalse(!!fresh?.twoFactorEnabled);
		assert.isNull(fresh?.twoFactorSecret);
	});

	test('confirmEnrollment: valid code enables 2FA and stores an encrypted secret', async ({ assert }) => {
		const service = await makeService();
		const user = await makeUser('confirm@test.com');

		const { secret } = service.beginEnrollment(user);
		const code = Totp.code(secret);
		const updated = await service.confirmEnrollment(user, code, secret);

		assert.isTrue(!!updated.twoFactorEnabled);
		assert.isString(updated.twoFactorSecret!);
		// The plaintext secret must not be stored in plain text.
		assert.isFalse(updated.twoFactorSecret!.includes(secret));

		const fresh = await User.find(user.id);
		assert.isFalse(!!fresh?.twoFactorSecret?.includes(secret));
	});

	test('confirmEnrollment: a wrong code is rejected and 2FA stays disabled', async ({ assert }) => {
		const service = await makeService();
		const user = await makeUser('wrong@test.com');

		const { secret } = service.beginEnrollment(user);
		const wrongCode = String((Number(Totp.code(secret)) + 1) % 1_000_000).padStart(6, '0');

		await assert.rejects(async () => {
			await service.confirmEnrollment(user, wrongCode, secret);
		}, InvalidTwoFactorCodeException);

		const fresh = await User.find(user.id);
		assert.isFalse(!!fresh?.twoFactorEnabled);
		assert.isNull(fresh?.twoFactorSecret);
	});

	test('verifyLoginCode: accepts a valid code for an enrolled user', async ({ assert }) => {
		const service = await makeService();
		const user = await makeUser('login@test.com');

		const { secret } = service.beginEnrollment(user);
		const updated = await service.confirmEnrollment(user, Totp.code(secret), secret);

		const loginCode = Totp.code(secret);
		const verified = await service.verifyLoginCode(updated, loginCode);
		assert.equal(verified.id, user.id);
	});

	test('verifyLoginCode: rejects a wrong code', async ({ assert }) => {
		const service = await makeService();
		const user = await makeUser('badcode@test.com');

		const { secret } = service.beginEnrollment(user);
		const updated = await service.confirmEnrollment(user, Totp.code(secret), secret);

		const wrong = String((Number(Totp.code(secret)) + 1) % 1_000_000).padStart(6, '0');
		await assert.rejects(async () => {
			await service.verifyLoginCode(updated, wrong);
		}, InvalidTwoFactorCodeException);
	});
});
