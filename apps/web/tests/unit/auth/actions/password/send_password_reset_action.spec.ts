import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { SendPasswordResetAction } from '#auth/actions/password/send_password_reset_action';
import { TOKEN_TYPES } from '#auth/enums/token_type';
import { TokenRepository } from '#auth/repositories/token_repository';
import User from '#identity/models/user';
import { restoreMailClient, swapMailClient } from '#tests/helpers/mail';

test.group('SendPasswordResetAction', () => {
	test('execute() issues a PASSWORD_RESET token and sends the reset mail', async ({ assert }) => {
		const mail = swapMailClient();
		const action = await app.container.make(SendPasswordResetAction);
		const user = await User.create({
			email: 'forgot@test.com',
			username: 'forgot',
			password: 'pwd',
		});

		await action.execute({ user });

		restoreMailClient();

		assert.equal(mail.sent.length, 1);
		assert.equal(mail.sent[0].to, 'forgot@test.com');

		const tokenRepo = await app.container.make(TokenRepository);
		const tokens = await tokenRepo.findMany({ userId: user.id, type: TOKEN_TYPES.PASSWORD_RESET });
		assert.equal(tokens.length, 1);
	});
});
