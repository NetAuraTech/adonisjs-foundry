import { test } from '@japa/runner';
import AccountNotification from '#mails/account/account_notification';
import type { MailPayload } from '#types/mail';

const fixturePayload: MailPayload = {
	user: { email: 'user@example.com', locale: 'en' },
	translations: { subject: 'Test' },
};

test.group('Notification template paths', () => {
	test('AccountNotification uses account_email template', ({ assert }) => {
		const notif = new AccountNotification(fixturePayload);
		assert.equal(notif.templatePath, 'emails/account_email');
	});
});
