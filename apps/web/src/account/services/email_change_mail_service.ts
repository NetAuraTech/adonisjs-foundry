import { inject } from '@adonisjs/core';
import hash from '@adonisjs/core/services/hash';
import i18nManager from '@adonisjs/i18n/services/main';
import { DateTime } from 'luxon';
import { GetPreferencesAction } from '#account/actions/preferences/get_preferences_action';
import { Token } from '#auth/domain/token';
import { TOKEN_TYPES, type FullToken } from '#auth/enums/token_type';
import { TokenRepository } from '#auth/repositories/token_repository';
import { MailClientContract, type MailClientMessage } from '#core/contracts/mail_client';
import { routePath } from '#core/services/route_path';
import env from '#start/env';
import type User from '#identity/models/user';

/**
 * Data passed to the account mail template when rendering the HTML body.
 *
 * Mirrors the view data the previous Mailable classes produced, so the edge
 * template keeps rendering identically. The confirmation and notification
 * mails share the template, each populating its own subset of fields.
 */
interface EmailChangeMailData {
	locale: string;
	app_name: string;
	subject: string;
	greeting: string;
	intro: string;
	action: string;
	/** Closing line (confirmation mail only). */
	outro?: string;
	/** Expiry warning (confirmation mail only). */
	expiry?: string;
	/** Footer line and fallback link label (confirmation mail only). */
	footer?: string;
	/** Confirmation link (confirmation mail only). */
	confirmation_link?: string;
	/** Warning box text (notification mail only). */
	warning?: string;
	/** Support contact for the mailto box (notification mail only). */
	support?: string;
}

/**
 * Sends the mail pair of a pending email address change.
 *
 * Replaces the previous `InitiateEmailChange` event → listeners → Mailables
 * chain with one direct, traceable call per flow. The flow:
 *   1. Resolve the user's locale from their preferences
 *   2. Expire existing email-change tokens, then generate and persist a new
 *      split token (`selector`, `validator`) with a 24-hour TTL
 *   3. Send the confirmation mail (with the flavored confirmation link) to
 *      the new, pending address
 *   4. Send the notification mail to the current address
 *
 * Delivery goes through the kernel {@link MailClientContract}.
 */
@inject()
export class EmailChangeMailService {
	constructor(
		protected mailClient: MailClientContract,
		protected getPreferencesAction: GetPreferencesAction,
		protected tokenRepository: TokenRepository,
	) {}

	/**
	 * Issues the email-change token and delivers both mails for the user's
	 * pending email address change.
	 *
	 * @param user - The user whose `pendingEmail` was just set.
	 */
	async sendEmailChangeMails(user: User): Promise<void> {
		const locale = await this.resolveLocale(user);
		const token = await this.issueEmailChangeToken(user);
		const i18n = i18nManager.locale(locale);

		await this.send({
			to: user.pendingEmail!,
			subject: i18n.t('settings.email.change.mail.confirm.subject'),
			template: 'emails/account_email',
			data: {
				locale,
				app_name: env.get('APP_NAME') ?? 'AdonisJS',
				subject: i18n.t('settings.email.change.mail.confirm.subject'),
				greeting: i18n.t('settings.email.change.mail.confirm.greeting'),
				intro: i18n.t('settings.email.change.mail.confirm.intro', { email: user.pendingEmail }),
				action: i18n.t('settings.email.change.mail.confirm.action'),
				outro: i18n.t('settings.email.change.mail.confirm.outro'),
				expiry: i18n.t('settings.email.change.mail.confirm.expiry', { hours: 24 }),
				footer: i18n.t('settings.email.change.mail.confirm.footer'),
				confirmation_link: this.buildLink(['account.email_change.render'], token),
			} satisfies EmailChangeMailData,
		});

		await this.send({
			to: user.email,
			subject: i18n.t('settings.email.change.mail.notification.subject'),
			template: 'emails/account_email',
			data: {
				locale,
				app_name: env.get('APP_NAME') ?? 'AdonisJS',
				subject: i18n.t('settings.email.change.mail.notification.subject'),
				greeting: i18n.t('settings.email.change.mail.notification.greeting'),
				intro: i18n.t('settings.email.change.mail.notification.intro', {
					old: user.email,
					new: user.pendingEmail,
				}),
				warning: i18n.t('settings.email.change.mail.notification.warning'),
				action: i18n.t('settings.email.change.mail.notification.action'),
				support: env.get('MAIL_FROM_ADDRESS'),
			} satisfies EmailChangeMailData,
		});
	}

	/**
	 * Resolves the user's locale from their preferences, falling back to `en`.
	 */
	protected async resolveLocale(user: User): Promise<string> {
		const preferences = await this.getPreferencesAction.execute({ user });
		return preferences.locale || 'en';
	}

	/**
	 * Expires outstanding email-change tokens, generates a new split token,
	 * hashes the validator, and persists the record.
	 *
	 * @param user - The token owner.
	 * @returns The raw `selector.validator` token to hand to the user.
	 */
	protected async issueEmailChangeToken(user: User): Promise<FullToken> {
		await this.tokenRepository.expireTokensByType(user, TOKEN_TYPES.EMAIL_CHANGE);

		const { selector, validator, token } = Token.generateSplit();
		const hashedValidator = await hash.make(validator);

		await this.tokenRepository.create({
			userId: user.id,
			type: TOKEN_TYPES.EMAIL_CHANGE,
			selector,
			token: hashedValidator,
			attempts: 0,
			expiresAt: DateTime.now().plus({ hours: 24 }),
		});

		return token;
	}

	/**
	 * Builds the mail link for the current flavor.
	 *
	 * The full and `inertia` flavors link to the session page; the headless
	 * `api` flavor has no front surface, in which case the link is empty and
	 * the template omits the button. The first registered route wins.
	 *
	 * @param routeNames - Candidate route names, in priority order.
	 * @param token - The token carried by the link.
	 * @returns The absolute URL, or an empty string when no candidate is
	 *   registered.
	 */
	protected buildLink(routeNames: string[], token: FullToken): string {
		for (const name of routeNames) {
			const path = routePath(name, { token });
			if (path) return `${env.get('APP_URL')}${path}`;
		}
		return '';
	}

	protected send(message: MailClientMessage): Promise<void> {
		return this.mailClient.send(message);
	}
}
