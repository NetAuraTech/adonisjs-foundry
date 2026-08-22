import app from '@adonisjs/core/services/app';
import hash from '@adonisjs/core/services/hash';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';
import { GetInvitationAction } from '#actions/invitation/get_invitation_action';
import InvalidTokenException from '#exceptions/core/invalid_token_exception';
import { generateSplitToken } from '#helpers/core/crypto';
import User from '#models/auth/user';
import { TokenRepository } from '#repositories/core/token_repository';
import { TOKEN_TYPES } from '#types/core';

test.group('GetInvitationAction', () => {
	test('execute() returns user associated with the token', async ({ assert }) => {
		const action = await app.container.make(GetInvitationAction);
		const tokenRepo = await app.container.make(TokenRepository);

		const user = await User.create({ email: 'invite_get@test.com', username: 'invite_get' });
		const { selector, validator, token: fullToken } = generateSplitToken();
		const hashedValidator = await hash.make(validator);

		await tokenRepo.create({
			userId: user.id,
			type: TOKEN_TYPES.PENDING_INVITE,
			selector,
			token: hashedValidator,
			expiresAt: DateTime.now().plus({ hours: 1 }),
		});

		const foundUser = await action.execute({ token: fullToken as any });
		assert.equal(foundUser.id, user.id);
	});

	test('execute() throws on invalid token', async ({ assert }) => {
		const action = await app.container.make(GetInvitationAction);

		await assert.rejects(async () => {
			await action.execute({ token: 'invalid.token' as any });
		}, InvalidTokenException);
	});
});
