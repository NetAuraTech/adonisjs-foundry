import { inject } from '@adonisjs/core';
import hash from '@adonisjs/core/services/hash';
import i18nManager from '@adonisjs/i18n/services/main';
import { DateTime } from 'luxon';
import { GetPreferencesAction } from '#account/actions/preferences/get_preferences_action';
import { Token } from '#auth/domain/token';
import { TOKEN_TYPES, type FullToken, type TokenType } from '#auth/enums/token_type';
import { TokenRepository } from '#auth/repositories/token_repository';
import { MailClientContract, type MailClientMessage } from '#core/contracts/mail_client';
import { routePath } from '#core/services/route_path';
import env from '#start/env';
import type User from '#identity/models/user';

/**
 * Data passed to the auth mail templates when rendering the HTML body.
 *
 * Mirrors the view data the previous Mailable classes produced, so the edge
 * templates keep rendering identically.
 */
interface AuthMailData {
	locale: string;
	app_name: string;
	subject: string;
	greeting?: string;
	intro?: string;
	action?: string;
	outro?: string;
	expiry?: string;
	footer?: string;
	/** Verification link (email verification flow). */
	verification_link?: string;
	/** Password-reset link (password reset flow). */
	reset_link?: string;
	/** Invitation acceptance link (invitation flow). */
	accept_link?: string;
}

/**
 * Issues auth-domain tokens and sends their mail directly.
 *
 * Replaces the previous events → listeners → Mailables chain with one direct,
 * traceable call per flow. Every flow shares the same orchestration:
 *   1. Resolve the user's locale from their preferences
 *   2. Expire existing tokens of the same type
 *   3. Generate a split token (`selector`, `validator`) with a type-specific TTL
 *   4. Hash the validator portion
 *   5. Persist the token record
 *   6. Build the mail envelope with i18n-translated strings and the flavor-aware link
 *   7. Deliver it through the kernel {@link MailClientContract}
 */
@inject()
export class TokenMailService {
	constructor(
		protected mailClient: MailClientContract,
		protected getPreferencesAction: GetPreferencesAction,
		protected tokenRepository: TokenRepository,
	) {}

	/**
	 * Sends the email-verification mail for a freshly registered user.
	 *
	 * @param user - The user whose email should be verified.
	 */
	async sendVerificationEmail(user: User): Promise<void> {
		const locale = await this.resolveLocale(user);
		const token = await this.issueToken(user, TOKEN_TYPES.EMAIL_VERIFICATION, 24);

		const i18n = i18nManager.locale(locale);

		await this.send({
			to: user.email,
			subject: i18n.t('auth.verify_email.mail.subject'),
			template: 'emails/auth_email',
			data: {
				locale,
				app_name: env.get('APP_NAME') ?? 'AdonisJS',
				subject: i18n.t('auth.verify_email.mail.subject'),
				greeting: i18n.t('auth.verify_email.mail.greeting'),
				intro: i18n.t('auth.verify_email.mail.intro'),
				action: i18n.t('auth.verify_email.mail.action'),
				outro: i18n.t('auth.verify_email.mail.outro'),
				expiry: i18n.t('auth.verify_email.mail.expiry', { hours: 24 }),
				footer: i18n.t('auth.verify_email.mail.footer'),
				verification_link: this.buildLink(
					['auth.email_verification.execute', 'api.v1.auth.email_verification.store'],
					token,
				),
			} satisfies AuthMailData,
		});
	}

	/**
	 * Sends the password-reset mail for a user.
	 *
	 * @param user - The user requesting a password reset.
	 */
	async sendPasswordResetEmail(user: User): Promise<void> {
		const locale = await this.resolveLocale(user);
		const token = await this.issueToken(user, TOKEN_TYPES.PASSWORD_RESET, 1);

		const i18n = i18nManager.locale(locale);

		await this.send({
			to: user.email,
			subject: i18n.t('auth.reset_password.mail.subject'),
			template: 'emails/auth_email',
			data: {
				locale,
				app_name: env.get('APP_NAME') ?? 'AdonisJS',
				subject: i18n.t('auth.reset_password.mail.subject'),
				greeting: i18n.t('auth.reset_password.mail.greeting'),
				intro: i18n.t('auth.reset_password.mail.intro'),
				action: i18n.t('auth.reset_password.mail.action'),
				outro: i18n.t('auth.reset_password.mail.outro'),
				expiry: i18n.t('auth.reset_password.mail.expiry', { hours: 1 }),
				footer: i18n.t('auth.reset_password.mail.footer'),
				reset_link: this.buildLink(['auth.reset_password.render', 'api.v1.auth.reset_password.store'], token),
			} satisfies AuthMailData,
		});
	}

	/**
	 * Sends the invitation mail for a pending user.
	 *
	 * @param user - The pending user that was invited.
	 */
	async sendInvitationEmail(user: User): Promise<void> {
		const locale = await this.resolveLocale(user);
		const token = await this.issueToken(user, TOKEN_TYPES.PENDING_INVITE, 7 * 24);

		const i18n = i18nManager.locale(locale);
		const app = env.get('APP_NAME');

		await this.send({
			to: user.email,
			subject: i18n.t('admin.users.mail.subject', { app }),
			template: 'emails/admin_invite_email',
			data: {
				locale,
				app_name: app ?? 'AdonisJS',
				subject: i18n.t('admin.users.mail.subject', { app }),
				greeting: i18n.t('admin.users.mail.greeting'),
				intro: i18n.t('admin.users.mail.intro', { app }),
				action: i18n.t('admin.users.mail.action'),
				outro: i18n.t('admin.users.mail.outro'),
				expiry: i18n.t('admin.users.mail.expiry', { days: 7 }),
				footer: i18n.t('admin.users.mail.footer'),
				accept_link: this.buildLink(['auth.accept_invitation.render', 'api.v1.auth.accept_invitation.store'], token),
			} satisfies AuthMailData,
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
	 * Expires outstanding tokens of the same type, generates a new split token,
	 * hashes the validator, and persists the record.
	 *
	 * @param user - The token owner.
	 * @param type - The token type to issue.
	 * @param expiresInHours - Token lifetime in hours.
	 * @returns The raw `selector.validator` token to hand to the user.
	 */
	protected async issueToken(user: User, type: TokenType, expiresInHours: number): Promise<FullToken> {
		await this.tokenRepository.expireTokensByType(user, type);

		const { selector, validator, token } = Token.generateSplit();
		const hashedValidator = await hash.make(validator);

		await this.tokenRepository.create({
			userId: user.id,
			type,
			selector,
			token: hashedValidator,
			attempts: 0,
			expiresAt: DateTime.now().plus({ hours: expiresInHours }),
		});

		return token;
	}

	/**
	 * Builds the mail link for the current flavor.
	 *
	 * The full flavor links to the session pages; the headless `api` flavor
	 * falls back to the token API endpoints. The first registered route wins.
	 *
	 * @param routeNames - Candidate route names, in priority order.
	 * @param token - The token carried by the link.
	 * @returns The absolute URL, or an empty string when no candidate is
	 *   registered (defensive — at least one route is always registered).
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
