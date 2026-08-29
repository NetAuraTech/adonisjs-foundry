import app from '@adonisjs/core/services/app';
import hash from '@adonisjs/core/services/hash';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';
import { ResetPasswordAction } from '#auth/actions/password/reset_password_action';
import { Token } from '#auth/domain/token';
import { TOKEN_TYPES } from '#auth/enums/token_type';
import InvalidTokenException from '#auth/exceptions/invalid_token_exception';
import MaxAttemptsExceededException from '#auth/exceptions/max_attempts_exceeded_exception';
import { TokenRepository } from '#auth/repositories/token_repository';
import User from '#identity/models/user';

test.group('ResetPasswordAction', () => {
	const createResetToken = async (
		tokenRepo: TokenRepository,
		userId: number,
		options: { expiresInHours?: number; attempts?: number } = {},
	) => {
		const { selector, validator, token: fullToken } = Token.generateSplit();

		await tokenRepo.create({
			userId,
			type: TOKEN_TYPES.PASSWORD_RESET,
			selector,
			token: await hash.make(validator),
			expiresAt: DateTime.now().plus({ hours: options.expiresInHours ?? 1 }),
			attempts: options.attempts ?? 0,
		});

		return { selector, fullToken };
	};

	test('execute() updates password and expires tokens', async ({ assert }) => {
		const action = await app.container.make(ResetPasswordAction);
		const tokenRepo = await app.container.make(TokenRepository);

		const user = await User.create({
			email: 'reset@test.com',
			username: 'reset',
			password: 'old_password',
		});

		const { fullToken } = await createResetToken(tokenRepo, user.id);

		const updatedUser = await action.execute({
			token: fullToken as any,
			password: 'new_password123',
		});

		assert.equal(updatedUser.id, user.id);
		assert.isTrue(await hash.verify(updatedUser.password!, 'new_password123'));

		await assert.rejects(async () => {
			await tokenRepo.getPasswordResetUser(fullToken as any);
		}, InvalidTokenException);
	});

	test('execute() throws on invalid token', async ({ assert }) => {
		const action = await app.container.make(ResetPasswordAction);

		await assert.rejects(async () => {
			await action.execute({ token: 'invalid.token' as any, password: 'new_password' });
		}, InvalidTokenException);
	});

	test('execute() consumes exactly one attempt on success and expires the token', async ({ assert }) => {
		const action = await app.container.make(ResetPasswordAction);
		const tokenRepo = await app.container.make(TokenRepository);

		const user = await User.create({
			email: 'reset_count@test.com',
			username: 'reset_count',
			password: 'old_password',
		});

		const { selector, fullToken } = await createResetToken(tokenRepo, user.id);

		await action.execute({
			token: fullToken as any,
			password: 'new_password123',
		});

		const record = await tokenRepo.findOne({ selector });
		assert.equal(record!.attempts, 1);
		assert.isAtMost(record!.expiresAt!.toMillis(), DateTime.now().toMillis());
	});

	test('execute() consumes exactly one attempt on an invalid validator', async ({ assert }) => {
		const action = await app.container.make(ResetPasswordAction);
		const tokenRepo = await app.container.make(TokenRepository);

		const user = await User.create({
			email: 'reset_badval@test.com',
			username: 'reset_badval',
			password: 'old_password',
		});

		const { selector } = await createResetToken(tokenRepo, user.id);

		await assert.rejects(async () => {
			await action.execute({ token: `${selector}.wrongvalidator` as any, password: 'new_password123' });
		}, InvalidTokenException);

		assert.equal((await tokenRepo.findOne({ selector }))!.attempts, 1);
	});

	test('execute() consumes exactly one attempt on an expired token', async ({ assert }) => {
		const action = await app.container.make(ResetPasswordAction);
		const tokenRepo = await app.container.make(TokenRepository);

		const user = await User.create({
			email: 'reset_expired@test.com',
			username: 'reset_expired',
			password: 'old_password',
		});

		const { selector, fullToken } = await createResetToken(tokenRepo, user.id, { expiresInHours: -1 });

		await assert.rejects(async () => {
			await action.execute({ token: fullToken as any, password: 'new_password123' });
		}, InvalidTokenException);

		assert.equal((await tokenRepo.findOne({ selector }))!.attempts, 1);
	});

	test('execute() throws without further increment on a locked token', async ({ assert }) => {
		const action = await app.container.make(ResetPasswordAction);
		const tokenRepo = await app.container.make(TokenRepository);

		const user = await User.create({
			email: 'reset_locked@test.com',
			username: 'reset_locked',
			password: 'old_password',
		});

		const { selector, fullToken } = await createResetToken(tokenRepo, user.id, {
			attempts: tokenRepo.MAX_ATTEMPTS,
		});

		await assert.rejects(async () => {
			await action.execute({ token: fullToken as any, password: 'new_password123' });
		}, MaxAttemptsExceededException);

		assert.equal((await tokenRepo.findOne({ selector }))!.attempts, tokenRepo.MAX_ATTEMPTS);
	});
});
