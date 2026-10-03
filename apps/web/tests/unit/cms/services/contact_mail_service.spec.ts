import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import { ContactMailService } from '#cms/services/contact_mail_service';
import env from '#start/env';
import { restoreMailClient, swapMailClient } from '#tests/helpers/mail';

/**
 * Unit seam for the contact-form notification of the {@link ContactMailService}.
 *
 * The localized fields must travel as a nested `fields` record in the mail
 * data (issue #401): the mail client spreads the data record into the top
 * level of the Edge context, so a flat spread of the fields is invisible to
 * the template's `@each` over `fields`.
 */
test.group('ContactMailService', () => {
	test('sendContactFormEmail() nests the localized fields in the payload', async ({ assert }) => {
		const mail = swapMailClient();
		const service = await app.container.make(ContactMailService);

		await service.sendContactFormEmail({
			name: 'Jane Doe',
			email: 'jane@example.com',
			message: 'Hello from the test suite',
		});
		restoreMailClient();

		assert.equal(mail.sent.length, 1);
		const sent = mail.sent[0];
		assert.equal(sent.to, env.get('MAIL_FROM_ADDRESS'));
		assert.equal(sent.template, 'emails/contact_form_email');
		assert.deepEqual(sent.data, {
			locale: 'en',
			app_name: 'AdonisJS Foundry',
			subject: 'New contact request',
			greeting: 'Hello,',
			intro: 'You have received a new contact request.',
			fields: {
				name: 'name: Jane Doe',
				email: 'Email: jane@example.com',
				message: 'Message: Hello from the test suite',
			},
		});
	});
});
