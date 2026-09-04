import hash from '@adonisjs/core/services/hash';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';
import { TOKEN_TYPES, type FullToken } from '#auth/enums/token_type';
import InvalidTokenException from '#auth/exceptions/invalid_token_exception';
import MaxAttemptsExceededException from '#auth/exceptions/max_attempts_exceeded_exception';
import { TokenRepository } from '#auth/repositories/token_repository';
import { withTransaction } from '#core/services/with_transaction';
import { UserFactory } from '#factories/identity/user_factory';
import { LogService } from '#log/services/log_service';
import type Token from '#auth/models/token';

test.group('TokenRepository', () => {
	const logService = new LogService();
	const repo = new TokenRepository(logService);

	const uniqueUser = async (prefix: string) => {
		const timestamp = Date.now() + Math.floor(Math.random() * 100000);
		return await UserFactory.merge({
			username: `${prefix}_${timestamp}`,
			email: `${prefix}_${timestamp}@example.com`,
		}).create();
	};

	const createTestToken = async (
		userId: number,
		type: string,
		expiresInHours = 1,
	): Promise<{ tokenModel: Token; plainToken: FullToken }> => {
		const selector = Math.random().toString(36).substring(2, 10);
		const validator = Math.random().toString(36).substring(2, 10);
		const plainToken = `${selector}.${validator}` as FullToken;
		const hashedValidator = await hash.make(validator);

		const tokenModel = await repo.create({
			userId,
			type: type as any,
			selector,
			token: hashedValidator,
			expiresAt: DateTime.now().plus({ hours: expiresInHours }),
		});

		return { tokenModel, plainToken };
	};

	test('create(), findById(), and delete()', async ({ assert }) => {
		const u = await uniqueUser('create');
		const { tokenModel } = await createTestToken(u.id, TOKEN_TYPES.PASSWORD_RESET);

		const found = await repo.findById(tokenModel.id);
		assert.isNotNull(found);

		const deleted = await repo.delete(tokenModel.id);
		assert.isTrue(deleted);

		assert.isNull(await repo.findById(tokenModel.id));
	});

	test('update()', async ({ assert }) => {
		const u = await uniqueUser('update');
		const { tokenModel } = await createTestToken(u.id, TOKEN_TYPES.PASSWORD_RESET);

		const updated = await repo.update(tokenModel.id, { attempts: 5 });
		assert.equal(updated!.attempts, 5);
	});

	test('verify() works with valid and invalid tokens', async ({ assert }) => {
		const u = await uniqueUser('verify');
		const { plainToken } = await createTestToken(u.id, TOKEN_TYPES.PASSWORD_RESET);

		assert.isTrue(await repo.verify(plainToken, TOKEN_TYPES.PASSWORD_RESET));

		// Wrong type
		assert.isFalse(await repo.verify(plainToken, TOKEN_TYPES.EMAIL_VERIFICATION));

		// Bad validator
		const badValidatorToken = `${plainToken.split('.')[0]}.wrongval` as FullToken;
		assert.isFalse(await repo.verify(badValidatorToken, TOKEN_TYPES.PASSWORD_RESET));

		// Bad selector
		assert.isFalse(await repo.verify('wrongsel.val' as FullToken, TOKEN_TYPES.PASSWORD_RESET));

		// Malformed
		assert.isFalse(await repo.verify('malformed_token' as FullToken, TOKEN_TYPES.PASSWORD_RESET));
	});

	test('getUserFromToken() returns the user if valid', async ({ assert }) => {
		const u = await uniqueUser('getuser');
		const { plainToken } = await createTestToken(u.id, TOKEN_TYPES.PASSWORD_RESET);

		const resolvedUser = await repo.getUserFromToken(plainToken, TOKEN_TYPES.PASSWORD_RESET);
		assert.isNotNull(resolvedUser);
		assert.equal(resolvedUser!.id, u.id);

		const badUser = await repo.getUserFromToken('bad.token' as FullToken, TOKEN_TYPES.PASSWORD_RESET);
		assert.isNull(badUser);
	});

	test('checkAttempts() is the single increment path and enforces MAX_ATTEMPTS', async ({ assert }) => {
		const u = await uniqueUser('attempts');
		const { plainToken, tokenModel } = await createTestToken(u.id, TOKEN_TYPES.PASSWORD_RESET);

		await repo.checkAttempts(plainToken);
		await repo.checkAttempts(plainToken);
		await repo.checkAttempts(plainToken);

		const reloaded = await repo.findById(tokenModel.id);
		assert.equal(reloaded!.attempts, 3);

		// MAX_ATTEMPTS is 3 — once the counter reaches the cap, the next
		// check throws and no further increment happens.
		await assert.rejects(async () => repo.checkAttempts(plainToken), MaxAttemptsExceededException);
		assert.equal((await repo.findById(tokenModel.id))!.attempts, 3);
	});

	test('checkAttempts() cannot be bypassed by concurrent presentations', async ({ assert }) => {
		const u = await uniqueUser('concurrent');
		const { plainToken, tokenModel } = await createTestToken(u.id, TOKEN_TYPES.PASSWORD_RESET);

		// MAX_ATTEMPTS is 3: of 10 concurrent presentations, exactly 3 may
		// pass the check and increment — the rest must observe the lockout.
		// An unlocked check-then-act lets the concurrent readers all see the
		// stale counter, bypass the cap, and clobber each other's increment.
		const results = await Promise.allSettled(Array.from({ length: 10 }, () => repo.checkAttempts(plainToken)));

		const accepted = results.filter((r) => r.status === 'fulfilled');
		const rejected = results.filter((r) => r.status === 'rejected');

		assert.equal(accepted.length, 3);
		assert.equal(rejected.length, 7);

		for (const r of rejected) {
			assert.isTrue(r.reason instanceof MaxAttemptsExceededException);
		}

		assert.equal((await repo.findById(tokenModel.id))!.attempts, 3);
	});

	test('verify() consumes exactly one attempt per call', async ({ assert }) => {
		const u = await uniqueUser('verifycount');
		const { plainToken, tokenModel } = await createTestToken(u.id, TOKEN_TYPES.PASSWORD_RESET);

		assert.isTrue(await repo.verify(plainToken, TOKEN_TYPES.PASSWORD_RESET));
		assert.equal((await repo.findById(tokenModel.id))!.attempts, 1);

		// A failed verification consumes an attempt too.
		const badValidatorToken = `${plainToken.split('.')[0]}.wrongval` as FullToken;
		assert.isFalse(await repo.verify(badValidatorToken, TOKEN_TYPES.PASSWORD_RESET));
		assert.equal((await repo.findById(tokenModel.id))!.attempts, 2);

		// Unknown selector and malformed tokens consume nothing — no record to increment.
		assert.isFalse(await repo.verify('unknownsel.val' as FullToken, TOKEN_TYPES.PASSWORD_RESET));
		assert.isFalse(await repo.verify('malformed_token' as FullToken, TOKEN_TYPES.PASSWORD_RESET));
		assert.equal((await repo.findById(tokenModel.id))!.attempts, 2);
	});

	test('expireTokensByType() and convenience helpers', async ({ assert }) => {
		const u = await uniqueUser('expire');
		const { plainToken } = await createTestToken(u.id, TOKEN_TYPES.EMAIL_VERIFICATION);

		await repo.expireEmailVerificationTokens(u);

		// Verify should fail because it's expired
		assert.isFalse(await repo.verify(plainToken, TOKEN_TYPES.EMAIL_VERIFICATION));

		// Other helpers
		await repo.expirePasswordResetTokens(u);
		await repo.expireEmailChangeTokens(u);
		await repo.expireInviteTokens(u);
	});

	test('High-level GetUser methods throw InvalidTokenException on bad tokens', async ({ assert }) => {
		await assert.rejects(() => repo.getEmailVerificationUser('bad.token' as FullToken), InvalidTokenException);
		await assert.rejects(() => repo.getPasswordResetUser('bad.token' as FullToken), InvalidTokenException);
		await assert.rejects(() => repo.getEmailChangeUser('bad.token' as FullToken), InvalidTokenException);
		await assert.rejects(() => repo.getUserInvitationToken('bad.token' as FullToken), InvalidTokenException);
	});

	test('High-level GetUser methods return users for valid tokens', async ({ assert }) => {
		const u = await uniqueUser('highlevel');
		u.pendingEmail = 'pending@example.com';
		await u.save();

		const { plainToken: evToken } = await createTestToken(u.id, TOKEN_TYPES.EMAIL_VERIFICATION);
		const { plainToken: prToken } = await createTestToken(u.id, TOKEN_TYPES.PASSWORD_RESET);
		const { plainToken: ecToken } = await createTestToken(u.id, TOKEN_TYPES.EMAIL_CHANGE);
		const { plainToken: invToken } = await createTestToken(u.id, TOKEN_TYPES.PENDING_INVITE);

		const evUser = await repo.getEmailVerificationUser(evToken);
		assert.equal(evUser.id, u.id);

		const prUser = await repo.getPasswordResetUser(prToken);
		assert.equal(prUser.id, u.id);

		const ecUser = await repo.getEmailChangeUser(ecToken);
		assert.equal(ecUser.id, u.id);

		const inv = await repo.getUserInvitationToken(invToken);
		assert.equal(inv.userId, u.id);
	});

	test('verifyPasswordResetToken() consumes exactly one attempt per call', async ({ assert }) => {
		const u = await uniqueUser('vpwd');
		const { plainToken, tokenModel } = await createTestToken(u.id, TOKEN_TYPES.PASSWORD_RESET);

		// A single call consumes exactly one attempt.
		await assert.doesNotReject(() => repo.verifyPasswordResetToken(plainToken));
		assert.equal((await repo.findById(tokenModel.id))!.attempts, 1);

		// A locked token throws without incrementing further.
		await repo.update(tokenModel.id, { attempts: 5 });
		await assert.rejects(() => repo.verifyPasswordResetToken(plainToken), MaxAttemptsExceededException);
		assert.equal((await repo.findById(tokenModel.id))!.attempts, 5);

		// Invalid token
		await assert.rejects(() => repo.verifyPasswordResetToken('bad.token' as FullToken), InvalidTokenException);
	});

	test('deleteInvitationTokens()', async ({ assert }) => {
		const u = await uniqueUser('delinv');
		const { tokenModel } = await createTestToken(u.id, TOKEN_TYPES.PENDING_INVITE);

		await repo.deleteInvitationTokens(u.id);
		assert.isNull(await repo.findById(tokenModel.id));
	});

	test('lockUsableToken() returns the locked record for a valid token inside a transaction', async ({ assert }) => {
		const u = await uniqueUser('lock');
		const { plainToken, tokenModel } = await createTestToken(u.id, TOKEN_TYPES.PASSWORD_RESET);

		const locked = await withTransaction(async () => {
			return await repo.lockUsableToken(plainToken, TOKEN_TYPES.PASSWORD_RESET);
		});

		assert.equal(locked.id, tokenModel.id);
	});

	test('lockUsableToken() throws InvalidTokenException for expired, missing, or malformed tokens', async ({
		assert,
	}) => {
		const u = await uniqueUser('lockbad');
		const { plainToken } = await createTestToken(u.id, TOKEN_TYPES.PASSWORD_RESET, -1);

		// Expired token
		await assert.rejects(
			async () => withTransaction(() => repo.lockUsableToken(plainToken, TOKEN_TYPES.PASSWORD_RESET)),
			InvalidTokenException,
		);

		// Missing selector
		await assert.rejects(
			async () => withTransaction(() => repo.lockUsableToken('nosuchsel.val' as FullToken, TOKEN_TYPES.PASSWORD_RESET)),
			InvalidTokenException,
		);

		// Malformed token
		await assert.rejects(
			async () =>
				withTransaction(() => repo.lockUsableToken('malformed_token' as FullToken, TOKEN_TYPES.PASSWORD_RESET)),
			InvalidTokenException,
		);
	});
});
