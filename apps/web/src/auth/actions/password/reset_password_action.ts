import { inject } from '@adonisjs/core';
import { Token } from '#auth/domain/token';
import { TokenRepository } from '#auth/repositories/token_repository';
import { type ResetPasswordPayload } from '#auth/types/auth';
import { withTransaction } from '#core/services/with_transaction';
import { UserRepository } from '#identity/repositories/user_repository';
import { LogService } from '#services/logging/log_service';
import type User from '#identity/models/user';

/**
 * Reset a user password using a verified reset token.
 *
 * Increments the attempt counter, validates the token, updates the password,
 * and expires all outstanding reset tokens atomically within a transaction.
 */
@inject()
export class ResetPasswordAction {
	constructor(
		protected logService: LogService,
		protected userRepository: UserRepository,
		protected tokenRepository: TokenRepository,
	) {}

	/**
	 * Execute password reset.
	 *
	 * @param payload - The full reset token and the new password.
	 * @returns The updated {@link User} with the new password.
	 */
	async execute(payload: ResetPasswordPayload): Promise<User> {
		await this.tokenRepository.incrementAttempts(payload.token);
		await this.tokenRepository.checkAttempts(payload.token);

		const user = await this.tokenRepository.getPasswordResetUser(payload.token);

		await withTransaction(async () => {
			await this.userRepository.updatePassword(user, payload.password);
			await this.tokenRepository.expirePasswordResetTokens(user);
		});

		this.logService.logAuth('password.reset.success', {
			userId: user.id,
			token: Token.mask(payload.token),
		});

		return user;
	}
}
