import { inject } from '@adonisjs/core';
import { Token } from '#auth/domain/token';
import { TOKEN_TYPES } from '#auth/enums/token_type';
import { TokenRepository } from '#auth/repositories/token_repository';
import { type ResetPasswordPayload } from '#auth/types/auth';
import { withTransaction } from '#core/services/with_transaction';
import { UserRepository } from '#identity/repositories/user_repository';
import { LogService } from '#log/services/log_service';
import type User from '#identity/models/user';

/**
 * Reset a user password using a verified reset token.
 *
 * Resolves the user from the reset token — consuming exactly one attempt
 * increment (see {@link TokenRepository.checkAttempts}) — then updates the
 * password and expires all outstanding reset tokens atomically within a
 * transaction. The token row is re-acquired with an exclusive lock as the
 * first query of the transaction, so a concurrent double-use is serialized:
 * the second presentation sees the expired token and is rejected
 * (see /docs/agents/toctou-protection.md).
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
		const user = await this.tokenRepository.getPasswordResetUser(payload.token);

		await withTransaction(async () => {
			await this.tokenRepository.lockUsableToken(payload.token, TOKEN_TYPES.PASSWORD_RESET);
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
