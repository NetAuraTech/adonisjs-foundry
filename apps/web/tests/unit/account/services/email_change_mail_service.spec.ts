import app from '@adonisjs/core/services/app';
import hash from '@adonisjs/core/services/hash';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';
import { EmailChangeMailService } from '#account/services/email_change_mail_service';
import { Token } from '#auth/domain/token';
import { TOKEN_TYPES } from '#auth/enums/token_type';
import { TokenRepository } from '#auth/repositories/token_repository';
import User from '#identity/models/user';
import { restoreMailClient, swapMailClient } from '#tests/helpers/mail';

test.group('EmailChangeMailService', () => {
	test('sendEmailChangeMails() issues a token and sends confirmation + notification mails', async ({ assert }) => {
		const mail = swapMailClient();
		const service = await app.container.make(EmailChangeMailService);
		const user = await User.create({
			email: 'emailchange_svc@test.com',
			username: 'emailchange_svc',
			password: 'pwd',
			emailVerifiedAt: DateTime.now(),
			pendingEmail: 'new_emailchange_svc@test.com',
		});

		await service.sendEmailChangeMails(user);

		restoreMailClient();

		// Confirmation goes to the pending address, notification to the current one.
		assert.equal(mail.sent.length, 2);
		assert.equal(mail.sent[0].to, 'new_emailchange_svc@test.com');
		assert.equal(mail.sent[1].to, 'emailchange_svc@test.com');

		const tokenRepo = await app.container.make(TokenRepository);
		const tokens = await tokenRepo.findMany({
			userId: user.id,
			type: TOKEN_TYPES.EMAIL_CHANGE,
		});
		assert.equal(tokens.length, 1);
	});

	test('sendEmailChangeMails() expires outstanding email-change tokens before issuing a fresh one', async ({ assert }) => {
		swapMailClient();
		const service = await app.container.make(EmailChangeMailService);
		const tokenRepo = await app.container.make(TokenRepository);
		const user = await User.create({
			email: 'emailchange_seed@test.com',
			username: 'emailchange_seed',
			password: 'pwd',
			emailVerifiedAt: DateTime.now(),
			pendingEmail: 'new_emailchange_seed@test.com',
		});

		// Seed an outstanding (valid) email-change token.
		const { selector: seedSelector, validator: seedValidator } = Token.generateSplit();
		const seedHashed = await hash.make(seedValidator);
		await tokenRepo.create({
			userId: user.id,
			type: TOKEN_TYPES.EMAIL_CHANGE,
			selector: seedSelector,
			token: seedHashed,
			expiresAt: DateTime.now().plus({ hours: 1 }),
		});

		await service.sendEmailChangeMails(user);
		restoreMailClient();

		// The seeded token is expired and a fresh one was issued: two records total.
		const records = await tokenRepo.findMany({ userId: user.id, type: TOKEN_TYPES.EMAIL_CHANGE });
		assert.equal(records.length, 2);
		assert.isNull(await tokenRepo.findBySelector(seedSelector, TOKEN_TYPES.EMAIL_CHANGE));
	});
});
