import { inject } from '@adonisjs/core';
import i18nManager from '@adonisjs/i18n/services/main';
import { GetPreferencesAction } from '#account/actions/preferences/get_preferences_action';
import { MailClientContract, type MailClientMessage } from '#core/contracts/mail_client';
import { UserRepository } from '#identity/repositories/user_repository';
import env from '#start/env';
import type { ContactFormSubmission } from '#cms/types/page';

/**
 * Sends the contact-form notification mail to the site administrator.
 *
 * Replaces the previous `ContactFormSubmitted` event → listener → Mailable
 * chain with one direct, traceable call per submission. The recipient is the
 * address configured as `MAIL_FROM_ADDRESS`; their preference locale drives
 * the mail translations when that address belongs to a known user.
 */
@inject()
export class ContactMailService {
	constructor(
		protected mailClient: MailClientContract,
		protected getPreferencesAction: GetPreferencesAction,
		protected userRepository: UserRepository,
	) {}

	/**
	 * Renders and delivers the contact-form notification.
	 *
	 * @param submission - The validated contact form fields.
	 */
	async sendContactFormEmail(submission: ContactFormSubmission): Promise<void> {
		const recipient = env.get('MAIL_FROM_ADDRESS');
		let locale = 'en';

		const admin = await this.userRepository.findByEmail(recipient);
		if (admin) {
			const preferences = await this.getPreferencesAction.execute({ user: admin });
			locale = preferences.locale || 'en';
		}

		const i18n = i18nManager.locale(locale);

		const fields: Record<string, string> = {};
		for (const [key, value] of Object.entries(submission)) {
			fields[key] = i18n.t(`cms.page.contact_form.mail.${key}`, { value }, `${key}: ${value}`);
		}

		await this.mailClient.send({
			to: recipient,
			subject: i18n.t('cms.page.contact_form.mail.subject'),
			template: 'emails/contact_form_email',
			data: {
				locale,
				app_name: env.get('APP_NAME') ?? 'AdonisJS',
				subject: i18n.t('cms.page.contact_form.mail.subject'),
				greeting: i18n.t('cms.page.contact_form.mail.greeting'),
				intro: i18n.t('cms.page.contact_form.mail.intro'),
				...fields,
			},
		} satisfies MailClientMessage);
	}
}
