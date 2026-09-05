import { inject } from '@adonisjs/core';
import hash from '@adonisjs/core/services/hash';
import i18nManager from '@adonisjs/i18n/services/main';
import { DateTime } from 'luxon';
import { GetPreferencesAction } from '#account/actions/preferences/get_preferences_action';
import { Token } from '#auth/domain/token';
import { TOKEN_TYPES, type FullToken, type TokenType } from '#auth/enums/token_type';
import { TokenRepository } from '#auth/repositories/token_repository';
import { type MailClientMessage } from '#core/contracts/mail_client';
import { MailService } from '#core/services/mail_service';
import env from '#start/env';
import type User from '#identity/models/user';

/**
 * Data passed to the auth mail templates when rendering the HTML body.
 *
 * Mirrors the view data the previous Mailable classes produced, so the edge
 * templates keep rendering identically. The rendering locale is stamped into
 * the data by the kernel {@link MailService}, not carried here.
 */
interface AuthMailData {
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

/** Auth-domain mail payload: the kernel envelope carrying the auth template data. */
type AuthMailPayload = MailClientMessage & { data: AuthMailData };

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
 *   6. Build the domain-specific mail payload with i18n-translated strings
 *      and the flavor-aware link
 *   7. Dispatch it through the kernel {@link MailService}
 */
@inject()
export class TokenMailService {
	constructor(
		protected mailService: MailService<AuthMailPayload>,
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

		await this.mailService.send(
			{
				to: user.email,
				subject: i18n.t('auth.verify_email.mail.subject'),
				template: 'emails/auth_email',
				data: {
					app_name: env.get('APP_NAME') ?? 'AdonisJS',
					subject: i18n.t('auth.verify_email.mail.subject'),
					greeting: i18n.t('auth.verify_email.mail.greeting'),
					intro: i18n.t('auth.verify_email.mail.intro'),
					action: i18n.t('auth.verify_email.mail.action'),
					outro: i18n.t('auth.verify_email.mail.outro'),
					expiry: i18n.t('auth.verify_email.mail.expiry', { hours: 24 }),
					footer: i18n.t('auth.verify_email.mail.footer'),
					verification_link: this.mailService.buildLink(
						['auth.email_verification.execute', 'api.v1.auth.email_verification.store'],
						token,
					),
				} satisfies AuthMailData,
			},
			{ locale },
		);
	}

	/**
	 * Issues the password-reset token for a user: expires outstanding
	 * PASSWORD_RESET tokens, generates a new split token with the type-specific
	 * TTL (1 hour), hashes the validator, and persists the record.
	 *
	 * Split from the mail dispatch so the token is created synchronously inside
	 * the request while the mail itself is sent later by a queue worker.
	 *
	 * @param user - The user requesting a password reset.
	 * @returns The raw `selector.validator` token to hand to the mail flow.
	 */
	async issuePasswordResetToken(user: User): Promise<FullToken> {
		return this.issueToken(user, TOKEN_TYPES.PASSWORD_RESET, 1);
	}

	/**
	 * Sends the password-reset mail for an already-issued token.
	 *
	 * Runs in the queue worker (see {@link SendPasswordResetMailJob}), not in
	 * the HTTP request: the caller resolves the locale, builds the mail payload
	 * and dispatches it through the kernel {@link MailService}.
	 *
	 * @param user - The user requesting a password reset.
	 * @param token - The `selector.validator` token issued for this request.
	 */
	async sendPasswordResetMail(user: User, token: FullToken): Promise<void> {
		const locale = await this.resolveLocale(user);

		const i18n = i18nManager.locale(locale);

		await this.mailService.send(
			{
				to: user.email,
				subject: i18n.t('auth.reset_password.mail.subject'),
				template: 'emails/auth_email',
				data: {
					app_name: env.get('APP_NAME') ?? 'AdonisJS',
					subject: i18n.t('auth.reset_password.mail.subject'),
					greeting: i18n.t('auth.reset_password.mail.greeting'),
					intro: i18n.t('auth.reset_password.mail.intro'),
					action: i18n.t('auth.reset_password.mail.action'),
					outro: i18n.t('auth.reset_password.mail.outro'),
					expiry: i18n.t('auth.reset_password.mail.expiry', { hours: 1 }),
					footer: i18n.t('auth.reset_password.mail.footer'),
					reset_link: this.mailService.buildLink(
						['auth.reset_password.render', 'api.v1.auth.reset_password.store'],
						token,
					),
				} satisfies AuthMailData,
			},
			{ locale },
		);
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

		await this.mailService.send(
			{
				to: user.email,
				subject: i18n.t('identity.admin.users.mail.subject', { app }),
				template: 'emails/admin_invite_email',
				data: {
					app_name: app ?? 'AdonisJS',
					subject: i18n.t('identity.admin.users.mail.subject', { app }),
					greeting: i18n.t('identity.admin.users.mail.greeting'),
					intro: i18n.t('identity.admin.users.mail.intro', { app }),
					action: i18n.t('identity.admin.users.mail.action'),
					outro: i18n.t('identity.admin.users.mail.outro'),
					expiry: i18n.t('identity.admin.users.mail.expiry', { days: 7 }),
					footer: i18n.t('identity.admin.users.mail.footer'),
					accept_link: this.mailService.buildLink(
						['auth.accept_invitation.render', 'api.v1.auth.accept_invitation.store'],
						token,
					),
				} satisfies AuthMailData,
			},
			{ locale },
		);
	}

	/**
	 * Resolves the recipient's locale from their preferences, falling back to
	 * the app default through the kernel {@link MailService}.
	 *
	 * @param user - The recipient the mail is addressed to.
	 * @returns The locale to render the mail in.
	 */
	protected async resolveLocale(user: User): Promise<string> {
		const preferences = await this.getPreferencesAction.execute({ user });
		return this.mailService.resolveLocale(preferences.locale);
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
}
