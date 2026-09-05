import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { TOKEN_TYPES, type FullToken } from '#auth/enums/token_type';
import Token from '#auth/models/token';
import { TokenMailService } from '#auth/services/token_mail_service';
import { createVerifiedUser } from '#tests/helpers/create_verified_user';
import { restoreMailClient, swapMailClient } from '#tests/helpers/mail';

/**
 * Unit seam for the password-reset split of the {@link TokenMailService}
 * (issue #286): the token is issued synchronously in the request
 * (`issuePasswordResetToken`) while the mail is sent later, by the queue
 * worker, from the pre-issued token (`sendPasswordResetMail`).
 */
test.group('TokenMailService password reset', () => {
	test('issuePasswordResetToken() persists a PASSWORD_RESET token and returns the full token', async ({ assert }) => {
		const service = await app.container.make(TokenMailService);
		const user = await createVerifiedUser({ email: 'issue_token@example.com', password: 'TestPassword123!' });

		const token = await service.issuePasswordResetToken(user);

		assert.match(token, /^\S+\.\S+$/);

		const record = await Token.query().where('type', TOKEN_TYPES.PASSWORD_RESET).where('user_id', user.id).first();
		assert.exists(record);
		assert.equal(record!.selector, token.split('.')[0]);
		assert.isAbove(record!.expiresAt!.toMillis(), Date.now());
	});

	test('issuePasswordResetToken() expires outstanding PASSWORD_RESET tokens of the user', async ({ assert }) => {
		const service = await app.container.make(TokenMailService);
		const user = await createVerifiedUser({ email: 'expire_token@example.com', password: 'TestPassword123!' });

		const first = await service.issuePasswordResetToken(user);
		const second = await service.issuePasswordResetToken(user);

		assert.notEqual(first, second);

		const firstRecord = await Token.query().where('selector', first.split('.')[0]).first();
		const secondRecord = await Token.query().where('selector', second.split('.')[0]).first();
		assert.exists(firstRecord);
		assert.exists(secondRecord);
		assert.isBelow(firstRecord!.expiresAt!.toMillis(), Date.now());
		assert.isAbove(secondRecord!.expiresAt!.toMillis(), Date.now());
	});

	test('sendPasswordResetMail() sends the mail built from the given token', async ({ assert }) => {
		const mail = swapMailClient();
		const service = await app.container.make(TokenMailService);
		const user = await createVerifiedUser({ email: 'mail_token@example.com', password: 'TestPassword123!' });

		const token = 'sent-selector.sent-validator' as FullToken;
		await service.sendPasswordResetMail(user, token);
		restoreMailClient();

		assert.equal(mail.sent.length, 1);
		assert.equal(mail.sent[0].to, user.email);
		assert.equal(mail.sent[0].template, 'emails/auth_email');
	});
});
