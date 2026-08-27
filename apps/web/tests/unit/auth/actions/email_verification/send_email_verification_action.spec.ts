import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { SendEmailVerificationAction } from '#auth/actions/email_verification/send_email_verification_action';
import { TOKEN_TYPES } from '#auth/enums/token_type';
import { TokenRepository } from '#auth/repositories/token_repository';
import User from '#identity/models/user';
import { restoreMailClient, swapMailClient } from '#tests/helpers/mail';

test.group('SendEmailVerificationAction', () => {
	test('execute() issues an EMAIL_VERIFICATION token and sends the verification mail', async ({ assert }) => {
		const mail = swapMailClient();
		const action = await app.container.make(SendEmailVerificationAction);
		const user = await User.create({
			email: 'verify_send@test.com',
			username: 'verify_send',
			password: 'pwd',
		});

		await action.execute({ user });

		restoreMailClient();

		assert.equal(mail.sent.length, 1);
		assert.equal(mail.sent[0].to, 'verify_send@test.com');

		const tokenRepo = await app.container.make(TokenRepository);
		const tokens = await tokenRepo.findMany({
			userId: user.id,
			type: TOKEN_TYPES.EMAIL_VERIFICATION,
		});
		assert.equal(tokens.length, 1);
	});
});
