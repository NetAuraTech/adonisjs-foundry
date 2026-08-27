import { inject } from '@adonisjs/core';
import { DateTime } from 'luxon';
import { FullToken } from '#auth/enums/token_type';
import { TokenRepository } from '#auth/repositories/token_repository';
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
 * Resolves the token to its user, validates that the pending email is not
 * already claimed by another account, then atomically updates the email and
 * expires all outstanding email-change tokens within a transaction.
 */
@inject()
export class ConfirmEmailChangeAction {
	constructor(
		protected logService: LogService,
		protected userRepository: UserRepository,
		protected tokenRepository: TokenRepository,
	) {}

	/**
	 * Execute email change confirmation.
	 *
	 * @param payload - The full token from the confirmation link.
	 * @returns The updated {@link User} with the new email applied.
	 * @throws {EmailAlreadyExistsException} If the pending email is already claimed.
	 */
	async execute(payload: ConfirmEmailChangePayload): Promise<User> {
		const user = await this.tokenRepository.getEmailChangeUser(payload.token);

		const isEmailTaken = await this.userRepository.emailExists(user.pendingEmail!);

		if (isEmailTaken) {
			this.logService.logSecurity('email_change.failed.already_in_use', {
				userId: user.id,
				userEmail: user.email,
				pendingEmail: user.pendingEmail,
			});
			throw new EmailAlreadyExistsException(user.pendingEmail!);
		}

		const updated = await withTransaction(async () => {
			const result = await this.userRepository.update(user, {
				email: user.pendingEmail!,
				pendingEmail: null,
				emailVerifiedAt: DateTime.now(),
			});
			await this.tokenRepository.expireEmailChangeTokens(user);
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
