import { inject } from '@adonisjs/core';
import { DateTime } from 'luxon';
import { Token } from '#auth/domain/token';
import { TOKEN_TYPES, FullToken } from '#auth/enums/token_type';
import InvalidTokenException from '#auth/exceptions/invalid_token_exception';
import { TokenRepository } from '#auth/repositories/token_repository';
import { TokenService } from '#auth/services/token_service';
import EmailAlreadyExistsException from '#core/exceptions/email_already_exists_exception';
import { withTransaction } from '#core/services/with_transaction';
import User from '#identity/models/user';
import { UserRepository } from '#identity/repositories/user_repository';
import { LogService } from '#log/services/log_service';

interface ConfirmEmailChangePayload {
	token: FullToken;
}

/**
 * Confirm a pending email address change using a verified token.
 *
 * Resolves the token to its user through the {@link TokenService} — the user
 * must still carry the pending email, otherwise the token is rejected —
 * validates that the pending email is not already claimed by another
 * account, then atomically updates the email and expires all outstanding
 * email-change tokens within a transaction.
 */
@inject()
export class ConfirmEmailChangeAction {
	constructor(
		protected logService: LogService,
		protected userRepository: UserRepository,
		protected tokenService: TokenService,
		protected tokenRepository: TokenRepository,
	) {}

	/**
	 * Execute email change confirmation.
	 *
	 * @param payload - The full token from the confirmation link.
	 * @returns The updated {@link User} with the new email applied.
	 * @throws {InvalidTokenException} If the token is invalid, expired, or the
	 *   user no longer has a pending email.
	 * @throws {MaxAttemptsExceededException} If the token is locked.
	 * @throws {EmailAlreadyExistsException} If the pending email is already claimed.
	 */
	async execute(payload: ConfirmEmailChangePayload): Promise<User> {
		const user = await this.tokenService.resolveUser(payload.token, TOKEN_TYPES.EMAIL_CHANGE);

		if (!user.pendingEmail) {
			this.logService.logAuth('core.token.invalid', {
				userId: user.id,
				userEmail: user.email,
				token: Token.mask(payload.token),
			});
			throw new InvalidTokenException();
		}

		const isEmailTaken = await this.userRepository.emailExists(user.pendingEmail);

		if (isEmailTaken) {
			this.logService.logSecurity('email_change.failed.already_in_use', {
				userId: user.id,
				userEmail: user.email,
				pendingEmail: user.pendingEmail,
			});
			throw new EmailAlreadyExistsException(user.pendingEmail);
		}

		const updated = await withTransaction(async () => {
			const result = await this.userRepository.update(user, {
				email: user.pendingEmail!,
				pendingEmail: null,
				emailVerifiedAt: DateTime.now(),
			});
			await this.tokenRepository.expireTokensByType(user, TOKEN_TYPES.EMAIL_CHANGE);
			return result;
		});

		if (updated) {
			this.logService.logAuth('email_change.confirmed', {
				userId: user.id,
				userEmail: updated.email,
			});
			return updated;
		}

		return user;
	}
}
