import { test } from '@japa/runner';
import ContactFormNotification from '#mails/page/contact_form_notification';
import type { MailPayload } from '#types/mail';

const fixturePayload: MailPayload = {
	user: { email: 'user@example.com', locale: 'en' },
	translations: { subject: 'Test' },
};

/**
 * CMS-only notification template-path tests, split out of
 * `tests/unit/mails/notifications.spec.ts` so the `inertia` flavor can prune
 * them alongside the contact-form mail.
 */
test.group('Notification template paths (CMS)', () => {
	test('ContactFormNotification uses contact_form_email template', ({ assert }) => {
		const notif = new ContactFormNotification(fixturePayload);
		assert.equal(notif.templatePath, 'emails/contact_form_email');
	});
});
