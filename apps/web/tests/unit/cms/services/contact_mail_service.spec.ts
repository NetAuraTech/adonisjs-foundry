import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import UserPreference from '#account/models/user_preference';
import { ContactMailService } from '#cms/services/contact_mail_service';
import User from '#identity/models/user';
import { restoreMailClient, swapMailClient } from '#tests/helpers/mail';

/**
 * Unit seam for the contact-form notification of the {@link ContactMailService}.
 *
 * The locale, envelope and dispatch go through the kernel mail service (the
 * `contactForm` row of the kernel spec catalog); the recipient is passed in by
 * the transport, so the service — and this seam — never touch the global env.
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

		await service.sendContactFormEmail(
			{
				name: 'Jane Doe',
				email: 'jane@example.com',
				message: 'Hello from the test suite',
			},
			'admin@example.com',
		);
		restoreMailClient();

		assert.equal(mail.sent.length, 1);
		const sent = mail.sent[0];
		assert.equal(sent.to, 'admin@example.com');
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

	test("sendContactFormEmail() renders the mail in the recipient user's preferred locale", async ({ assert }) => {
		const mail = swapMailClient();
		const service = await app.container.make(ContactMailService);
		const admin = await User.create({
			email: 'fr_contact_admin@example.com',
			username: 'fr_contact_admin',
			password: 'pwd',
		});
		await UserPreference.create({ userId: admin.id, theme: 'light', locale: 'fr' });

		await service.sendContactFormEmail({ message: 'Bonjour de la suite de tests' }, 'fr_contact_admin@example.com');
		restoreMailClient();

		assert.equal(mail.sent.length, 1);
		const sent = mail.sent[0];
		assert.equal(sent.to, 'fr_contact_admin@example.com');
		assert.equal(sent.subject, 'Nouvelle demande de contact');
		assert.deepEqual(sent.data, {
			locale: 'fr',
			app_name: 'AdonisJS Foundry',
			subject: 'Nouvelle demande de contact',
			greeting: 'Bonjour,',
			intro: 'Vous avez reçu une nouvelle demande de contact.',
			fields: {
				message: 'Message: Bonjour de la suite de tests',
			},
		});
	});

	test('sendContactFormEmail() falls back to the app default locale for an unknown recipient', async ({ assert }) => {
		const mail = swapMailClient();
		const service = await app.container.make(ContactMailService);

		await service.sendContactFormEmail({ message: 'Hello' }, 'unknown@example.com');
		restoreMailClient();

		assert.equal(mail.sent.length, 1);
		const sent = mail.sent[0];
		assert.equal(sent.to, 'unknown@example.com');
		assert.equal(sent.data?.locale, 'en');
		assert.equal(sent.subject, 'New contact request');
	});
});
