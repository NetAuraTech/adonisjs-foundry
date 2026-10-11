import { inject } from '@adonisjs/core';
import i18nManager from '@adonisjs/i18n/services/main';
import { GetPreferencesAction } from '#account/actions/preferences/get_preferences_action';
import { MAIL_SPECS } from '#core/mail_specs';
import { MailService } from '#core/services/mail_service';
import { UserRepository } from '#identity/repositories/user_repository';
import type { ContactFormSubmission } from '#cms/types/page';
import type { MailMessage } from '#core/types/mail';

/**
 * Sends the contact-form notification mail to the site administrator.
 *
 * Replaces the previous `ContactFormSubmitted` event → listener → Mailable
 * chain with one direct, traceable call per submission. The recipient is the
 * address configured as `MAIL_FROM_ADDRESS`, passed in by the transport; when
 * that address belongs to a known user, their preference locale drives the
 * mail translations, with the kernel fallback applied in exactly one place
 * ({@link MailService.resolveLocale}).
 *
 * The locale, envelope and dispatch go through the kernel {@link MailService}
 * like every other mail — the kernel's `contactForm` row of the spec catalog
 * owns the subject (computed once) and the envelope i18n keys. Only the
 * per-field value rendering stays domain-side: each form field is translated
 * individually with its submission value, which the static spec pattern does
 * not express.
 */
@inject()
export class ContactMailService {
	constructor(
		protected mailService: MailService<MailMessage>,
		protected getPreferencesAction: GetPreferencesAction,
		protected userRepository: UserRepository,
	) {}

	/**
	 * Renders and delivers the contact-form notification.
	 *
	 * The localized fields ride the payload as a nested `fields` record
	 * (issue #401): the mail client spreads the data record into the top
	 * level of the Edge context, so a flat spread would be invisible to the
	 * template's `@each` over `fields`.
	 *
	 * @param submission - The validated contact form fields.
	 * @param recipient - The notification recipient, read by the transport
	 *   from `MAIL_FROM_ADDRESS`.
	 */
	async sendContactFormEmail(submission: ContactFormSubmission, recipient: string): Promise<void> {
		let locale: string | undefined;

		const admin = await this.userRepository.findByEmail(recipient);
		if (admin) {
			const preferences = await this.getPreferencesAction.execute({ user: admin });
			locale = preferences.locale;
		}

		const resolved = this.mailService.resolveLocale(locale);

		const i18n = i18nManager.locale(resolved);

		const fields: Record<string, string> = {};
		for (const [key, value] of Object.entries(submission)) {
			fields[key] = i18n.t(`cms.page.contact_form.mail.${key}`, { value }, `${key}: ${value}`);
		}

		await this.mailService.send(
			this.mailService.buildMail(MAIL_SPECS.contactForm, { to: recipient, locale: resolved, data: { fields } }),
			{ locale: resolved },
		);
	}
}
