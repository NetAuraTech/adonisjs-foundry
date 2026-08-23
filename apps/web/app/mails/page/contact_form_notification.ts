import { BaseNotification } from '#mails/base_notification';

export default class ContactFormNotification extends BaseNotification {
	get templatePath(): string {
		return 'emails/contact_form_email';
	}
}
